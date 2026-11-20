# Research findings

Date of research: **2026-11-13** (this is the "date read" for every item unless stated otherwise).
Scope: official public docs and price pages only (stripe.com, docs.stripe.com, duffel.com, changelog.duffel.com, docs.liteapi.travel which redirects to docs.nuitee.com), plus two read-only/test-data sandbox tests. No app code was changed.

## How to read this file

- **Confidence** is one of: *confirmed* (an official page states it), *conflicting* (two official pages, or a page and a test, disagree, or the pages are ambiguous), *not found* (the pages I could read do not say).
- **NOT FOUND** and **CONFLICT** are used literally. No figure here is estimated. Where a figure is missing, the table that needs it should say "unknown", not guess.
- **Quotes** are under 25 words and copied from the fetched page text.
- **Honest limits of the method**
  - The pages were fetched by fetch-tool sub-agents and I transcribed their quotes and figures. I did not re-open every page myself, so **re-check any quote you cite in your report** against the live page (all URLs are given).
  - Web-search results were used only to discover URLs. They are not evidence and nothing below relies on them. One exception is flagged as an unverified lead in Q2.
  - Several long pages were only partly readable by the fetch tool. Each answer says so where it matters. A "NOT FOUND" on a partly read page means "not in the part I read".
  - Three Duffel help-centre articles returned HTTP 403 (see Q2), so they are unread.
- `.env` and `*.log` are in `.gitignore` (checked before starting). Sandbox tests used test keys from environment variables; no key was printed or logged.

---

## Q1. Stripe UK card processing fee

**Answer (Stripe UK pricing page, GBP):**
- Standard UK cards: **1.5% + 20p**
- Premium UK cards: 2.8% + 20p
- European Economic Area (EEA) cards: 2.5% + 20p
- International cards (outside UK/EEA): **3.15% + 20p**
- Currency conversion: an extra **+2%** when conversion is required (the page applies this to the international line; the EEA line is worded with the same "+ 2%").

**URL:** https://stripe.com/gb/pricing (read verbatim for the first ~40,000 of ~74,700 characters; the card-rate section is in that part)
**Quotes:** "1.5% + 20p" (standard UK cards); "3.15% + 20p" (international cards); "+ 2%" (if currency conversion is required).
**Confidence:** confirmed.
**Notes:**
- https://stripe.com/gb/resources/more/uk-card-processing-fees-101 (updated 19 Oct 2026, read in full) gives no Stripe rates: "Stripe charges a flat fee for all card types plus a percentage fee that varies depending on the card and transaction type." It does not conflict.
- The old support URL redirects to the **US** page (2.9% + 30¢ domestic). Those are US figures; do not use them for UK.

---

## Q2. Duffel Payments UK fee (the "2% vs 2.9%" question)

**Answer:** NOT FOUND as a UK card rate. The Duffel pages I could read give **no UK, European or non-European card rate**. What they do say:
1. Pricing page: 2% is an **exchange-rate (FX)** charge.
2. Two guides: 2% is called an "**interchange fee**" on Duffel Payments, and the card fee "is determined based on the card country", with 2.9% given only as "an example".

So the pages **appear to describe different things** (an FX charge vs a card-country fee), but the guides also call the 2% an interchange fee, so Duffel's own wording is inconsistent. Neither page is dated, so I cannot say which is newer. Treat as **CONFLICT / unclear**.

| Page | URL | Quote | Read |
|------|-----|-------|------|
| Pricing | https://duffel.com/pricing | "We will charge 2% on the exchange rate." | in full |
| Margin guide | https://duffel.com/guides/understanding-margin-and-markups | "Duffel applies a 2% interchange fee on transactions through Duffel Payments." | in full |
| Margin guide (also) | same page | "fee is determined based on the card country." / "an example would be 2.9%" | in full |
| Docs copy | https://duffel.com/docs/guides/margin-and-markups | same wording as the guide | in full |

**Not read (HTTP 403, permanent):**
- https://help.duffel.com/hc/en-gb/articles/4408072905362-How-does-Duffel-Payments-pricing-work
- https://help.duffel.com/hc/en-gb/articles/4409049347218-How-do-I-calculate-the-amount-to-charge-my-customer-to-account-for-Duffel-Payment-fees-and-currency-conversion
- https://help.duffel.com/hc/en-gb/articles/4409049043730-In-which-countries-is-Duffel-Payments-available

**Unverified lead (not evidence):** a search-engine summary suggested the first help-centre article above lists regional card rates and that it is old. I could not open it. **Open it in a browser yourself** before relying on any Duffel card rate; it is the most likely place for the UK figure.

**Also on the pricing page (shown in $, the default display):** "$3.00" per order (charged monthly for every confirmed order); Managed Content "1%" of total order value; ancillaries "$2.00" per paid ancillary. The page has no "last updated" date.
**Confidence:** conflicting (and UK card rate not found).

---

## Q3. Stripe Issuing UK pricing, and could Damodi earn interchange?

**Answer:**
- **Per virtual card: £0.10.** Source is the docs, not the GB pricing page (the GB pricing page does not list a virtual-card fee; the US page says $0.10, consistent).
- **Per transaction:** card transaction fees are waived for the first £500,000 of card volume, then **0.2% + 15p** per transaction (GB pricing page).
- Physical card: £3.50 each (shipping extra). Disputes: £15.00 each.
- **Monthly / platform fee for Issuing: NOT FOUND.** ("No setup fees, monthly fees, or hidden fees" on the GB page sits in the standard-payments block, not Issuing.)
- **Interchange:** Stripe says Issuing lets you "Earn a share of interchange revenue." **The share percentage is NOT FOUND.** Stripe's guide says it depends on volume. UK consumer interchange is capped (0.2% debit, 0.3% credit); commercial/business interchange is not capped.
- No UK-specific Issuing price page exists: https://stripe.com/gb/issuing/pricing returned HTTP 404. Pricing is a section of the GB pricing page; its call to action is "Get in touch".

**URLs and quotes:**
- https://docs.stripe.com/issuing/cards/virtual: "Virtual cards are 0.10 USD each in the US, 0.10 GBP in the UK and 0,10 EUR in the EU."
- https://stripe.com/gb/pricing (first ~40,000 of ~74,700 chars read; Issuing section included): "0.2% + 15p" "per transaction after that."; "Earn a share of interchange revenue."
- https://stripe.com/gb/guides/earn-revenue-by-issuing-cards: "Users who hit a certain volume threshold get a percentage of the interchange earned from all card purchases."
- https://stripe.com/gb/resources/more/uk-card-processing-fees-101: "The UK caps interchange fees at 0.2% for domestic consumer debit card transactions and 0.3% for domestic consumer credit card transactions."
- https://docs.stripe.com/issuing/choose-cards (also £0.10 virtual, £3.50 physical)

**Confidence:** confirmed for per-card and per-transaction; **not found** for monthly fee and for the interchange share.

---

## Q4. Stripe Issuing: sandbox testing, and does live use need sales approval?

**Answer:** **CONFLICT in emphasis.** Sandbox testing is documented as self-serve. For live use, some pages present sign-up as self-serve and others say to contact sales; **no page says outright "live use requires approval".**

