// One place where every provider call is made, so every call is logged the same way.
const log = require('./log');

// provider/op: labels for the log. reqInfo: loggable facts about the request (ids, amounts;
// never headers or keys). summarize(data): loggable facts about a successful response.
// makeError(status, data): turns a failed response into an Error.
async function callJson({ provider, op, method, url, headers, body, reqInfo, summarize, makeError }) {
  const started = Date.now();
  log.write({ provider, op, event: 'request', method, url, ...reqInfo });

  let res;
  let data;
  try {
    res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    data = await res.json().catch(() => null);
  } catch (err) {
    log.write({ provider, op, event: 'response', ok: false, status: null, ms: Date.now() - started, error: err.message });
    throw err;
  }

  if (!res.ok) {
    const err = makeError(res.status, data);
    log.write({
      provider, op, event: 'response', ok: false, status: res.status,
      ms: Date.now() - started, errorCode: err.code ?? null, error: err.message,
    });
    throw err;
  }

  log.write({
    provider, op, event: 'response', ok: true, status: res.status,
    ms: Date.now() - started, ...(summarize ? summarize(data) : {}),
  });
  return data;
}

module.exports = { callJson };
