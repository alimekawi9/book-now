// Front end: shows the trip. Prices and booking are placeholders for now.
const $ = (id) => document.getElementById(id);

async function init() {
  const trip = await (await fetch('/api/trip')).json();
  $('flight').textContent =
    `${trip.flight.origin} → ${trip.flight.destination}, ${trip.flight.departureDate} (price: TBD)`;
  $('hotel').textContent =
    `Hotel ${trip.hotel.hotelId}, ${trip.hotel.nights} nights, ${trip.hotel.checkin} to ${trip.hotel.checkout} (price: TBD)`;
  $('total').textContent = 'TBD';
}

$('book').addEventListener('click', () => {
  $('status').textContent = 'Booking is not implemented yet.';
});

init().catch((e) => { $('status').textContent = 'Could not load trip: ' + e.message; });