| Reading | URL | Quote |
|---------|-----|-------|
| Sandbox works | https://docs.stripe.com/issuing/testing.md?testing-method=without-code | "You can issue cards and simulate purchases using your own Stripe integration in a sandbox environment." |
| Self-serve start | https://docs.stripe.com/issuing | "If you haven’t already, create a Stripe account before you get started with Issuing." |
| Self-serve start | https://stripe.com/gb/issuing | Button "Start now"; headline "Go from integration to live cards in minutes, not months." |
| Sales-gated | https://docs.stripe.com/issuing/how-issuing-works.md | "Determine your eligibility to use Issuing by contacting Stripe sales." |
| Sales-gated | https://docs.stripe.com/issuing/global.md | "Contact us to set up your program." |
| Approval wording | https://stripe.com/gb/issuing (footer) | "Certain card programme features are subject to bank approval." |
| Pricing CTA | https://stripe.com/gb/pricing | Issuing section button "Get in touch" |

**UK availability (as written):** commercial issuing is available in the UK (docs/issuing: "Commercial issuing is available in Canada, the United States, the United Kingdom, and supported countries in the European Economic Area."). Consumer issuing is US only. Cards in the UK are issued by Stripe Payments UK Limited (gb/issuing footer).
**Not available (404):** https://docs.stripe.com/issuing/getting-started, https://docs.stripe.com/issuing/where-issuing-is-available.
**Confidence:** conflicting.

---

## Q5. Does Duffel accept virtual cards (Stripe Issuing cards) as payment for orders?

**Answer:** **Partly.** Duffel's card docs say individual and corporate cards "might be" physical or virtual, so virtual cards are not excluded in general. But:
- **Stripe Issuing is not mentioned anywhere I read** (NOT FOUND).
- **Approval is required** to pay by card at all.
- Which category a card issued to Damodi by Stripe Issuing would fall into (corporate vs agency) is NOT FOUND. Agency cards are "not widely accepted" for flights.
- Managed Content has an explicit restriction on virtual cards issued in the business's name without Duffel's written consent (services agreement, partly read).

**URLs and quotes:**
- https://duffel.com/docs/guides/paying-with-customer-cards (read in full; identical content at .../collecting-customer-card-payments): "Approval is required to pay using cards." ; "Individual cards are physical or virtual cards that are issued to an individual person."
- https://duffel.com/docs/guides/paying-with-cards-in-corporate-booking-tools (read in full): "Corporate cards are physical or virtual cards that are issued to a business"
- https://duffel.com/guides/collecting-payments-from-your-customers (read in full): "The use of Agency cards is not widely accepted for Flights Travel Suppliers and requires written permission from each Travel Supplier."
- https://changelog.duffel.com/announcements/we-now-support-card-as-an-available-payment-method (dated 25 Nov 2024): "Please note that approval is required to use card payments."
- https://duffel.com/services-agreement clause 5.2(g)(i), Managed Content only (first 39,954 of 83,970 chars read): "physical or virtual cards issued in your business name are not permitted without Duffel's prior written consent"

**Inconsistency between Duffel pages:** https://duffel.com/docs/guides/getting-started-with-flights lists payment types `arc_bsp_cash` and `balance` and describes balance as for Managed Content; it does not list `card`, while the card guide documents `type: 'card'`.
**Confidence:** conflicting (virtual cards not excluded; Stripe Issuing cards not addressed).

---

## Q6. LiteAPI virtual cards (VCC): setup, approval, sandbox payment types

**Answer:**
- The literal term "VCC" appears on **no** page I read, and **no VCC setup procedure was found** (NOT FOUND).
- "Virtual credit cards" is mentioned in the `CREDIT_CARD` and `CREDIT_CARD_SCHEDULED` descriptions. Both **need LiteAPI to enable them on your API key** ("the team"; no contact given).
- Sandbox: the only documented sandbox method is `ACC_CREDIT_CARD` (a hidden test card is attached to every sandbox key; production needs a real card attached). Whether `CREDIT_CARD` / `CREDIT_CARD_SCHEDULED` accept a VCC **in sandbox is NOT FOUND**.
- `CREDIT` needs a credit-line contract and does not work in sandbox.

Payment method names in the booking docs: `ACC_CREDIT_CARD` (account card, no enablement), `WALLET` (wallet balance), `CREDIT` (credit line), `TRANSACTION_ID` (Payment SDK), `CREDIT_CARD` (any card incl. virtual, via `pci-book.liteapi.travel`, needs enablement), `CREDIT_CARD_SCHEDULED` (charged 24 hours before check-in, needs enablement). `NUITEE_PAY` and `PROPERTY_PAY` appear only as example values in prebook `paymentTypes` and are not defined on any page read.

**URLs and quotes:**
- https://docs.nuitee.com/reference/post_rates-book (requested as docs.liteapi.travel, 301 redirect; read verbatim to ~79,900 of 94,250 chars): "Accepts any credit or debit card, including virtual credit cards." ; "Contact the team to enable this on your API key."
- https://docs.nuitee.com/docs/account-credit-card (read in full): "Each sandbox key is attached to a hidden testing ACC_CREDIT_CARD"
- https://docs.nuitee.com/docs/credit-line: "This method does not work in sandbox mode"

**Sandbox observation (my test, Q7 test below):** a prebook response in the sandbox lists `paymentTypes` of `["NUITEE_PAY","ACC_CREDIT_CARD","WALLET"]` (and adds `TRANSACTION_ID` when `usePaymentSdk` is true). `CREDIT_CARD` is not listed for this key.
**Confidence:** confirmed for enablement and for the documented sandbox method; **not found** for VCC setup.

---

## Q7. LiteAPI: can a rate be held without payment? Prebook expiry?

**Answer:**
- **No hold-without-payment step is documented.** The flow is prebook, then book. (`CREDIT_CARD_SCHEDULED` confirms immediately and charges later, which is a confirmed booking, not a hold.)
- **Prebook expiry: NOT FOUND**, both in the docs (no minutes or hours given) and in a real sandbox response (see test below). The book endpoint's 410 text says only "The room(s) may no longer be available or the rate expired".
- The docs also say the prebook ID is reusable: "The pre-booking ID is required to confirm a booking and is reusable for multiple bookings."
- **CONFLICT on a different hold** (the card-payment hold on the Payment-SDK path, not a rate hold): https://docs.nuitee.com/docs/user-payment says "the payment hold will stay for 1-2 business days before being released when the booking is not finalized." https://docs.nuitee.com/docs/direct-stripe-integration-stripe-elements says the hold "is released automatically after 1 hour."

**URLs:** https://docs.nuitee.com/reference/post_rates-prebook (read in full); https://docs.nuitee.com/reference/post_rates-book; the two payment pages above.
**Quote:** "Create a prebook session to check the availability of a rate and get final pricing before payment." (prebook page)
**Confidence:** confirmed that no hold exists in the docs read; **not found** for expiry; conflicting for the payment-hold duration.

---

## Q8. LiteAPI: how and when is the `margin` paid out?

**Answer:**
- **Weekly payouts** of confirmed bookings, where "confirmed" means the guest has **checked out** (not the API status `CONFIRMED`).
- Margin is a percentage the seller sets per request or as an account default, with "no hidden platform fees on that commission".
- **NOT FOUND:** payout method details, minimum threshold, payout currency, and **whether payouts differ by payment method**. For `ACC_CREDIT_CARD` (the method used when you are merchant of record) **the docs do not say how or whether margin is paid out**. Nuitee is merchant of record only in the SDK/whitelabel flows.

**URLs and quotes:**
- https://docs.nuitee.com/docs/revenue-management-and-commission (read in full, updated 2026-11-11): "Payouts for confirmed bookings go out weekly." ; "A booking is confirmed when a guest completes their stay and checks out of the hotel."
- https://docs.nuitee.com/docs/account-credit-card: "This method is typically used when an organization wants to be the merchant of record and when bundling products."
- https://docs.nuitee.com/docs/getting-a-sandbox-key: "Don't forget to also setup a payout method to collect your earnings."

