// Quote + book orchestration (Case 2: we are the seller and pay both providers).
//
// Order of operations, and why, is documented in README.md. In short:
//  - Duffel offer is holdable  -> hold flight, book hotel, pay the hold. Nothing is paid for until
//    both items are secured, and the only irreversible step (paying the airline) comes last.
//  - Duffel offer is instant-pay only -> book hotel first (cancellable), then pay for the flight.
const crypto = require('crypto');
const trip = require('./trip');
const duffel = require('./duffel');
const liteapi = require('./liteapi');
const log = require('./log');

const quotes = new Map(); // quoteId -> quote. In memory only: restarting the server drops quotes.

const flag = (name) => process.env[name] === '1';
const cents = (amount) => Math.round(Number(amount) * 100);
const money = (c) => (c / 100).toFixed(2);
const errText = (err) => err?.message || String(err);

// ---------- quote ----------

function describeFlight(offer) {
  const segments = offer.slices[0].segments;
  const first = segments[0];
  const last = segments[segments.length - 1];
  const pr = offer.payment_requirements || {};
  return {
    offerId: offer.id,
    airline: offer.owner?.name,
    flightNumbers: segments.map((s) => `${s.marketing_carrier.iata_code}${s.marketing_carrier_flight_number}`),
    origin: first.origin.iata_code,
    destination: last.destination.iata_code,
    departingAt: first.departing_at,
    arrivingAt: last.arriving_at,
    stops: segments.length - 1,
    amount: offer.total_amount,
    currency: offer.total_currency,
    holdable: pr.requires_instant_payment === false,
    paymentRequiredBy: pr.payment_required_by || null,
    priceGuaranteeExpiresAt: pr.price_guarantee_expires_at || null,
    expiresAt: offer.expires_at,
  };
}

function describeHotel(prebookData, searchPick, name) {
  // The prebook response carries the authoritative rate; fall back to the search rate for display.
  const rate = prebookData.roomTypes?.[0]?.rates?.[0] || searchPick?.rate || {};
  const policies = rate.cancellationPolicies || searchPick?.rate?.cancellationPolicies || {};
  const refundable = policies.refundableTag === 'RFN';
  return {
    hotelId: prebookData.hotelId,
    name: name || null,
    roomName: rate.name || searchPick?.rate?.name || null,
    boardName: rate.boardName || searchPick?.rate?.boardName || null,
    checkin: prebookData.checkin || trip.hotel.checkin,
    checkout: prebookData.checkout || trip.hotel.checkout,
    amount: String(prebookData.price),
    currency: prebookData.currency,
    refundable,
    refundableTag: policies.refundableTag || null,
    // Earliest time a cancellation charge applies (GMT), for refundable rates.
    freeCancellationUntil: refundable ? policies.cancelPolicyInfos?.[0]?.cancelTime || null : null,
    // LiteAPI's prebook response has no expiry field, so none is reported.
    expiresAt: null,
  };
}

function totalOf(flight, hotel) {
  if (flight.currency !== hotel.currency) return null; // cannot add two currencies
  return { amount: money(cents(flight.amount) + cents(hotel.amount)), currency: flight.currency };
}

function store(flight, hotel, hotelOfferId) {
  const q = {
    id: crypto.randomUUID(),
    state: 'open', // open -> booking -> booked (back to open if a booking attempt fails)
    createdAt: new Date().toISOString(),
    flight,
    hotel,
    hotelOfferId, // internal: not sent to the browser
  };
  quotes.set(q.id, q);
  return q;
}

function publicQuote(q) {
  return {
    quoteId: q.id,
    flight: q.flight,
    hotel: q.hotel,
    total: totalOf(q.flight, q.hotel),
    expiresAt: q.flight.expiresAt, // hotel prebook has no reported expiry
  };
}

// Picks the cheapest offer, preferring (1) holdable with a price guarantee, (2) holdable, (3) any.
// Why the guarantee: Duffel's test data marks every offer requires_instant_payment=false, but only
// some airlines really allow a hold, and without a guarantee the price may change before we pay.
function pickOffer(offers) {
  const cheapest = (list) => list.reduce((a, b) => (Number(a.total_amount) <= Number(b.total_amount) ? a : b));
  const holdable = offers.filter((o) => o.payment_requirements?.requires_instant_payment === false);
  const guaranteed = holdable.filter((o) => o.payment_requirements?.price_guarantee_expires_at);
  return cheapest(guaranteed.length ? guaranteed : holdable.length ? holdable : offers);
}

