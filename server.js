// Express app: serves /public and the booking API.
require('dotenv').config();
const path = require('path');
const express = require('express');

// Fail fast, with a clear message, before anything else runs.
const { DUFFEL_ACCESS_TOKEN, LITEAPI_KEY } = process.env;
const problems = [];
if (!DUFFEL_ACCESS_TOKEN) problems.push('DUFFEL_ACCESS_TOKEN is missing');
else if (!DUFFEL_ACCESS_TOKEN.startsWith('duffel_test_'))
  problems.push('DUFFEL_ACCESS_TOKEN must start with duffel_test_ (test mode only)');
if (!LITEAPI_KEY) problems.push('LITEAPI_KEY is missing');

if (problems.length) {
  console.error('Cannot start:\n  - ' + problems.join('\n  - '));
  console.error('Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const trip = require('./src/trip');
const booking = require('./src/booking');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Read-only: the hard-coded trip, the made-up traveller to prefill the form, and any demo failure flags.
app.get('/api/trip', (req, res) => res.json({ ...trip, demo: booking.demoFlags() }));

// Fresh flight offer + hotel rate (prebooked). Books nothing.
app.get('/api/quote', async (req, res) => {
  try {
    res.json(await booking.createQuote());
  } catch (err) {
    console.error('quote failed:', err.message);
    res.status(502).json({ error: 'quote_failed', message: err.message });
  }
});

// Books flight + hotel for a quote. Body: { quoteId, traveller }.
app.post('/api/book', async (req, res) => {
  const { quoteId, traveller } = req.body || {};
  try {
    const result = await booking.book(quoteId, traveller);
    res.status(result.http).json(result.body);
  } catch (err) {
    console.error('book crashed:', err);
    res.status(500).json({ ok: false, error: 'internal_error', message: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
