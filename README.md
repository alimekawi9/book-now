# Book now

A tiny app for the Damodi take-home: one press of **Book now** books a Duffel test flight and a LiteAPI sandbox hotel. Test and sandbox keys only; no real money moves.

The trip is fixed: LHR to JFK on 2026-12-26, hotel `lp19c4c` from 2026-12-26 to 2026-12-29, one adult, a made-up traveller, hotel rates requested in GBP.

## Which case this implements, and why

**Case 2: Damodi sells the trip and pays the providers.**
- **Flight:** Damodi pays Duffel from its Duffel **balance** (payment type `balance`).
- **Hotel:** Damodi pays LiteAPI with the account credit card (payment method `ACC_CREDIT_CARD`).
- The traveller's own single payment to Damodi is **not** modelled (see "What this app does not do").

**Why Case 2.** The brief says to build whichever case the test accounts allow today. Case 2 is the one that could be built and run end to end in both sandboxes without asking either provider for approval:
- Duffel's docs say the test-mode balance is unlimited, so paying a flight from balance works. LiteAPI sandbox keys come with a hidden test card, so `ACC_CREDIT_CARD` works.
- **Case 1** (each provider charges the traveller) is **not built**. Duffel's docs say card payments need Duffel's approval, and LiteAPI's raw-card route needs LiteAPI to enable it. The documented route is a separate card form per provider. Neither card route was tested in the sandboxes.
- **Case 3** (Stripe Issuing virtual cards) is **not built**. The Stripe sandbox used for this project answered "Your account is not set up to use Issuing" (the sandbox account's country is US), and Duffel's pages do not mention Stripe Issuing cards. Issuing was not enabled.

This section says what could be built and tested. The recommendation between the three cases is in the report, not here. Sources and quotes are in [docs/research-findings.md](docs/research-findings.md).

## How to run

You need Node 18 or newer, a Duffel **test** token and a LiteAPI **sandbox** key.

```
cp .env.example .env     # then fill in your own keys (PowerShell: copy .env.example .env)
npm install
npm run smoke            # optional: read-only check that both APIs answer
npm start                # http://localhost:3000
git config core.hooksPath .githooks   # optional: enables the secret-blocking pre-commit hook
```

`.env.example` lists the variable names only:

```
DUFFEL_ACCESS_TOKEN=
LITEAPI_KEY=
STRIPE_SECRET_KEY=     # optional; the app does not use it
PORT=3000
```

- The server refuses to start if the Duffel token does not start with `duffel_test_`.
- If port 3000 is already in use on your machine, set `PORT` (for example `PORT=3100` in `.env`, or `$env:PORT=3100; npm start` in PowerShell).
- `.env` is git-ignored. Never commit it.

### Demo failures

Set a flag, restart the server, reload the page, press Book now. The page shows an orange "Demo mode" banner while a flag is on.

| Flag | Forces | PowerShell | Bash |
|------|--------|------------|------|
| `FAIL_HOTEL=1` | the hotel booking step to fail | `$env:FAIL_HOTEL=1; npm start` | `FAIL_HOTEL=1 npm start` |
| `FAIL_FLIGHT_PAYMENT=1` | the flight payment step to fail | `$env:FAIL_FLIGHT_PAYMENT=1; npm start` | `FAIL_FLIGHT_PAYMENT=1 npm start` |

A forced failure is raised inside our code at the point where the provider call would be sent. That call is not sent, and the log line says `SIMULATED_FAILURE`. Everything after it, such as cancelling the other booking, is a real sandbox call.

### Evidence log

Every provider call and response is appended to `logs/provider.log`, one JSON object per line: time, provider, operation, HTTP status, ids, amounts, currency, error messages. Headers are never logged, so keys cannot appear. Decisions made by our own code (quote created, price changed, simulated failure, cancel result) appear with `"provider":"app"`. `*.log` is git-ignored, so copy the file out yourself if you need it as evidence.

## What happens before booking

1. **On page load** the page calls `GET /api/quote`. The server fetches a fresh Duffel offer and a fresh LiteAPI rate, prebooks the hotel, and shows both parts, the total and the flight offer's expiry time. Nothing is saved in the browser; the prices are kept server-side under a `quoteId`. (LiteAPI's prebook response has no expiry time, so none is shown for the hotel.)
2. **On Book now** the server fetches the Duffel offer and prebooks the hotel **again** and compares both totals with the quote.
3. **If either price changed** (or the hotel's cancellation terms or board changed), the server returns 409 and books **nothing**. The page shows the old and new prices and the old and new total, and the button becomes "Accept new price and book". Only that second click books, at the new price.
4. If the flight offer has expired, the page asks for a fresh quote and nothing is booked.
5. A quote can only be booked once, and only one booking attempt at a time: a double click gets "already being booked".

Which offer and rate are chosen:
- **Flight:** the cheapest offer that Duffel marks as holdable and that has a price guarantee; failing that, the cheapest holdable one; failing that, the cheapest offer.
- **Hotel:** the cheapest **refundable** rate (`refundableTag` RFN). If no refundable rate exists, the cheapest rate, and the page shows "non-refundable".

## Booking order and failure handling

**Order.** The app orders the steps so the hard-to-undo step (paying the airline) comes last.

When Duffel lets the offer be **held** (the normal case):
1. Create a Duffel **hold order**. It reserves the seat and price and costs nothing.
2. Book the hotel with `ACC_CREDIT_CARD`.
3. Pay the hold from the Duffel balance, using the amount and currency on the order itself.

When the offer is **instant-pay only** (or Duffel refuses the hold):
1. Book the hotel.
2. Create and pay the flight order in one call.

**Why.** A hold can be cancelled for free, and a hotel booking can be cancelled (a refundable rate is refunded in full before its deadline). Paying the airline is the step that cannot reliably be undone, because a refund depends on the fare rules. So that step goes last, after everything else has succeeded. If an offer cannot be held, the hotel goes first, because it is the one that can be cancelled afterwards.

**Which is booked first?** In the hold flow, the flight is *held* first and the hotel is *booked* second; the flight is only *paid* last. In the instant flow, the hotel is booked first.

**Does a failed hotel cancel the flight?** Yes. In the hold flow, the hold order is cancelled. In the instant flow the hotel is booked first, so if it fails there is no flight to cancel.

**Can either provider hold a booking before payment?**
- **Duffel: sometimes.** A hold works on some offers. In Duffel's test data every offer reports that it can be held, but some are rejected when the hold is attempted (HTTP 422, `invalid_order_create_type`; nothing is created). The app then falls back to the instant flow. This happened on an Iberia offer in testing.
- **LiteAPI: no.** Its docs describe no hold-without-payment step. The flow is prebook, then book. The docs do not state how long a prebook lasts, and the sandbox response has no expiry field, so the app re-prebooks at booking time.

**What the app does in each failure.** The response always says which step failed and the final state of the other booking, including when a cancellation itself fails (then it says the booking is **STILL ACTIVE** and must be cancelled by hand).

| What fails | What the app does |
|------------|-------------------|
| Prices differ at Book now | 409, nothing booked, old and new prices shown, user must click again |
| Flight offer expired | Nothing booked, asks for a new quote |
| Flight hold cannot be created (hold flow) | Nothing booked; hotel never attempted. If Duffel says the offer cannot be held, falls back to the instant flow |
| Hotel booking fails (hold flow) | Cancels the hold order |
| Paying the hold fails | Cancels the hotel booking. The hold is left **unpaid** and lapses by itself at its payment deadline (the message says so) |
| Hotel booking fails (instant flow) | Nothing else was done |
| Flight order fails (instant flow) | Cancels the hotel booking |
| A cancellation call fails | Reported as STILL ACTIVE, in the response and in the log |

If the hold's total differs from the quote, the app cancels the hold and stops before paying anything.

## What this app does not do

- **The traveller's single payment to Damodi is not modelled.** There is no card form and no Stripe charge. Case 2 assumes the traveller pays Damodi once; here that step is skipped, and only Damodi's payments to the providers are made.
- No Case 1 or Case 3 flow (see above).
- No search screen, accounts, expense form, or persistence. Quotes live in server memory, so restarting the server invalidates them.
- No automated tests. Behaviour was checked by hand against the sandboxes: normal booking, both forced failures, a price change, a double click, a failing cancellation, and the instant-pay fallback.
- Flight and hotel totals are only added when both are in the same currency (GBP here).
- Sandbox and test mode only. Nothing here shows how the same flow behaves on live accounts. In particular, Duffel's pages disagree on whether the `balance` payment type is only for Managed Content in live mode (see the research file).
- UK package-travel and ATOL questions are out of scope and **open**: selling a flight and a hotel together may make Damodi an organiser of a package. Not investigated.

## Assumptions

- **The hotel is in Dresden, Germany**, not New York. `lp19c4c` is "Radisson Blu Park Hotel & Conference Centre, Nizzastr. 55, Dresden". It was kept because that id was specified; the flight goes to JFK. Change `hotelId` in `src/trip.js` for a New York hotel.
- Hotel check-in is the day of the flight (same-day arrival).
- Test prices move between searches, so two quotes a minute apart can differ. Within one quote-then-book they normally match.
- The made-up traveller is prefilled in the form so the demo is a single click.

## Research

Sources, quotes and open questions for the three cases are in [docs/research-findings.md](docs/research-findings.md).

## AI use

Full dated log: [AI_LOG.md](AI_LOG.md).

**Tools used.** Claude Code (a Claude model running in my editor) and, inside it, small "fetch" helper agents that Claude Code started to read documentation pages. Claude's web search tool was used only to find official URLs, not as evidence.

**What the tools did**
- Wrote the code: the project skeleton, the smoke test, the pre-commit secret check, the booking logic (`src/booking.js`), the logged HTTP helper, the provider modules, the page, and this README.
- Read the provider and Stripe documentation (Duffel, LiteAPI, Stripe) page by page and reported answers with quotes, which went into `docs/research-findings.md`.
- Ran the sandbox tests of the app and the research probes, including creating and cancelling test bookings, and reported results.
- Corrected itself during testing (for example finding that Duffel's "can be held" flag is unreliable in test mode, and that a log field was being overwritten).

**What I did**
- The task itself came from Damodi's brief. I wrote the prompts that directed the work, set the rules (test and sandbox keys only, no keys in the repository, research only from official pages, no guessing figures), and decided what to ask for at each step.
- 
**What I reviewed or ran myself.** I opened the Duffel, LiteAPI and Stripe test accounts and created the keys myself. I kept them in a local `.env` file and never put them in a chat or in this repository. I ran the smoke test and used its output to decide the next steps. I decided the direction of the work: I followed the brief's three cases, asked for plain-language explanations of anything I did not understand, and asked for more research when the report left questions from the brief unanswered. I read the report and asked for changes: first person, plain language, answers grouped under each case, a From and To column in the money table, and diagrams. The recommendation was revised to weigh Case 1 as Damodi's preferred direction. [I ran the app myself and recorded the demo.]

**What I did not write by hand.** The app code, the research file and this README were written by Claude Code from prompts that Claude wrote and I pasted in. [I wrote none of the code myself.]

**What I rejected or changed.** Early in the work the recommendation favoured Case 2. After rereading the brief, it was changed so that Case 1 comes first and Case 2 is the backup. [I also changed ... by hand.]

**What I checked, and what I did not.** The app was exercised against the live sandboxes as described above. The research file's quotes were transcribed from helper-agent reports, and Claude Code re-checked a few Duffel pages directly.

**Quotes I re-checked myself.** I have not yet re-checked the research file's quotes against the providers' pages myself, so I treat every quoted figure as unverified until I have.

**The report.** The report is sent as a separate PDF and is not part of this repository. I set the structure and tone and rewrote it several times. The figures and quotes in it carry the same caveat as the research file.