async function createQuote() {
  const [offers, rates] = await Promise.all([duffel.searchOffers(trip), liteapi.searchRates(trip)]);
  if (!offers.length) throw new Error('Duffel returned no flight offers for this route and date');
  const pick = liteapi.pickRate(rates);
  if (!pick) throw new Error('LiteAPI returned no rates for this hotel and dates');

  const offer = pickOffer(offers);
  const [prebookData, name] = await Promise.all([liteapi.prebook(pick.offerId), liteapi.hotelName(trip.hotel.hotelId)]);

  const q = store(describeFlight(offer), describeHotel(prebookData, pick, name), pick.offerId);
  log.write({
    provider: 'app', op: 'quote', event: 'created', quoteId: q.id,
    flightOfferId: q.flight.offerId, flightAmount: q.flight.amount, flightCurrency: q.flight.currency, holdable: q.flight.holdable,
    hotelAmount: q.hotel.amount, hotelCurrency: q.hotel.currency, refundableTag: q.hotel.refundableTag,
  });
  return publicQuote(q);
}

// ---------- book ----------

const REQUIRED = ['title', 'givenName', 'familyName', 'gender', 'bornOn', 'email', 'phoneNumber'];

function validateTraveller(t) {
  if (!t || typeof t !== 'object') return 'traveller is required';
  const missing = REQUIRED.filter((k) => typeof t[k] !== 'string' || !t[k].trim());
  if (missing.length) return `traveller is missing: ${missing.join(', ')}`;
  if (!['mr', 'mrs', 'ms', 'miss'].includes(t.title)) return 'title must be mr, mrs, ms or miss';
  if (!['m', 'f'].includes(t.gender)) return 'gender must be m or f';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t.bornOn)) return 'bornOn must be YYYY-MM-DD';
  if (!/^\S+@\S+\.\S+$/.test(t.email)) return 'email looks invalid';
  if (!/^\+\d{7,15}$/.test(t.phoneNumber)) return 'phoneNumber must be international, e.g. +442080160509';
  return null;
}

async function attempt(fn) {
  try {
    return { ok: true, value: await fn() };
  } catch (err) {
    return { ok: false, error: errText(err), code: err?.code };
  }
}

// Fetches the current Duffel offer and a fresh hotel prebook for a stored quote.
async function refresh(q) {
  const [flight, hotel] = await Promise.allSettled([duffel.getOffer(q.flight.offerId), liteapi.prebook(q.hotelOfferId)]);
  return { flight, hotel };
}

function bookingFailure(failed, error, extra) {
  return { http: 502, body: { ok: false, failed, error, ...extra } };
}

async function book(quoteId, traveller) {
  const q = quotes.get(quoteId);
  if (!q) return { http: 404, body: { ok: false, error: 'unknown_quote', message: 'Quote not found. Reload the page for a fresh one.' } };
  const invalid = validateTraveller(traveller);
  if (invalid) return { http: 400, body: { ok: false, error: 'invalid_traveller', message: invalid } };
  if (q.state === 'booking') return { http: 409, body: { ok: false, error: 'in_progress', message: 'This quote is already being booked.' } };
  if (q.state === 'booked') return { http: 409, body: { ok: false, error: 'already_booked', message: 'This quote was already booked.' } };

  q.state = 'booking';
  log.write({ provider: 'app', op: 'book', event: 'start', quoteId });
  try {
    const result = await run(q, traveller);
    if (result.body.ok) q.state = 'booked';
    return result;
  } finally {
    if (q.state === 'booking') q.state = 'open';
  }
}