**Confidence:** confirmed for weekly cadence; **not found** for the ACC_CREDIT_CARD case, which is the one that matters for Case 2.

---

## Q9. Stripe Vault and Forward

**What it is:** an API that lets you tokenize and store card details in Stripe's vault and forward them, via a ForwardingRequest with Stripe filling the card fields in, to a destination endpoint. Accepted objects include PaymentMethod, Card and **Issuing Card (`ic_`)**.
**URL:** https://docs.stripe.com/payments/vault-and-forward (read in full)
**Quote:** "tokenize and store card details in Stripe's PCI-compliant vault and route that data to supported processors or endpoints."

**Could it pass card details to Duffel or LiteAPI?** **NOT FOUND, and not self-serve.**
- Duffel, LiteAPI and Nuitee are **not named** on any page read. The only travel destination on Stripe's supported-endpoint list is Expedia.
- Arbitrary endpoints are not self-serve: "If your destination endpoint isn't supported or you need a different API format, share the endpoint details with your account team." Stripe then configures the endpoint for live mode.
- Access: "The Vault and Forward API is available only to businesses with a dedicated Stripe account team."
- **CONFLICT:** the docs page says forwarding goes to supported endpoints, while https://stripe.com/gb/resources/more/what-is-a-payment-vault says "to a third-party processor or endpoint of its choosing."
- Stripe does not guarantee the destination's response: "Stripe can't guarantee that the processor will provide any particular response to your forwarded API requests."
- GB is in both the destination-country and account-country lists.
- URLs: https://docs.stripe.com/payments/forwarding-third-party-processors (read in full).

**Pricing:** **NOT FOUND.** Both https://stripe.com/pricing and https://stripe.com/gb/pricing show "Contact sales" for Vault and Forward and give no per-call or per-card fee. (The "£0.10 per successful API call" near it belongs to Balances, not Vault and Forward.) Both pricing pages were only read verbatim for their first ~40,000 of ~74,700 characters, including the Vault section.
**Confidence:** confirmed for what it is; **not found** for Duffel/LiteAPI support and for pricing; conflicting on how open the destinations are.

---

## Q10. VAT-valid receipts or invoices

