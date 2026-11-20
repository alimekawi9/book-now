// The hard-coded trip. One adult, LHR->JFK, one hotel, fixed dates.
// Dates are fixed (not computed) so a recording and the report show the same trip.
const departureDate = '2026-12-26';
const checkin = '2026-12-26'; // same-day arrival
const checkout = '2026-12-29';
const nights = 3;

module.exports = {
  flight: {
    origin: 'LHR',
    destination: 'JFK',
    departureDate,
    cabinClass: 'economy',
  },
  hotel: {
    hotelId: 'lp19c4c',
    checkin,
    checkout,
    nights,
    guestNationality: 'GB',
    currency: 'GBP',
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
