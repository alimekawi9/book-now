// Express app: serves /public and (later) the booking API.
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

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Read-only: the page uses this to show the hard-coded trip.
app.get('/api/trip', (req, res) => res.json(trip));

// TODO: POST /api/book (not implemented yet)

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
