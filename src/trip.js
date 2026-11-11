// The hard-coded trip. One adult, one flight route, one hotel, matching dates.
// Dates are computed so they are always at least 30 days from today.

function isoDate(daysFromToday) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromToday);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

const departureDate = isoDate(45); // >= 30 days out
const nights = 3;
const checkin = departureDate; // hotel starts the day we land (same-day arrival, assumed)
const checkout = isoDate(45 + nights);

module.exports = {
  flight: {
    origin: 'LHR',
    destination: 'JFK',
    departureDate,
    cabinClass: 'economy',
  },
  hotel: {
    // ASSUMPTION: replace with a real hotel id returned by the LiteAPI sandbox
    // for New York. Verify with `npm run smoke` once your .env exists.
    hotelId: 'lp19c4c',
    checkin,
    checkout,
    nights,
    guestNationality: 'GB',
    currency: 'USD',
  },
  // Made-up traveller. Not a real person.
  traveller: {
    title: 'mr',
    givenName: 'Test',
    familyName: 'Traveller',
    gender: 'm',
    bornOn: '1990-01-15',
    email: 'test.traveller@example.com',
    phoneNumber: '+442080160509',
  },
  adults: 1,
};
