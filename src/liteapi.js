// LiteAPI (hotels). Uses Node 18's built-in fetch. The key stays server-side and is never logged.
// Search and hotel data are on api.liteapi.travel; prebook, book and cancel are on book.liteapi.travel.
const { callJson } = require('./http');

const SEARCH_URL = 'https://api.liteapi.travel/v3.0';
const BOOK_URL = 'https://book.liteapi.travel/v3.0';

// LiteAPI errors look like { error: { code, message, description } }.
function makeError(status, data) {
  const e = data?.error;
  const err = new Error(e?.description || e?.message || data?.message || `LiteAPI HTTP ${status}`);
  err.status = status;
  err.body = data;
  err.code = e?.code;
  return err;
}

function request(op, method, base, path, body, reqInfo, summarize) {
  return callJson({
    provider: 'liteapi', op, method, url: base + path,
    headers: {
      'X-API-Key': process.env.LITEAPI_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body, reqInfo, summarize, makeError,
  });
}

// Searches rates for the trip's hotel and dates, in the trip's currency. Read-only.
function searchRates(trip) {
  const { hotel, adults } = trip;
  return request(
    'search_rates', 'POST', SEARCH_URL, '/hotels/rates',
    {
      hotelIds: [hotel.hotelId],
      occupancies: [{ adults }],
      checkin: hotel.checkin,
      checkout: hotel.checkout,
      currency: hotel.currency,
      guestNationality: hotel.guestNationality,
    },
    { hotelId: hotel.hotelId, checkin: hotel.checkin, checkout: hotel.checkout, currency: hotel.currency },
    (d) => ({ hotels: (d.data || []).length, rates: (d.data || []).flatMap((h) => h.roomTypes || []).length })
  );
}

// Chooses a rate from a searchRates response: the cheapest refundable (RFN) rate if there is one,
// otherwise the cheapest rate overall. Returns { offerId, rate, refundable } or null.
function pickRate(searchResponse) {
  const candidates = (searchResponse.data || [])
    .flatMap((h) => h.roomTypes || [])
    .flatMap((rt) => (rt.rates || []).map((rate) => ({ offerId: rt.offerId, rate })))
    .filter((c) => c.offerId && c.rate.retailRate?.total?.[0])
    .map((c) => ({ ...c, price: Number(c.rate.retailRate.total[0].amount), refundable: c.rate.cancellationPolicies?.refundableTag === 'RFN' }));
  if (!candidates.length) return null;
  const cheapest = (list) => list.reduce((a, b) => (a.price <= b.price ? a : b));
  const refundable = candidates.filter((c) => c.refundable);
  return cheapest(refundable.length ? refundable : candidates);
}

// Locks the rate for booking. Returns the prebook data (prebookId, price, currency, ...).
async function prebook(offerId) {
  const res = await request(
    'prebook', 'POST', BOOK_URL, '/rates/prebook',
    { offerId, usePaymentSdk: false },
    { usePaymentSdk: false },
    (d) => ({
      prebookId: d.data.prebookId, hotelId: d.data.hotelId, amount: d.data.price, currency: d.data.currency,
      priceDifferencePercent: d.data.priceDifferencePercent,
      cancellationChanged: d.data.cancellationChanged, boardChanged: d.data.boardChanged,
      paymentTypes: d.data.paymentTypes,
    })
  );
  return res.data;
}

// Books with the account's own credit card (Case 2: we pay the provider).
async function book({ prebookId, traveller, clientReference }) {
  const res = await request(
    'book', 'POST', BOOK_URL, '/rates/book',
    {
      prebookId,
      clientReference,
      holder: { firstName: traveller.givenName, lastName: traveller.familyName, email: traveller.email, phone: traveller.phoneNumber },
      guests: [{ occupancyNumber: 1, firstName: traveller.givenName, lastName: traveller.familyName, email: traveller.email }],
      payment: { method: 'ACC_CREDIT_CARD' },
    },
    { prebookId, clientReference, paymentMethod: 'ACC_CREDIT_CARD' },
    (d) => ({
      bookingId: d.data.bookingId, bookingStatus: d.data.status, amount: d.data.price, currency: d.data.currency,
      tag: d.data.tag, supplierBookingId: d.data.supplierBookingId, sandbox: d.sandbox,
    })
  );
  return res.data;
}

async function cancelBooking(bookingId) {
  const res = await request(
    'cancel_booking', 'PUT', BOOK_URL, `/bookings/${encodeURIComponent(bookingId)}`,
    undefined, { bookingId },
    (d) => ({ bookingId: d.data?.bookingId, bookingStatus: d.data?.status, refundAmount: d.data?.refund_amount ?? d.data?.refundAmount, currency: d.data?.currency })
  );
  return res.data;
}

// Display name for the hotel (the rates response has only an id). Failure is non-fatal.
async function hotelName(hotelId) {
  try {
    const res = await request(
      'hotel_details', 'GET', SEARCH_URL, `/data/hotel?hotelId=${encodeURIComponent(hotelId)}`,
      undefined, { hotelId }, (d) => ({ hotelId, name: d.data?.name })
    );
    return res.data?.name || null;
  } catch {
    return null;
  }
}

module.exports = { searchRates, pickRate, prebook, book, cancelBooking, hotelName };
