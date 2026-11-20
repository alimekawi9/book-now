// Front end: loads a quote, shows it, and books it. All prices come from the server.
// Text is always set with textContent (never innerHTML), because provider data is untrusted.
const $ = (id) => document.getElementById(id);

let quote = null;      // the quote currently on screen
let acceptMode = false; // true after a price change: the next click is the explicit "accept"

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  for (const c of children) node.append(c);
  return node;
}

const money = (amount, currency) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(amount));
const when = (iso) => (iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const totalText = (t) => (t ? money(t.amount, t.currency) : 'mixed currencies');

function renderQuote(q) {
  quote = q;
  const f = q.flight;
  const h = q.hotel;
  $('flight').replaceChildren(
    el('div', { className: 'big' }, `${f.origin} → ${f.destination}  ${f.flightNumbers.join(', ')}`),
    el('div', {}, `${f.airline}, ${f.stops ? f.stops + ' stop(s)' : 'direct'}`),
    el('div', { className: 'muted' }, `${when(f.departingAt)} → ${when(f.arrivingAt)}`),
    el('div', { className: 'price' }, money(f.amount, f.currency)),
    el('div', { className: 'muted' }, f.holdable
      ? `Can be held; pay by ${when(f.paymentRequiredBy)}`
      : 'Instant payment required')
  );
  $('hotel').replaceChildren(
    el('div', { className: 'big' }, h.name || `Hotel ${h.hotelId}`),
    el('div', {}, `${h.roomName || 'Room'}${h.boardName ? ', ' + h.boardName : ''}`),
    el('div', { className: 'muted' }, `${h.checkin} to ${h.checkout}`),
    el('div', {},
      el('span', { className: 'price' }, money(h.amount, h.currency) + ' '),
      el('span', { className: 'tag ' + (h.refundable ? 'rfn' : 'nrfn') }, h.refundable ? 'refundable' : 'non-refundable')),
    el('div', { className: 'muted' }, h.refundable && h.freeCancellationUntil
      ? `Free cancellation until ${h.freeCancellationUntil} GMT`
      : 'No refund if cancelled')
  );
  $('total').textContent = totalText(q.total);
  $('expiry').textContent = `Flight price valid until ${when(q.expiresAt)}`;
  $('tripline').textContent = `${f.origin}→${f.destination} ${h.checkin}, hotel to ${h.checkout}`;
}

function setButton(label, accept) {
  acceptMode = accept;
  $('book').textContent = label;
  $('book').className = accept ? 'accept' : '';
  $('book').disabled = false;
}

function box(kind, ...lines) {
  return el('div', { className: 'box ' + kind }, ...lines.map((l) => (typeof l === 'string' ? el('p', {}, l) : l)));
}

function travellerFromForm() {
  const data = Object.fromEntries(new FormData($('traveller')).entries());
  return data;
}

async function loadQuote() {
  $('book').disabled = true;
  $('result').replaceChildren();
  $('flight').textContent = $('hotel').textContent = 'Loading…';
  $('total').textContent = '—';
  try {
    const res = await fetch('/api/quote');
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || res.statusText);
    renderQuote(body);
    setButton('Book now', false);
  } catch (err) {
    $('flight').textContent = $('hotel').textContent = '—';
    $('result').replaceChildren(box('bad', `Could not get a quote: ${err.message}`));
    setButton('Get a new quote', false);
    quote = null;
  }
}

function showSuccess(r) {
  $('result').replaceChildren(
    box('good',
      el('p', { className: 'big' }, 'Booked'),
      el('p', {}, `Flight reference: ${r.flight.reference} (${money(r.flight.amount, r.flight.currency)})`),
      el('p', {}, `Hotel reference: ${r.hotel.reference} (${r.hotel.status}, ${money(r.hotel.amount, r.hotel.currency)})`),
      el('p', {}, `Total: ${totalText(r.total)}`))
  );
  $('book').disabled = true;
  $('hint').textContent = 'Reload the page for a new quote.';
}

function showFailure(r) {
  $('result').replaceChildren(
    box('bad',
      el('p', { className: 'big' }, `Booking failed: ${r.failed}`),
      el('p', {}, r.error),
      el('p', {}, `Flight: ${r.flightState}`),
      el('p', {}, `Hotel: ${r.hotelState}`))
  );
  setButton('Try again', false); // same quote; the server re-checks prices again
}

function showPriceChange(r) {
  const lines = [el('p', { className: 'big' }, 'The price changed. Nothing was booked.')];
  if (r.changes.flight) lines.push(el('p', {}, `Flight: ${money(r.changes.flight.old.amount, r.changes.flight.old.currency)} → ${money(r.changes.flight.new.amount, r.changes.flight.new.currency)}`));
  if (r.changes.hotel) lines.push(el('p', {}, `Hotel: ${money(r.changes.hotel.old.amount, r.changes.hotel.old.currency)} → ${money(r.changes.hotel.new.amount, r.changes.hotel.new.currency)}`));
  if (r.changes.termsChanged) lines.push(el('p', {}, 'The hotel cancellation terms or board also changed; the new terms are shown above.'));
  lines.push(el('p', {}, `Total: ${totalText(r.oldTotal)} → ${totalText(r.newTotal)}`));
  $('result').replaceChildren(box('warn', ...lines));
  renderQuote(r.quote); // the page now shows the new prices
  setButton(`Accept new price and book (${totalText(r.newTotal)})`, true);
}

$('book').addEventListener('click', async () => {
  if (!quote) return loadQuote();
  const form = $('traveller');
  if (!form.reportValidity()) return;

  $('book').disabled = true;
  $('book').textContent = 'Booking…';
  $('result').replaceChildren(box('warn', 'Booking… this can take several seconds.'));
  try {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteId: quote.quoteId, traveller: travellerFromForm() }),
    });
    const r = await res.json();
    if (res.ok && r.ok) return showSuccess(r);
    if (res.status === 409 && r.error === 'price_changed') return showPriceChange(r);
    if (r.failed) return showFailure(r);
    // 404 / 410 / 409 (in progress, already booked) / 400
    $('result').replaceChildren(box('bad', r.message || r.error || res.statusText));
    setButton(res.status === 400 ? 'Book now' : 'Get a new quote', false);
    if (res.status !== 400) quote = null;
  } catch (err) {
    $('result').replaceChildren(box('bad', `Request failed: ${err.message}`));
    setButton('Try again', false);
  }
});

async function init() {
  const trip = await (await fetch('/api/trip')).json();
  const t = trip.traveller; // made-up traveller, prefilled so the demo is one click
  const f = $('traveller').elements;
  f.title.value = t.title; f.givenName.value = t.givenName; f.familyName.value = t.familyName;
  f.gender.value = t.gender; f.bornOn.value = t.bornOn; f.email.value = t.email; f.phoneNumber.value = t.phoneNumber;

  const flags = [];
  if (trip.demo.failHotel) flags.push('FAIL_HOTEL: the hotel booking will be forced to fail');
  if (trip.demo.failFlightPayment) flags.push('FAIL_FLIGHT_PAYMENT: the flight payment will be forced to fail');
  if (flags.length) { $('demo').hidden = false; $('demo').textContent = 'Demo mode. ' + flags.join('. ') + '.'; }

  await loadQuote();
}

init().catch((e) => { $('result').replaceChildren(box('bad', 'Could not load: ' + e.message)); });
