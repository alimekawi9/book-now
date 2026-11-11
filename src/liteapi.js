// LiteAPI (hotels). Uses Node 18's built-in fetch. The key stays server-side.
const BASE_URL = 'https://api.liteapi.travel/v3.0';

async function request(method, path, body) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: {
      'X-API-Key': process.env.LITEAPI_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error?.message || data?.message || res.statusText);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

// Searches rates for the trip's hotel and dates. Read-only.
function searchRates(trip) {
  const { hotel, adults } = trip;
  return request('POST', '/hotels/rates', {
    hotelIds: [hotel.hotelId],
    occupancies: [{ adults }],
    checkin: hotel.checkin,
    checkout: hotel.checkout,
    currency: hotel.currency,
    guestNationality: hotel.guestNationality,
  });
}

module.exports = { request, searchRates };