async function run(q, traveller) {
  // Step 1: re-check both prices. Book NOTHING if either changed.
  const fresh = await refresh(q);
  if (fresh.flight.status === 'rejected') {
    const err = fresh.flight.reason;
    const gone = err.status === 404 || err.code === 'offer_no_longer_available';
    return gone
      ? { http: 410, body: { ok: false, error: 'quote_expired', message: 'The flight offer has expired. Reload for a fresh quote. Nothing was booked.' } }
      : bookingFailure('flight', `Could not re-check the flight offer: ${errText(err)}`, { flightState: 'nothing booked', hotelState: 'nothing booked' });
  }
  if (fresh.hotel.status === 'rejected') {
    return bookingFailure('hotel', `Could not re-check the hotel rate: ${errText(fresh.hotel.reason)}`, { flightState: 'nothing booked', hotelState: 'nothing booked' });
  }
  const offer = fresh.flight.value;
  const prebook = fresh.hotel.value;

  const oldFlight = { amount: q.flight.amount, currency: q.flight.currency };
  const newFlight = { amount: offer.total_amount, currency: offer.total_currency };
  const oldHotel = { amount: q.hotel.amount, currency: q.hotel.currency };
  const newHotel = { amount: String(prebook.price), currency: prebook.currency };
  const flightChanged = cents(oldFlight.amount) !== cents(newFlight.amount) || oldFlight.currency !== newFlight.currency;
  const hotelChanged = cents(oldHotel.amount) !== cents(newHotel.amount) || oldHotel.currency !== newHotel.currency;
  const termsChanged = Boolean(prebook.cancellationChanged || prebook.boardChanged);

  if (flightChanged || hotelChanged || termsChanged) {
    const fresher = store(describeFlight(offer), describeHotel(prebook, null, q.hotel.name), q.hotelOfferId);
    // keep the display facts the prebook response may not repeat
    fresher.hotel.roomName = fresher.hotel.roomName || q.hotel.roomName;
    fresher.hotel.boardName = fresher.hotel.boardName || q.hotel.boardName;
    log.write({
      provider: 'app', op: 'book', event: 'price_changed_nothing_booked', quoteId: q.id, newQuoteId: fresher.id,
      oldFlight, newFlight, oldHotel, newHotel, termsChanged,
    });
    return {
      http: 409,
      body: {
        ok: false,
        error: 'price_changed',
        message: 'The price or terms changed since your quote. Nothing was booked.',
        changes: { flight: flightChanged ? { old: oldFlight, new: newFlight } : null, hotel: hotelChanged ? { old: oldHotel, new: newHotel } : null, termsChanged },
        oldTotal: totalOf(q.flight, q.hotel),
        newTotal: totalOf(fresher.flight, fresher.hotel),
        quote: publicQuote(fresher),
      },
    };
  }

  const holdable = offer.payment_requirements?.requires_instant_payment === false;
  const ctx = { q, offer, prebook, traveller, clientReference: `bn-${crypto.randomBytes(6).toString('hex')}` };
  return holdable ? holdFlow(ctx) : instantFlow(ctx);
}

// ----- provider steps with demo failure switches -----

async function bookHotel({ prebook, traveller, clientReference }) {
  if (flag('FAIL_HOTEL')) {
    log.write({ provider: 'app', op: 'book', event: 'SIMULATED_FAILURE', flag: 'FAIL_HOTEL', note: 'hotel booking not sent to LiteAPI' });
    throw new Error('Simulated hotel failure (FAIL_HOTEL=1)');
  }
  const booking = await liteapi.book({ prebookId: prebook.prebookId, traveller, clientReference });
  if (booking.status !== 'CONFIRMED') throw new Error(`Hotel booking came back with status ${booking.status}, not CONFIRMED`);
  return booking;
}

function simulateFlightPaymentFailure() {
  if (!flag('FAIL_FLIGHT_PAYMENT')) return;
  log.write({ provider: 'app', op: 'pay_flight', event: 'SIMULATED_FAILURE', flag: 'FAIL_FLIGHT_PAYMENT', note: 'payment not sent to Duffel' });
  throw new Error('Simulated flight payment failure (FAIL_FLIGHT_PAYMENT=1)');
}

async function cancelHotel(bookingId) {
  const r = await attempt(() => liteapi.cancelBooking(bookingId));
  log.write({ provider: 'app', op: 'cancel_hotel', event: r.ok ? 'cancelled' : 'CANCEL_FAILED', bookingId, error: r.error });
  return r.ok
    ? `Hotel booking ${bookingId} cancelled`
    : `Hotel booking ${bookingId} is STILL ACTIVE: cancellation failed (${r.error}). Cancel it manually.`;
}

async function cancelHold(order) {
  const r = await attempt(() => duffel.cancelOrder(order.id));
  log.write({ provider: 'app', op: 'cancel_flight_hold', event: r.ok ? 'cancelled' : 'CANCEL_FAILED', orderId: order.id, error: r.error });
  return r.ok
    ? `Hold ${order.booking_reference} cancelled`
    : `Hold ${order.booking_reference} is STILL ACTIVE: cancellation failed (${r.error}). It lapses at ${order.payment_status?.payment_required_by || 'its payment deadline'} if unpaid.`;
}

