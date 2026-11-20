// Duffel (flights), called over plain HTTPS so every call can be logged with its HTTP status.
// The token is read server-side only and never sent to the browser or written to the log.
const { callJson } = require('./http');

const BASE_URL = 'https://api.duffel.com';

function headers() {
  return {
    Authorization: `Bearer ${process.env.DUFFEL_ACCESS_TOKEN}`,
    'Duffel-Version': 'v2',
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

// Duffel errors look like { errors: [{ type, code, message }], meta: { status } }.
// Shape the Error so callers (and the smoke test) can read .errors, .meta.status and .code.
function makeError(status, data) {
  const errors = data?.errors || [];
  const err = new Error(errors.map((e) => e.message).join('; ') || `Duffel HTTP ${status}`);
  err.errors = errors;
  err.meta = { status };
  err.status = status;
  err.code = errors[0]?.code;
  return err;
}

function call(op, method, path, body, reqInfo, summarize) {
  return callJson({
    provider: 'duffel', op, method, url: BASE_URL + path,
    headers: headers(), body, reqInfo, summarize, makeError,
  });
}

const orderSummary = (d) => ({
  orderId: d.data.id,
  bookingReference: d.data.booking_reference,
  type: d.data.type,
  amount: d.data.total_amount,
  currency: d.data.total_currency,
  awaitingPayment: d.data.payment_status?.awaiting_payment,
  paymentRequiredBy: d.data.payment_status?.payment_required_by,
});

// Searches offers for the trip's flight. Read-only: creates an offer request, books nothing.
async function searchOffers(trip) {
  const { flight, adults } = trip;
  const res = await call(
    'search_offers', 'POST', '/air/offer_requests?return_offers=true',
    {
      data: {
        slices: [{ origin: flight.origin, destination: flight.destination, departure_date: flight.departureDate }],
        passengers: Array.from({ length: adults }, () => ({ type: 'adult' })),
        cabin_class: flight.cabinClass,
      },
    },
    { route: `${flight.origin}-${flight.destination}`, date: flight.departureDate },
    (d) => ({ offerRequestId: d.data.id, offers: d.data.offers.length })
  );
  return res.data.offers;
}

// Re-fetches one offer (fresh price and expiry).
async function getOffer(offerId) {
  const res = await call(
    'get_offer', 'GET', `/air/offers/${offerId}`, undefined, { offerId },
    (d) => ({
      offerId: d.data.id, amount: d.data.total_amount, currency: d.data.total_currency,
      expiresAt: d.data.expires_at,
      requiresInstantPayment: d.data.payment_requirements?.requires_instant_payment,
    })
  );
  return res.data;
}

function passengerFor(offer, t) {
  return {
    id: offer.passengers[0].id,
    title: t.title,
    gender: t.gender,
    given_name: t.givenName,
    family_name: t.familyName,
    born_on: t.bornOn,
    email: t.email,
    phone_number: t.phoneNumber,
  };
}

// Hold order: type "hold" and NO payments key (Duffel rejects a hold with payments).
async function createHold(offer, traveller) {
  const res = await call(
    'create_hold_order', 'POST', '/air/orders',
    { data: { type: 'hold', selected_offers: [offer.id], passengers: [passengerFor(offer, traveller)] } },
    { offerId: offer.id, type: 'hold' },
    orderSummary
  );
  return res.data;
}

// Instant order: created and paid in one call, with the balance as the payment.
async function createInstant(offer, traveller) {
  const res = await call(
    'create_instant_order', 'POST', '/air/orders',
    {
      data: {
        type: 'instant',
        selected_offers: [offer.id],
        passengers: [passengerFor(offer, traveller)],
        payments: [{ type: 'balance', amount: offer.total_amount, currency: offer.total_currency }],
      },
    },
    { offerId: offer.id, type: 'instant', amount: offer.total_amount, currency: offer.total_currency },
    orderSummary
  );
  return res.data;
}

async function getOrder(orderId) {
  const res = await call('get_order', 'GET', `/air/orders/${orderId}`, undefined, { orderId }, orderSummary);
  return res.data;
}

// Pays a held order with the balance, using the order's own amount and currency.
async function payOrder(order) {
  const res = await call(
    'pay_order', 'POST', '/air/payments',
    { data: { order_id: order.id, payment: { type: 'balance', amount: order.total_amount, currency: order.total_currency } } },
    { orderId: order.id, amount: order.total_amount, currency: order.total_currency },
    (d) => ({ paymentId: d.data.id, amount: d.data.amount, currency: d.data.currency })
  );
  return res.data;
}

// Cancels an order: create a cancellation, then confirm it.
async function cancelOrder(orderId) {
  const created = await call(
    'create_order_cancellation', 'POST', '/air/order_cancellations',
    { data: { order_id: orderId } },
    { orderId },
    (d) => ({ cancellationId: d.data.id, refundAmount: d.data.refund_amount, refundCurrency: d.data.refund_currency })
  );
  const confirmed = await call(
    'confirm_order_cancellation', 'POST', `/air/order_cancellations/${created.data.id}/actions/confirm`,
    undefined,
    { orderId, cancellationId: created.data.id },
    (d) => ({ cancellationId: d.data.id, confirmedAt: d.data.confirmed_at })
  );
  return confirmed.data;
}

module.exports = { searchOffers, getOffer, createHold, createInstant, getOrder, payOrder, cancelOrder };
