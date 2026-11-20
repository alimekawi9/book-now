# AI log

Running log: date, what I asked, what the AI produced, what I changed or rejected.

**How to read this file.** The first three columns are factual: what was asked and what the AI (Claude Code) produced and found. The last column is about *my* review. Things the AI itself found and corrected while working are listed in the notes under the table.

| Date | What I asked | What the AI produced | What I changed or rejected |
|------|--------------|----------------------|----------------------------|
| 2026-11-11 | Project skeleton only: git + .gitignore first, .env.example, Express server, one module per provider, hard-coded trip, placeholder page, read-only smoke test, pre-commit secret check | Skeleton files, smoke test, pre-commit hook | I ran the skeleton and its smoke test myself and used the results (193 flight offers, 200 hotel rates) to decide the next step. I did not review the code line by line. The hotel id `lp19c4c`, flagged in the skeleton as an unverified guess, turned out to be a hotel in Dresden, Germany. I kept it because it was named in the prompt for the booking app, which I wrote with Claude's help. It does not matter for a sandbox demo. |
| 2026-11-11 | Implement the booking app as Case 2 (Damodi sells, pays providers): `/api/quote`, `/api/book` with hold-first ordering, rollback on failure, `FAIL_HOTEL` / `FAIL_FLIGHT_PAYMENT` demo flags, `provider.log` evidence, one-screen page, README. Read the LiteAPI book and account-credit-card docs and Duffel's holding-orders guide first. | `src/log.js`, `src/http.js` (every provider call goes through one logged helper), `src/duffel.js` and `src/liteapi.js` extended, `src/booking.js` (quote store, price re-check, hold flow, instant flow, rollback), two routes in `server.js`, new `public/` page, README. Tested against the live sandboxes: normal booking, both forced failures, price change (409), double click, a failing cancellation, instant-pay fallback. | I pasted the prompt into Claude Code and relied on its sandbox tests. I ran the app myself to record the demo videos. I did not review the code line by line. Changes the AI made during testing are in the notes below. |
| 2026-11-13 | Research round 1: close 12 open questions (Stripe UK fees, Duffel Payments fee, Stripe Issuing pricing and testing, Duffel virtual cards, LiteAPI VCC, hold and prebook expiry, margin payout, Vault and Forward, VAT receipts, currency conversion, Duffel test balance) using only official pages, with URL, short quote and date for each. Two small sandbox tests (Duffel hold, LiteAPI prebook). | `docs/research-findings.md` (Round 1). Pages were read by fetch helper agents started by Claude Code. Two sandbox tests run by the AI. | I did not check these answers against the live pages myself. One Round 1 answer, Q12, was wrong and was corrected in Round 2 (the Duffel test balance is unlimited); see notes. |
| 2026-11-18 | Research round 2: Duffel balance funding (case 2 float), Stripe chargebacks and Duffel/LiteAPI refunds, markup on Duffel and LiteAPI, single card entry for both providers. Sandbox probes only where the docs left a gap. | "Round 2" section of `docs/research-findings.md`. Probes: a Duffel refund quote (not confirmed), a read-only LiteAPI booking lookup, a read-only Stripe Issuing check on the sandbox. | I did not check these answers against the live pages myself. I treat every quoted figure as unverified until I have. |
| 2026-11-19 | Final checks before submission: exact commands for the recording, one normal end-to-end booking, README rewrite, fill AI_LOG, safety check for keys, then a proposed commit. | New README; this log; an end-to-end check booking (flight reference `ZQCKWW`, hotel reference `3cP2Daf-m`, see notes); a key scan of the working tree and git history. | I read the README and this log and filled in the sections marked for me. I changed the README line about the report so it says the report is sent as a separate PDF. |
## Notes: things the AI found or corrected while working

**Booking app session (2026-11-11)**
- **Duffel's "can be held" flag is not reliable in test mode.** Every offer says `requires_instant_payment: false`, but a hold on some offers returns 422 `invalid_order_create_type`. The AI first selected the cheapest "holdable" offer and hit this on the second run. Fix: prefer offers with `price_guarantee_expires_at`, and fall back to the instant flow if a hold is rejected. This goes beyond the written spec ("if the offer is holdable, hold").
- **Log bug.** The cancel response summary overwrote the HTTP `status` field with the booking status ("CANCELLED"). Renamed to `bookingStatus`.
- **Hotel `lp19c4c` is in Dresden**, not New York (found by looking the hotel up after the page worked). Left as specified; flagged in the README.
- **Cancel endpoints were not in the docs that were read.** `PUT /bookings/{bookingId}` on `book.liteapi.travel` was used from memory and confirmed by a live sandbox cancel. The Duffel guide does not cover cancelling holds; `POST /air/order_cancellations` then `/actions/confirm` was used and confirmed live.
- **Test bookings were created and then cancelled.** One test deliberately left a hotel booking active (simulated cancel failure) and it was cancelled by hand afterwards. Early test log lines were moved to `logs/dev-testing.log`.
- **Port 3000 was already in use** by an unrelated app on this machine; testing used port 3100.

**Research rounds (2026-11-13 and 2026-11-18)**
- **Q12 was wrong in Round 1 and is corrected in Round 2.** Round 1 said no page states whether the Duffel test balance is unlimited. https://duffel.com/docs/api/payments says "In test mode, your balance is unlimited." Round 1 had not read that page. A Round 2 helper also quoted this line against the wrong page; the AI fetched the pages directly to find where it really is.
- Several official pages could not be read (HTTP 403 or 404) and several long pages were only partly readable. They are listed in the research file, and the answers that depend on them are marked NOT FOUND, not estimated.
- Round 2 also found: Duffel's docs disagree on whether `balance` is only for Managed Content, and on where a refund goes; the sandbox Stripe account is US-based and Issuing is not set up on it.

**Final checks (2026-11-19)**
- The end-to-end check booking took the **fallback path**: Duffel rejected the hold on an Iberia offer (422 `invalid_order_create_type`), so the app booked the hotel first and then created the flight order as an instant order. Both bookings were confirmed. This means the path shown on screen depends on which airline the quote picks, so a recording can show either the hold flow or the instant flow.
- The check run's log was set aside as `logs/step2-check-run.log` so `logs/provider.log` starts empty for the recording.

## Not done by the AI

- The report, the two-minute screen recording, and the dashboard screenshots of each booking.
- The traveller's single payment to Damodi (not modelled), persistence of quotes across restarts, and automated tests (verification was manual against the sandboxes).
