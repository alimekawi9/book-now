// Duffel (flights). The token is read server-side only and never sent to the browser.
const { Duffel } = require('@duffel/api');

const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });

// Searches offers for the trip's flight. Read-only: creates an offer request, books nothing.
async function searchOffers(trip) {
  const { flight, adults } = trip;
  const res = await duffel.offerRequests.create({
    slices: [
      {
        origin: flight.origin,
        destination: flight.destination,
        departure_date: flight.departureDate,
      },
    ],
    passengers: Array.from({ length: adults }, () => ({ type: 'adult' })),
    cabin_class: flight.cabinClass,
    return_offers: true,
  });
  return res.data.offers;
}

module.exports = { duffel, searchOffers };
