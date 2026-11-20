// Append-only evidence log: one JSON object per line in logs/provider.log.
// Records every provider call and response (status, ids, amounts, error messages).
// Headers are never passed in here, so API keys cannot end up in the file.
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'provider.log');

function write(entry) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n');
  } catch (err) {
    // Logging must never break a booking; say so on the console and carry on.
    console.error('could not write provider.log:', err.message);
  }
}

module.exports = { write, LOG_FILE };
