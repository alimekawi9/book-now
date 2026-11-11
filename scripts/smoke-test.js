// Read-only check of both providers. Prints a short summary, never keys.
// Run: npm run smoke
require('dotenv').config();
const trip = require('../src/trip');
const { searchOffers } = require('../src/duffel');
const { searchRates } = require('../src/liteapi');

// Duffel errors carry a `errors` array; LiteAPI errors carry status/body (see src/liteapi.js).
function report(provider, err) {
  const status = err.meta?.status ?? err.status ?? 'n/a';
  const msg = err.errors?.map((e) => e.message).join('; ') || err.message;
  console.error(`[${provider}] ERROR status=${status} message=${msg}`);
}

async function duffelCheck() {
  console.log(`\n== Duffel: ${trip.flight.origin}->${trip.flight.destination} on ${trip.flight.departureDate}`);
  try {
    const offers = await searchOffers(trip);
    console.log('offers returned:', offers.length);
    if (!offers.length) return;
    const cheapest = offers.reduce((a, b) => (Number(a.total_amount) <= Number(b.total_amount) ? a : b));
    console.log('cheapest id:', cheapest.id);
    console.log('total_amount:', cheapest.total_amount, cheapest.total_currency);
    console.log('payment_requirements:', JSON.stringify(cheapest.payment_requirements ?? null));
    console.log('expires_at:', cheapest.expires_at);
  } catch (err) {
    report('duffel', err);
  }
}

async function liteapiCheck() {
  console.log(`\n== LiteAPI: ${trip.hotel.hotelId}, ${trip.hotel.checkin} to ${trip.hotel.checkout}`);
  try {
    const res = await searchRates(trip);
    const hotels = res.data || [];
    if (!hotels.length) {
      console.log('no rates returned (hotel id may be wrong or unavailable):', JSON.stringify(res).slice(0, 300));
      return;
    }
    // Flatten every rate across room types and pick the cheapest.
    const rates = hotels.flatMap((h) => h.roomTypes || []).flatMap((rt) =>
      (rt.rates || []).map((r) => ({ ...r, roomTypeId: rt.roomTypeId, offerId: rt.offerId }))
    );
    const price = (r) => Number(r.retailRate?.total?.[0]?.amount ?? Infinity);
    const cheapest = rates.reduce((a, b) => (price(a) <= price(b) ? a : b));
    const total = cheapest.retailRate?.total?.[0];
    console.log('rates found:', rates.length);
    console.log('cheapest rateId:', cheapest.rateId);
    console.log('price:', total?.amount, total?.currency);
    console.log('cancellation policy:', JSON.stringify(cheapest.cancellationPolicies ?? null));
    console.log('payment type:', JSON.stringify(cheapest.paymentTypes ?? null));
  } catch (err) {
    report('liteapi', err);
  }
}

(async () => {
  if (!process.env.DUFFEL_ACCESS_TOKEN || !process.env.LITEAPI_KEY) {
    console.error('Missing DUFFEL_ACCESS_TOKEN or LITEAPI_KEY. Create .env from .env.example.');
    process.exit(1);
  }
  await duffelCheck();
  await liteapiCheck();
})();