**Answer: NOT FOUND for a VAT-valid receipt/invoice for the bookings from any of the three.** What each says:
- **Duffel:** invoices *its customer* (the platform) in arrears and adds tax: "Invoices are in arrears and are payable by you upon delivery." Duffel's registered VAT number is shown. For the traveller, the only document described is the order's `electronic_ticket` in `documents`. No traveller receipt or VAT receipt found. (https://duffel.com/services-agreement, first 39,954 of 83,970 chars read, "Last updated on Wed, 17 Jun 2026"; https://duffel.com/docs/api/orders/create-order, first 39,944 of 59,455 chars read.)
- **LiteAPI:** does not issue a traveller receipt for API+SDK bookings: "your application is responsible for sending the traveler a booking confirmation, receipt, or invoice after the booking succeeds." The word "VAT" appears on no page read. (https://docs.nuitee.com/docs/user-payment). A guest invoice PDF endpoint exists for the whitelabel site; I did not call it.
- **Stripe:** receipts are described but **not stated to be tax invoices**; "A paid invoice is an itemized record of a completed purchase, and includes more detail than a standard receipt." Stripe leaves tax-validity to you: "You're responsible for verifying that the invoices you issue meet local tax requirements." (https://docs.stripe.com/receipts, https://docs.stripe.com/invoicing, https://docs.stripe.com/invoicing/customize, all read in full). Stripe's own **fee invoices / VAT on Stripe fees for UK**: NOT FOUND in the GB services agreement text read (partly read).
- Not opened: any Stripe support article on whether a receipt is a VAT invoice (no URL appeared; none was guessed).

**Confidence:** not found.

---

## Q11. LiteAPI: currency conversion fee when requesting GBP rates

**Answer:** **NOT FOUND.** Nothing read says conversion adds a fee. The search endpoint's `currency` parameter is described only as "The currency in which the prices will be displayed." The docs do not say how the margin is applied in a non-default currency. The book response has an `exchangeRate` field ("The exchange rate used for currency conversion.").
**URLs:** https://docs.nuitee.com/reference/post_hotels-rates (**only the first ~39,900 of ~435,400 chars were read**; ~295,000 chars were not read at all), https://docs.nuitee.com/docs/rate-request-parameters-guide (read in full), https://docs.nuitee.com/docs/revenue-management-and-commission (read in full: "there are no hidden platform fees on that commission."), https://docs.nuitee.com/docs/faq.
**Sandbox note:** a rates request with `currency: GBP` returned GBP prices. That cannot reveal a hidden fee, so it does not answer the question.
**Confidence:** not found.

---

## Q12. Duffel test mode: is the test Balance unlimited?

**Answer:** **NOT FOUND.** I read the Duffel changelog from Nov 2026 back to Jul 2024 (pages 1 to 6) and found no entry about a test balance. Entries older than Jul 2024 were **not reachable** by the fetch tool, so the "older changelog entry" in your note may simply be in that unread range. No current docs page states the test balance or says it is unlimited, so nothing contradicts your note and nothing confirms it.
**URLs:** https://changelog.duffel.com/ (pages 1 to 6); https://duffel.com/docs/api/overview/test-mode (read in full; only balance-adjacent line: "Please note that test cards are only for use with Duffel Payments."). https://duffel.com/docs/guides/test-mode and .../paying-with-balance returned 404.
**Observation, not proof:** during the earlier app build I paid several test orders from the balance and never hit an insufficient-balance error. That is consistent with a large or unlimited test balance but does not establish it.
**Confidence:** not found.
> **SUPERSEDED in Round 2 (2026-11-18): now CONFIRMED.** https://duffel.com/docs/api/payments says "In test mode, your balance is unlimited." The Round 1 reader never opened that page. See "Correction to Q12" in Round 2.

---

## Sandbox tests

Both used test keys from environment variables, made direct HTTPS calls (not through the app, so `logs/provider.log` is untouched), and printed no keys.

### Duffel hold order (test mode, never paid)

Route LHR to JFK on 2026-12-26, one adult, offer chosen by the app's existing rule (cheapest holdable offer that has a price guarantee).

| | Offer used | Offer's `payment_requirements` | Result |
|---|---|---|---|
| **The offer I used** | Iberia, £214.24 (`off_034x6J6fKQEth8AB4vD2Iq`) | `requires_instant_payment: false`, `payment_required_by: 2026-11-16T22:07:13Z`, `price_guarantee_expires_at: 2026-11-15T22:07:13Z` | **Hold did NOT work.** HTTP 422, code `invalid_order_create_type`, "The specified `type` was incorrect." Nothing was created. |
| Comparison offer (no price guarantee) | Lufthansa, £321.35 | `requires_instant_payment: false`, `payment_required_by: 2026-11-16T22:07:00Z`, `price_guarantee_expires_at: null` | **Hold worked.** Order `payment_status`: `payment_required_by: 2026-11-16T22:07:00Z`, `price_guarantee_expires_at: 2026-11-13T23:59:59Z`, `awaiting_payment: true`. Cancelled straight away (create 201, confirm 200); never paid. |

Findings from this test:
1. **The offer I used could not be held**, even though it reported `requires_instant_payment: false` *and* had a price guarantee. So `requires_instant_payment=false` is not a reliable "can hold" signal in test mode, and neither is the price guarantee (earlier app runs held American Airlines, Duffel Airways and Lufthansa offers fine).
2. On the Lufthansa hold, the **order** showed a `price_guarantee_expires_at` (2026-11-13T23:59:59Z) although the **offer** had `null`. The order's value is what applies once held.
3. For the app: the existing fallback (hold rejected, nothing created, use the instant flow) already covers this. The offer-choice rule is a preference, not a guarantee. No code was changed in this task.

### LiteAPI sandbox prebook

Hotel `lp19c4c`, 2026-12-26 to 2026-12-29, GBP, cheapest refundable rate (price £200.88).
- **No expiry field exists in the prebook response.** I searched every key in the response for names matching expir / valid / ttl / until / deadline / timeout / lifetime: **none found**. Top-level fields: `prebookId, offerId, hotelId, currency, termsAndConditions, roomTypes, suggestedSellingPrice, isPackageRate, commission, price, priceType, priceDifferencePercent, cancellationChanged, boardChanged, supplier, supplierId, paymentTypes, checkin, checkout, sellingPriceToUser`.
- With `usePaymentSdk: true` the response adds `transactionId` and `secretKey` (value not printed) and still has no expiry field.
- Each prebook of the same offer returned a **new** `prebookId`.
- Nothing was booked.

**Result for Q7:** prebook expiry is **not stated in the docs and not returned by the API**. Report it as unknown.

---

## Summary table

| Q | One-line answer | Confidence | Source URL |
|---|---|---|---|
| 1 | Standard UK cards 1.5% + 20p; EEA 2.5% + 20p; international 3.15% + 20p; +2% if currency conversion | confirmed | https://stripe.com/gb/pricing |
| 2 | No UK card rate readable; pricing page says 2% FX, guides call 2% an interchange fee and give 2.9% only as an example; help-centre pages 403 | conflicting | https://duffel.com/pricing ; https://duffel.com/guides/understanding-margin-and-markups |
| 3 | £0.10 per virtual card; 0.2% + 15p per transaction after first £500k; monthly fee and interchange share not found | confirmed (fees) / not found (monthly fee, share) | https://stripe.com/gb/pricing ; https://docs.stripe.com/issuing/cards/virtual |
| 4 | Sandbox is self-serve; live access wording conflicts (self-serve "Start now" vs "contact sales" / bank approval) | conflicting | https://docs.stripe.com/issuing/how-issuing-works.md ; https://stripe.com/gb/issuing |
| 5 | Duffel allows "physical or virtual" individual/corporate cards with approval; Stripe Issuing cards not mentioned | conflicting | https://duffel.com/docs/guides/paying-with-customer-cards |
| 6 | No "VCC" page or setup found; CREDIT_CARD / CREDIT_CARD_SCHEDULED need enabling; only ACC_CREDIT_CARD documented for sandbox | confirmed (enablement) / not found (VCC setup) | https://docs.nuitee.com/reference/post_rates-book |
| 7 | No hold without payment; prebook then book; prebook expiry not in docs or API response | not found | https://docs.nuitee.com/reference/post_rates-prebook |
| 8 | Payouts weekly, after guest check-out; how margin is paid for ACC_CREDIT_CARD not stated | confirmed (weekly) / not found (ACC_CREDIT_CARD) | https://docs.nuitee.com/docs/revenue-management-and-commission |
| 9 | Stripe forwards stored cards to approved endpoints; needs account team; Duffel/LiteAPI not listed; price "Contact sales" | not found (Duffel/LiteAPI, price) | https://docs.stripe.com/payments/vault-and-forward |
| 10 | No VAT-valid traveller receipt from any of the three; Duffel invoices the platform; LiteAPI says the app must send receipts | not found | https://duffel.com/services-agreement ; https://docs.nuitee.com/docs/user-payment ; https://docs.stripe.com/receipts |
| 11 | No FX fee mentioned for GBP rates; largest part of the rates page unread | not found | https://docs.nuitee.com/reference/post_hotels-rates |
| 12 | ~~No page states the test balance~~ **Corrected in Round 2:** the payments reference says test-mode balance is unlimited | confirmed (Round 2) | https://duffel.com/docs/api/payments |
| Test | Duffel hold failed on the offer used (422 `invalid_order_create_type`), worked on another; LiteAPI prebook has no expiry field | confirmed (observed) | sandbox calls, 2026-11-13 |

---

## What this changes: the £1,000 example table and the case recommendation

**I do not have your £1,000 example table** (it is not in the repository), so I cannot say which cells change. These are the inputs from this research that a fee table would depend on, and how solid each is:

| Table line | Use | Status |
|-----------|-----|--------|
| Customer pays Damodi by card (Stripe) | 1.5% + 20p for a standard UK card; 3.15% + 20p for non-UK/EEA cards; +2% if currency conversion; 2.5% + 20p EEA | **Usable**, from Stripe's GB page. Premium UK cards are 2.8% + 20p. |
| Damodi pays Duffel | Card rate **unknown** (Q2). Per-order fee shown as $3.00 and a 1% Managed Content fee, in USD, charged monthly; 2% FX if converting | **Do not fill in a card rate.** Mark "unknown, help-centre page unreadable". Currency of the per-order fee in GBP is unknown. |
| Damodi pays LiteAPI | Hotel price at the provider's rate; no platform fee or FX fee found | Use the quoted price; mark FX as "none found, not verified". |
| Damodi earns margin | Weekly payout after check-out (Q8) | **Not found** for the ACC_CREDIT_CARD route: do not assume margin is paid when Damodi is merchant of record. |
| Stripe Issuing card to pay providers | £0.10 per virtual card; 0.2% + 15p per transaction after the first £500,000 | Usable for the card cost. Interchange earned: **share unknown**, so show it as upside, not a number. |
| VAT | Which party issues a VAT-valid receipt | **Not found** for all three. Do not claim VAT-valid receipts from the providers. |

**Which case I would recommend, from this evidence only:**
- **Case 2** (Damodi sells and pays Duffel from balance and LiteAPI with the account card) is the route where **every step is documented and was actually run** in the sandboxes (hold, pay, `ACC_CREDIT_CARD` booking, cancellations). I recommend it for the take-home as the implemented case.
- **A card-based case (Stripe Issuing cards paying the providers, which `.env.example` ties to the "Case 3 experiment")** has several unconfirmed links: Duffel card payments need approval and do not name Stripe Issuing; LiteAPI `CREDIT_CARD` needs enablement and sandbox support is not documented; Stripe Issuing live access wording conflicts; Vault and Forward does not list Duffel or LiteAPI and is account-team only. I would present it as **possible but unverified**, with these as the questions to put to the vendors, not as a recommended route.
- The one result that changes the *design* rather than a number is the hold test: a Duffel hold can be rejected on an offer that reports it is holdable, so the booking order must keep the instant-pay fallback (hotel first). That is already built.
- I only know Case 2 and the "Case 3 is Stripe" hint from the repo, not how your Case 1 is defined, so I have not compared against it.

## Things worth doing manually before you submit

1. Open the three Duffel help-centre articles (403 to the fetch tool) in a normal browser; they likely hold the regional card rates for Q2.
2. Read the remainder of the LiteAPI rates page (about 295,000 characters unread) for any currency wording (Q11).
3. Ask Duffel and LiteAPI (and Stripe, for Issuing) the specific questions marked NOT FOUND: Duffel card rate and Stripe Issuing card acceptance; LiteAPI prebook lifetime, margin payout under `ACC_CREDIT_CARD`, and VCC enablement; Stripe Issuing interchange share and live-approval steps.


---
---

# Round 2

Date read for every item: **2026-11-18**. Same rules as Round 1 (confidence = confirmed / conflicting / not found; NOT FOUND and CONFLICT are literal; no figure is estimated; quotes under 25 words).

Round 2 covers four areas: (A) Case 2 cash float, (B) Case 2 refunds and chargebacks, (C) Case 1 markup, (D) Case 1 single card entry. Nothing in the app was changed.

**Method notes for Round 2**
- Pages were again fetched by fetch-tool sub-agents. **I re-fetched three Duffel pages myself with curl and searched their text** (the test-mode page, the payment-method guide, the payments reference). That check found that one agent had attributed a quote to the wrong page (see "Correction to Q12"). Other quotes are transcribed from the agents' reports, so **re-check any quote you cite** against its URL.
- Sandbox probes (Step 2) used test keys from environment variables and printed no key.
- **Pages that could not be read (permanent errors):**
  - HTTP 403: https://help.duffel.com/hc/en-gb/articles/360019652340-How-do-I-top-up-my-Duffel-Balance (the Duffel top-up guide, the most likely home of the minimum top-up and timing), https://help.duffel.com/hc/en-gb/articles/4408837948946 (a refunds article), and the help-centre home.
  - HTTP 404: https://duffel.com/docs/guides/managing-your-balance, .../payment-methods, .../managed-content, https://duffel.com/docs/api/v2/payments/cards (the Duffel Cards API reference).
- **Partly read:** the LiteAPI rates reference (about 40,000 of 435,000 characters), the LiteAPI book reference (verbatim to about 80,000 of 98,000), the Duffel create-order reference (about 40,000 of 59,000, so the `payments` array and `amount` description were not seen), the Duffel changelog (pages 1 to 6 of 32 only), the Stripe SSA legal text (partly).
- Duffel, LiteAPI and Stripe pages sometimes returned identical content at different URLs (for example `/docs/api/order-cancellations/create-order-cancellation` returned the overview page). Those are noted where it matters.

---

## Correction to Q12 (Round 1): Duffel test-mode balance is unlimited, CONFIRMED

**Answer:** In test mode the Duffel balance is unlimited.
**URL:** https://duffel.com/docs/api/payments
**Quote:** "In test mode, your balance is unlimited."
**Date read:** 2026-11-18. I confirmed this myself by fetching the page and searching its text.
**Confidence:** confirmed.
**Why Round 1 missed it:** Round 1 read the test-mode overview page (https://duffel.com/docs/api/overview/test-mode), which has no balance wording (I re-checked: it does not contain the word "balance"). The Round 2 reader attributed the quote to that page, which was wrong. The sentence is on the payments reference page. This matches your older changelog note; no newer page contradicts it.
**Limit:** this is test mode only. It says nothing about live balances.

---

## A. Case 2: how a Duffel balance is funded (for sizing the float)

| # | Question | Answer | Confidence |
|---|----------|--------|------------|
| A1 | How is the balance funded? | **Bank transfer.** Nothing says you can top up by card. Damodi must fund it itself, from whatever it collects from customers. | confirmed |
| A2 | Minimum top-up | **NOT FOUND.** The Duffel top-up guide is the likely source and returned 403. | not found |
| A3 | How long a top-up takes | **NOT FOUND as a number.** Only: top-ups follow "normal bank processing timelines". | not found |
| A4 | Can it go negative, overdraft, auto top-up? | **NOT FOUND** for negative balance, overdraft/credit and auto top-up. Duffel may reject orders without funds. Low-balance notifications exist. | not found |
| A5 | Per-currency balance / currency mismatch | **NOT FOUND** for separate per-currency balances. A balance-priced order's currency "matches your organisation's billing currency". A 2% FX charge applies when conversion is needed. | not found (partial) |
| A6 | Is balance limited to some products or needs approval? | **CONFLICT** (see below). No balance-specific approval wording found. | conflicting |

**Sources and quotes**
- A1: https://duffel.com/guides/collecting-payments-from-your-customers (verified by me): "You fund your Duffel Balance by bank transfer." Same page: "If you plan to collect payment from your customers to fund your Balance then you must collect such payment yourself." Also https://duffel.com/services-agreement clause 5.1.
- A3: https://duffel.com/services-agreement clause 5.1 (last updated 17 Jun 2026): "(note any top-up is subject to normal bank processing timelines)".
- A4: https://duffel.com/services-agreement: "Duffel reserves the right to reject any order requests where there are insufficient funds." Payment-method guide: "We also offer low balance notifications to ensure you never run out of funds." (verified by me). Clause 7.1A also lets Duffel recover fines "from your Balance or Deposit".
- A5: https://duffel.com/docs/api/payments (verified by me): "If the order was priced with balance, it matches your organisation's billing currency." https://duffel.com/pricing: "We will charge 2% on the exchange rate." The services agreement says Duffel "reserves the right to include a transaction fee for currency conversion services". The services agreement refers to a single "Balance Currency" chosen at sign-up.
- A6, **CONFLICT:**
  - https://duffel.com/docs/guides/getting-started-with-flights: "`balance` if you are using Managed Content."
  - https://duffel.com/services-agreement, clause 5.1 heading: "Duffel Settlement (only available for Managed Content)".
  - https://duffel.com/docs/api/payments (verified by me): "You can pay using your Duffel account's balance by specifying `balance`." It does not mention Managed Content.
  - **Why it matters:** if the balance route is only for Managed Content in live mode, then Case 2 (and the app) may not be available to Damodi on live without Duffel's agreement. Test mode works (the app proved it). Treat as an open question for Duffel.

**What this means for sizing the float at 50 trips a month (arithmetic on your inputs only):**
- Flight spend through the balance = 50 × £570 = **£28,500 a month** (net of any Duffel fees).
- The float actually needed depends on how long a top-up takes and how often Damodi tops up. Both are **NOT FOUND**, so a float figure is left **blank**. Do not enter a number in the report.
- Cash timing also depends on when Stripe pays Damodi out (not researched in Round 2).

**Other balance facts:** the card-payment page says "approval is required"; the balance route has no such wording. Stays (hotels via Duffel) are out of scope.

---

## B. Case 2: refunds and chargebacks

### B-Stripe. A chargeback on a UK card payment (Damodi is the seller on its own Stripe account)

| # | Question | Answer | Confidence |
|---|----------|--------|------------|
| B1 | Who bears it | **The merchant (Damodi).** Stripe debits the disputed amount plus a fee from Damodi's Stripe balance and holds it for the whole dispute. | confirmed |
| B2 | UK dispute fee | **£20.00** per dispute received. Non-refundable even if you win. A further **£20.00** "dispute countered" fee applies if you submit evidence, returned only if you win. A **£20.00** "dispute appealed" fee is not returned even on a win. | confirmed (with a CONFLICT on a $15 figure, below) |
| B3 | Evidence deadline | **Usually 7 to 21 days** after the dispute opens, depending on the card network. Miss it and you lose. A UK-specific deadline is **NOT FOUND**. | confirmed (generic), UK-specific not found |
| B4 | Is the processing fee returned on a refund / lost dispute? | **Refund: no.** Lost dispute: **NOT FOUND** for the original processing fee. | confirmed / not found |
| B5 | Timing | Customers can usually dispute within **120 days** of payment. **For travel the window starts on the event date, not the payment date.** A dispute can take **2 to 3 months**. Issuer decision after evidence: usually 60 to 75 days. | confirmed |

**Sources and quotes**
- B1: https://docs.stripe.com/disputes/how-disputes-work: "Debits the disputed amount, plus a dispute fee, from your Stripe account." Also "These funds are held for the entire duration of the dispute." https://docs.stripe.com/disputes/responding: "For businesses outside Mexico, the fee for receiving a dispute is non-refundable."
- B2: https://stripe.com/gb/pricing: "Dispute received fee £20.00". Support article https://support.stripe.com/questions/june-2025-pricing-updates-for-disputes lists United Kingdom / GBP at 20 for received and 20 for countered. Quote: "You get this fee back for won disputes. You don't get this fee back for lost disputes." (the countered fee). Network fees can apply on top. Smart Disputes charges 30% of the disputed amount per win (separate paid product, not needed).
- **CONFLICT on the fee:** https://stripe.com/gb/resources/more/chargebacks-101 (UK article, "Last updated 16 March 2026"): "There is a $15 fee for each chargeback." versus the UK pricing page's **£20.00**. Different currencies on two Stripe UK pages. I use £20 (pricing page and support article agree). Note: Round 1's "£15.00 per dispute" is the **Issuing** dispute fee, a different product.
- B3: https://docs.stripe.com/disputes/responding: "usually 7 to 21 days, depending on the card network".
- B4: https://docs.stripe.com/refunds: "Stripe's processing fees from the original transaction aren't returned."
- B5: https://docs.stripe.com/disputes/how-disputes-work: "Card networks typically allow cardholders to initiate disputes within 120 days of the original payment". Same page: "the dispute window starts on the event date, not the payment date." Refund reaches the customer "approximately 5-10 business days later" (https://docs.stripe.com/refunds).
- Also on that page: you cannot refund outside the dispute process while a dispute is open.

**Why this matters for Case 2:** Damodi is the merchant, so a customer chargeback hits Damodi's Stripe balance (amount plus £20) even if Duffel or LiteAPI has already been paid and the ticket or room is gone. For travel, the dispute window runs from the **event date**, so exposure can last beyond the trip. The Stripe pages say nothing about getting that money back from Duffel or LiteAPI, and the provider pages say nothing about it either (see B12).

### B-Duffel. Where a flight refund goes

| # | Question | Answer | Confidence |
|---|----------|--------|------------|
| B6 | Where does a cancellation refund go? | **CONFLICT in the docs; observed in a test: back to the balance.** | conflicting (docs) / confirmed (test) |
| B7 | Timing | **NOT FOUND.** | not found |
| B8 | Duffel fee on a cancellation; fare rules | Refund amount follows the fare conditions and "may be 0.00". A Duffel fee on cancellation is **NOT FOUND**. | confirmed (fare rules) / not found (fee) |

- B6 docs, **CONFLICT:**
  - https://duffel.com/docs/guides/cancelling-an-order: "the refund amount will be sent to the original form of payment used to pay for the order." (example `refund_to: original_form_of_payment`)
  - https://duffel.com/docs/api/order-cancellations: "will be returned to your original payment method (e.g. your Duffel balance)." Its example response shows `refund_to: arc_bsp_cash`.
  - Possible `refund_to` values include balance, card, voucher, airline_credits and original_form_of_payment, with no definition of what "balance" means.
- **Observed in a test (Step 2):** a cancellation *quote* on an earlier test order paid from the balance returned `refund_to: balance`, `refund_amount: 218.06 GBP` (the full amount). It was **not confirmed**. Test orders on a fake airline may be fully refundable. Live fares are not: "determined according to the fare conditions" and "This may be 0.00 if the fare is non-refundable." (https://duffel.com/docs/api/order-cancellations)
- Airline credits: "Cancellations that will be refunded to airline credits will have the refund_to property set to airline_credits." (https://duffel.com/docs/guides/cancelling-an-order)
- B7: the docs say only that confirming means "the refund offered in the quote should be applied"; no time is given.
- B8: "Cancellation is not yet supported for every order." (https://duffel.com/docs/api/order-cancellations). Penalties appear only in order *change* offers, not cancellations.
- **Duffel Payments refunds product:** https://duffel.com/docs/api/refunds is for refunding a customer's payment intent. It says: "We are currently not accepting new customers on to this product". It is unclear whether that refers to Duffel Payments as a whole or only the refunds API. **Ask Duffel** (this affects Case 1).
- **Chargebacks on the Duffel side:** NOT FOUND (the help-centre refunds article returned 403).

### B-LiteAPI. Where a hotel refund goes

| # | Question | Answer | Confidence |
|---|----------|--------|------------|
| B9 | Refund destination by payment method | **NOT FOUND in the docs.** The cancel endpoint returns the amount refunded and the cancellation fee but not a destination. | not found |
| B10 | Refund timing | **NOT FOUND in the docs.** Observed in the sandbox: refunded in the same second as the cancel. | not found (docs) |
| B11 | Cancellation-fee rules; who bears a fee > 0 | Rules by `refundableTag` and `cancelPolicyInfos`. Who bears a charge for the seller: **NOT FOUND.** | confirmed (rules) / not found |
| B12 | Chargebacks on the hotel side | **NOT FOUND.** | not found |

- B9: https://docs.nuitee.com/docs/account-credit-card: "Payments are processed immediately through the attached credit card." It does not describe refunds. The cancellation reference (https://docs.nuitee.com/reference/put_bookings-bookingid.md) returns "Amount refunded (if applicable)".
- B11: https://docs.nuitee.com/docs/canceling-a-booking: a cancel on a non-refundable booking "will still terminate the booking, but it will not refund the purchase price." A cancellation policy amount is "the amount the user will be charged if they cancel after that policy date." (agent-quoted; "user" is not defined as buyer or seller)
- B12: the SDK page makes Nuitee merchant of record for the guest's card charge (SDK flow only). For **flights** (a different product) Nuitee says it carries "chargeback handling and refund execution". Nothing for hotels.
- **Observed in the sandbox (Step 2):** a hotel booking I had cancelled shows `paymentStatus: "refunded"`, `refundType: "full"`, `amountRefunded: 187.19` (GBP, the full price), `refundedAt` equal to `cancelledAt` (same second). A live booking shows `paymentStatus: "succeeded"`. The record has a `processingFee` of **2.49** on a 187.19 booking, unchanged after the cancel. **What `processingFee` means is NOT FOUND in any page read; do not interpret it.** The record does not name where the refund went.
- Sandbox only. A real card refund (and any timing) is not shown.

---

## C. Case 1: markup on a Duffel order and on a LiteAPI booking

### C-Duffel

| Route | Can a markup be added? | How | Fee | Confidence |
|-------|-----------------------|-----|-----|------------|
| **Duffel Payments** (Duffel collects the customer's money) | **Yes** | Put your markup into the order `amount` you send. Not possible in the Dashboard; API only. | Card % **NOT FOUND** (see Q2: "2% interchange fee" vs "2.9% an example"). The pricing-page fees are not tied to a route (see below). | conflicting (fee) |
| **Card pass-through** (customer's card pays the airline) | **No, per one page** (**CONFLICT** with another) | Card payments must equal the supplier's exact amount. | **NOT FOUND** | conflicting |
| **Balance** (Damodi pays Duffel, charges the customer itself) | **Yes** | Damodi charges the customer first, then pays Duffel from balance. | No balance-specific fee stated | confirmed (mechanism) / not found (fee) |

- Duffel Payments, https://duffel.com/guides/understanding-margin-and-markups (same text at /docs/guides/margin-and-markups): "You still pass the field `amount` to us that includes your own markup and covers the cost of the flight." The guide gives a formula: ((offer and services total_amount + markup) x FX rate) / (1 - Duffel Payments fee). Limit: "If the entire cost of the flight is greater than £5,000 you'll get a validation error." Dashboard: "Currently, we do not provide the ability for agents to markup fares in our Dashboard." How the markup is **paid out** to the platform: **NOT FOUND as text** (only an image caption saying money flows into "the Duffel platform and your organisation balance").
- Card pass-through, **CONFLICT:**
  - https://duffel.com/guides/collecting-payments-from-your-customers: "You cannot markup or discount the transaction as card payments must be for the exact amount quoted by the travel supplier."
  - https://duffel.com/guides/understanding-margin-and-markups says its card guide "walks through collecting customer payments including adding a markup", but the card guide (https://duffel.com/docs/guides/paying-with-customer-cards) has no markup text.
  - Approval is also required: "Approval is required to pay using cards." Agency cards need written permission from each airline.
- Balance, https://duffel.com/guides/understanding-margin-and-markups: "you have greater flexibility on the markup, as long as your balance has enough funds to cover the cost of the flight." and "You should charge the customer yourself before creating the order." Unresolved: https://duffel.com/docs/guides/getting-started-with-flights says the payment amount "should match the offer's total_amount" (the amount paid to Duffel, which is consistent with the markup being charged separately, but the pages do not say so). The **balance-only-for-Managed-Content** conflict in A6 applies here too.
- **Fees on https://duffel.com/pricing** (shown in $ in the readable text; the page has GBP/USD/EUR/AUD tabs but the GBP figures were not in the text read): Orders "$3.00" per order; Managed Content "1%" of order value; ancillaries "$2.00" each; FX "2%". The page does not say which payment route each fee applies to. Any mapping of these fees to a route is **NOT FOUND** (do not infer it).
- Not read: the create-order reference's `payments` array / `amount` text; changelog pages 7 to 32.

### C-LiteAPI

| Route | Can a markup be added? | How | Fee | Confidence |
|-------|-----------------------|-----|-----|------------|
| **Payment SDK / NUITEE_PAY** (guest pays LiteAPI; Nuitee is merchant of record) | **Yes** | Set `margin` per request or as an account default; paid out weekly after check-out | **No platform fee on the commission stated**; no share of commission stated | confirmed |
| **ACC_CREDIT_CARD** (Damodi is merchant of record) | **NOT STATED whether `margin` applies.** Damodi can charge its own customer more. | The revenue guide advises net rates with a separate service fee | none stated | not found (for margin) |
| **CREDIT_CARD via pci-book** | NOT FOUND | enablement needed | NOT FOUND | not found |

- https://docs.nuitee.com/docs/revenue-management-and-commission: "A margin of `15` adds 15% to the rate, which the seller then earns as a commission." and "You set the margin; there are no hidden platform fees on that commission." Weekly payout wording as in Q8.
- `margin` on the rates search: "When provided, this value takes precedence over your account-level margin setting" (https://docs.nuitee.com/reference/post_hotels-rates, partly read). The account default is set in the dashboard commission section. There is no `sellingPrice` request input; `sellingPrice` is a response field.
- For merchant-of-record sellers, the guide's advice: "applying your commission via an alternate payment method, such as through a separate service fee". The ACC_CREDIT_CARD page itself says: "This method is typically used when an organization wants to be the merchant of record and when bundling products." and its example bundles a $100 tour fee on top of the room.
- **Fees:** https://docs.nuitee.com/reference/api-pricing-usage-costs: core booking endpoints (Rates, Prebook, Book) are "Free" within a 5000:1 search-to-book ratio. Other endpoints have usage costs (not needed here). The 1% ticketing fee is flights only.
- **Restriction, selling below the suggested selling price (SSP):** "If you choose to sell below the SSP, this must not be done in a public-facing way." Allowed routes are app-only or logged-in rates, closed user groups, or bundles. A margin minimum or maximum: **NOT FOUND.** Price parity: **NOT FOUND.**
- LiteAPI **page conflicts** (do not affect the markup answer): what SSP is and where it comes from differs between the revenue guide and the JSON structure guide; "confirmed" means check-out in the revenue guide but `CONFIRMED` status in the book response.

---

## D. Case 1: can the traveller enter a card once for both providers?

**Short answer: NOT FOUND.** No page says one card entry can serve both Duffel and LiteAPI. The pages describe two separate capture paths, and neither provider's pages mention the other.

| Question | Duffel | LiteAPI | Stripe Vault and Forward |
|----------|--------|---------|--------------------------|
| How the card is captured | `DuffelCardForm` (an iframe component) returns a Card ID. A raw card API (`api.duffel.cards`) exists for **corporate booking tools only**. | Payment SDK (hosted form), or Stripe Elements on **LiteAPI's own Stripe account**, or a raw card via `pci-book.liteapi.travel` | N/A (forwards cards already in Stripe's vault) |
| Approval or access | "Approval is required to pay using cards." | `CREDIT_CARD`: "Contact the team to enable this on your API key." SDK path: no enablement wording | "available only to businesses with a dedicated Stripe account team" |
| One form for both providers | NOT FOUND | NOT FOUND | NOT FOUND |
| Token from Stripe accepted | NOT FOUND (Stripe not mentioned) | NOT FOUND (PaymentIntent is created on LiteAPI's Stripe account) | Neither `api.duffel.cards` nor `pci-book.liteapi.travel` is on Stripe's supported-endpoint list |
| Card reuse | Saved cards exist inside Duffel only | NOT FOUND | NOT FOUND |
| 3D Secure | Required before authorisation | Handled by the Elements flow | Stripe: "If you need 3DS authentication across multiple payment processors, contact your account team." |

**Sources and quotes**
- **Duffel:** https://duffel.com/docs/guides/paying-with-customer-cards: "render a PCI-complaint form to capture the card and return a Card ID" (the page's spelling). "Approval is required to pay using cards." "Card payments must be authenticated before authorisation of a payment can be given." Card component page https://duffel.com/docs/guides/card-form-component-with-3dsecure: a card can be saved ("This card will be stored in our system until you delete it, or the expiry date lapses."); a temporary card must be used within 25 minutes. Raw card route: https://duffel.com/docs/guides/paying-with-cards-in-corporate-booking-tools: "pass the card details to be able to pay for the booking from your environment to Duffel" (corporate environments, approval required; the page says the host `api.duffel.cards` "is different from other endpoints").
- **Not stated by Duffel:** whether a card ID works outside Duffel; whether a Stripe token can be passed in; whether a PCI-compliant merchant outside corporate tools may send a raw card; whether the traveller must be present for online 3DS (only the offline "you must specify the cardholder as not present" case is stated); approval criteria and timing. The Cards API reference returned 404.
- **LiteAPI:** https://docs.nuitee.com/docs/user-payment: Nuitee's built-in payment SDK; "Nuitée Connect is the merchant of record (MoR) for the guest's card charge." https://docs.nuitee.com/docs/direct-stripe-integration-stripe-elements: "the PaymentIntent is created on LiteAPI's Stripe platform when you call the prebook endpoint". It adds: "You never need your own Stripe account or your own server-side Stripe integration". https://docs.nuitee.com/reference/post_rates-book: "Send card details via the secure payment endpoint (https://pci-book.liteapi.travel) using the billingInfo object".
- **Stripe Vault and Forward:** https://docs.stripe.com/payments/vault-and-forward: "inserting the card details from the PaymentMethod into the request.body". Accepts `pm_`, `card_` and `ic_` objects. The destination receives the raw card number and CVC in a JSON or XML HTTP body. "CVCs expire automatically after a certain time period", so later forwards may lack the CVC. "The Vault and Forward API is available only to businesses with a dedicated Stripe account team." Destinations on the list include Adyen, Checkout.com, Worldpay and Expedia; "Your own PCI-compliant token vault" is also listed; for any other endpoint: "share the endpoint details with your account team."
- **Not stated by Stripe:** whether Duffel or LiteAPI endpoints can be configured (the page only says to contact the account team).
- Read status: the LiteAPI book reference was read verbatim for the first ~40,000 of ~98,000 characters in this pass.

**What this means for Case 1:** as documented, the traveller would see **one card form per provider** (a Duffel card form and a LiteAPI payment form), and Duffel's card route needs approval. A single card entry via Vault and Forward is **not documented** for either provider and would need Stripe's account team plus each provider's agreement. Treat it as unproven.

---

## Step 2: sandbox probes (only where the docs left a gap)

All used test keys from environment variables. No key was printed. No booking was created or confirmed in this step.

| Probe | What I did | Result |
|-------|-----------|--------|
| Duffel refund destination | Created a cancellation **quote only** (not confirmed) on an earlier paid test order | `refund_to: balance`, `refund_amount: 218.06 GBP` (full), `confirmed_at: null`. The unconfirmed quote lapses at its `expires_at`. |
| LiteAPI refund | Read-only GET on a sandbox booking I cancelled earlier, and on one still confirmed | Cancelled: `paymentStatus: "refunded"`, `refundType: "full"`, `amountRefunded: 187.19`, `refundedAt` = `cancelledAt` (same second). Confirmed: `paymentStatus: "succeeded"`. `processingFee: 2.49` on both (meaning not documented). |
| Stripe Issuing in your sandbox | Read-only `GET /v1/issuing/cardholders?limit=1` and `GET /v1/account` with your test key | **Issuing is not available.** HTTP 400, `invalid_request_error`, message: "Your account is not set up to use Issuing. Please visit https://dashboard.stripe.com/issuing/overview to get started." The sandbox account's country is **US**, so even once enabled it could not show UK Issuing terms. I did not try to enable it. |

---

## Round 2 summary table

| # | Question | One-line answer | Confidence | Source URL |
|---|----------|-----------------|------------|-----------|
| Q12 (corrected) | Duffel test balance unlimited? | Yes, in test mode | confirmed | https://duffel.com/docs/api/payments |
| A1 | How is a Duffel balance funded? | Bank transfer; customers' money must be collected by Damodi itself | confirmed | https://duffel.com/guides/collecting-payments-from-your-customers |
| A2 | Minimum top-up | Not stated on readable pages (top-up guide returned 403) | not found | https://help.duffel.com/hc/en-gb/articles/360019652340-How-do-I-top-up-my-Duffel-Balance |
| A3 | Top-up time | Only "normal bank processing timelines"; no number | not found | https://duffel.com/services-agreement |
| A4 | Negative balance / overdraft / auto top-up | Not stated; orders can be rejected for insufficient funds; low-balance alerts exist | not found | https://duffel.com/services-agreement |
| A5 | Per-currency balance | Not stated; balance orders use the organisation's billing currency; 2% FX | not found | https://duffel.com/docs/api/payments |
| A6 | Is balance limited to Managed Content? | Pages disagree | conflicting | https://duffel.com/docs/guides/getting-started-with-flights ; https://duffel.com/docs/api/payments |
| B1-B2 | Stripe UK chargeback cost | Damodi loses the amount plus **£20** (non-refundable); counter fee £20 refunded only on a win | confirmed | https://stripe.com/gb/pricing ; https://docs.stripe.com/disputes/how-disputes-work |
| B2 | Stripe fee wording | A UK Stripe article says "$15"; pricing page says £20 | conflicting | https://stripe.com/gb/resources/more/chargebacks-101 |
| B3 | Evidence deadline | Usually 7 to 21 days, by card network; UK-specific not stated | confirmed (generic) | https://docs.stripe.com/disputes/responding |
| B4 | Fee on refund / lost dispute | Original processing fee not returned on a refund; lost-dispute case not stated | confirmed / not found | https://docs.stripe.com/refunds |
| B5 | Dispute timing | 120 days; for travel it starts on the event date; 2 to 3 months to resolve | confirmed | https://docs.stripe.com/disputes/how-disputes-work |
| B6 | Duffel refund destination | Docs disagree; test quote returned `balance` | conflicting (docs) | https://duffel.com/docs/guides/cancelling-an-order ; https://duffel.com/docs/api/order-cancellations |
| B7-B8 | Duffel refund timing and fee | Timing and any Duffel cancellation fee not stated; refund follows fare rules | not found | https://duffel.com/docs/api/order-cancellations |
| B9-B10 | LiteAPI refund destination and timing | Not stated; sandbox shows full refund the same second | not found | https://docs.nuitee.com/docs/canceling-a-booking |
| B11 | LiteAPI fee > 0, who bears it | Rules given; who bears it not stated | not found | https://docs.nuitee.com/docs/canceling-a-booking |
| B12 | Provider-side chargebacks | Not found for Duffel or LiteAPI hotels | not found | https://docs.nuitee.com/docs/user-payment |
| C1 | Duffel markup, Duffel Payments | Yes, via the order `amount`; card % not found; payout not stated | conflicting (fee) | https://duffel.com/guides/understanding-margin-and-markups |
| C2 | Duffel markup, card pass-through | One page says no, another implies yes; approval required | conflicting | https://duffel.com/guides/collecting-payments-from-your-customers |
| C3 | Duffel markup, balance | Yes (Damodi charges the customer itself); no fee stated for this route | confirmed (mechanism) | https://duffel.com/guides/understanding-margin-and-markups |
| C4 | LiteAPI markup | Yes via `margin`; weekly payout; no platform fee stated; not stated for ACC_CREDIT_CARD | confirmed / not found | https://docs.nuitee.com/docs/revenue-management-and-commission |
| D | One card entry for both providers | Not documented; two separate card forms are the documented path | not found | https://duffel.com/docs/guides/paying-with-customer-cards ; https://docs.stripe.com/payments/vault-and-forward |
| Probe | Stripe Issuing in your sandbox | Not available: "Your account is not set up to use Issuing"; account country US | confirmed (observed) | sandbox call, 2026-11-18 |

## Open questions for the vendors (from Round 2)

1. **Duffel:** minimum top-up, top-up lead time, negative balance or credit, and auto top-up (the top-up help article is unreadable).
2. **Duffel:** is `balance` payment available to Damodi in live mode without Managed Content? (A6 conflict.)
3. **Duffel:** the Duffel Payments card rate for UK cards, how a markup is paid out, and whether Duffel Payments and its refunds API are open to new customers.
4. **Duffel:** can card pass-through carry a markup at all? What does `refund_to: balance` mean for a live refund, and how long does it take?
5. **LiteAPI:** does `margin` apply and get paid out under `ACC_CREDIT_CARD`? Where do hotel refunds go and how fast? What is `processingFee`?
6. **Stripe:** can Vault and Forward be configured for `api.duffel.cards` or `pci-book.liteapi.travel`? Issuing live access and the interchange share.