function success(q, order, booking) {
  return {
    http: 200,
    body: {
      ok: true,
      flight: { reference: order.booking_reference, orderId: order.id, amount: order.total_amount, currency: order.total_currency },
      hotel: { reference: booking.bookingId, status: booking.status, amount: String(booking.price), currency: booking.currency },
      total: totalOf(q.flight, q.hotel),
    },
  };
}

// Offer is holdable: hold flight -> book hotel -> pay hold.
async function holdFlow({ q, offer, prebook, traveller, clientReference }) {
  // 1. Hold the flight (no money moves).
  const held = await attempt(() => duffel.createHold(offer, traveller));
  if (!held.ok && held.code === 'invalid_order_create_type') {
    // Duffel says this offer cannot be held after all (nothing was created): treat it as instant-pay.
    log.write({ provider: 'app', op: 'book', event: 'hold_not_supported_falling_back_to_instant', quoteId: q.id, offerId: offer.id });
    return instantFlow({ q, offer, prebook, traveller, clientReference });
  }
  if (!held.ok) {
    return bookingFailure('flight', `Flight hold failed: ${held.error}`, { flightState: 'nothing booked', hotelState: 'not attempted' });
  }
  const order = held.value;

  // The hold must cost what the user was shown, or we stop before paying more than they agreed to.
  if (cents(order.total_amount) !== cents(q.flight.amount) || order.total_currency !== q.flight.currency) {
    const flightState = await cancelHold(order);
    return bookingFailure('flight', `Hold order total ${order.total_amount} ${order.total_currency} differs from the quoted ${q.flight.amount} ${q.flight.currency}`, { flightState, hotelState: 'not attempted' });
  }

  // 2. Book the hotel with the account credit card.
  const hotel = await attempt(() => bookHotel({ prebook, traveller, clientReference }));
  if (!hotel.ok) {
    const flightState = await cancelHold(order);
    return bookingFailure('hotel', `Hotel booking failed: ${hotel.error}`, { flightState, hotelState: 'nothing booked' });
  }
  const booking = hotel.value;

  // 3. Pay the hold, using the amount and currency on the order itself.
  const paid = await attempt(async () => {
    simulateFlightPaymentFailure();
    const current = await duffel.getOrder(order.id); // latest price, as Duffel's guide advises
    if (cents(current.total_amount) !== cents(q.flight.amount) || current.total_currency !== q.flight.currency) {
      throw new Error(`Order price is now ${current.total_amount} ${current.total_currency}, quoted ${q.flight.amount} ${q.flight.currency}; not paying`);
    }
    return duffel.payOrder(current);
  });
  if (!paid.ok) {
    const hotelState = await cancelHotel(booking.bookingId);
    return bookingFailure('flight payment', `Paying the flight hold failed: ${paid.error}`, {
      flightState: `Hold ${order.booking_reference} left UNPAID (not ticketed). It lapses at ${order.payment_status?.payment_required_by || 'its payment deadline'}.`,
      hotelState,
    });
  }

  log.write({ provider: 'app', op: 'book', event: 'success', quoteId: q.id, flightReference: order.booking_reference, hotelBookingId: booking.bookingId });
  return success(q, order, booking);
}

// Offer is instant-pay only: book hotel -> create and pay the flight in one call.
async function instantFlow({ q, offer, prebook, traveller, clientReference }) {
  const hotel = await attempt(() => bookHotel({ prebook, traveller, clientReference }));
  if (!hotel.ok) {
    return bookingFailure('hotel', `Hotel booking failed: ${hotel.error}`, { flightState: 'not attempted', hotelState: 'nothing booked' });
  }
  const booking = hotel.value;

  const flight = await attempt(async () => {
    simulateFlightPaymentFailure();
    return duffel.createInstant(offer, traveller);
  });
  if (!flight.ok) {
    const hotelState = await cancelHotel(booking.bookingId);
    return bookingFailure('flight', `Flight booking failed: ${flight.error}`, { flightState: 'nothing booked', hotelState });
  }

  log.write({ provider: 'app', op: 'book', event: 'success', quoteId: q.id, flightReference: flight.value.booking_reference, hotelBookingId: booking.bookingId });
  return success(q, flight.value, booking);
}

function demoFlags() {
  return { failHotel: flag('FAIL_HOTEL'), failFlightPayment: flag('FAIL_FLIGHT_PAYMENT') };
}

module.exports = { createQuote, book, demoFlags, _quotes: quotes };
