# Payment Request — Google Pay TEST — Design

**Date:** 2026-07-13
**Status:** Approved

## Goal

The `payment-request` demo currently builds a `PaymentRequest` with placeholder payment methods
(`basic-card`, `https://example.com/pay`) that are guaranteed to fail — `basic-card` was removed
from Chrome years ago and `example.com/pay` 404s. The demo's whole point is "watch it fail
gracefully." Replace the placeholder methods with Google Pay's `TEST` environment so the demo can
show a real, working payment sheet (in supported browsers) instead of only demonstrating error
handling.

Scope is limited to `app/src/demos/payment-request/` — no server, no domain verification, no paid
merchant account. Apple Pay JS (Safari-only, requires a paid Apple Developer account, a Merchant
ID, a domain-association file served from `/.well-known/`, and a server-side session-validation
call to Apple with a TLS client cert) was considered and rejected as a follow-up, not part of this
spec — too much infra for this demo's payoff.

## Constraints & decisions

- **Google Pay TEST environment only.** No real Google merchant registration, no server changes.
  `environment: 'TEST'` plus the publicly documented test gateway (`gateway: 'example'`,
  `gatewayMerchantId: 'exampleGatewayMerchantId'`) is Google's own sanctioned way to exercise the
  full API without a production account.
- **Drop `basic-card` entirely.** It's deprecated and removed from current Chrome; keeping it adds
  no fallback value.
- **Browser support stays narrow and honest.** Google Pay via `PaymentRequest` only works in
  Chrome/Edge (desktop and Android) with a Google account that has a saved card. Safari/Firefox
  users, or Chrome users without a saved card, will still hit the existing catch block — copy
  updates to explain *why*, rather than implying the demo itself is broken.
- **Show the real response, masked.** On success, display card network + last 4 (from
  `response.details.cardDetails` / `cardNetwork`) and a masked `tokenizationData.token` string, to
  prove the API actually returned live data rather than a canned success message. If the response
  shape doesn't include those fields (platform variance), fall back to just `methodName` — never
  throw on an unexpected-but-successful response.

## Architecture

All changes confined to `app/src/demos/payment-request/Demo.tsx` (plus copy in
`meta.ts.description`):

- Replace the `methods` array:
  ```js
  const methods = [{
    supportedMethods: 'https://google.com/pay',
    data: {
      environment: 'TEST',
      apiVersion: 2,
      apiVersionMinor: 0,
      merchantInfo: { merchantName: 'WebCanDoIt Demo' },
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: { gateway: 'example', gatewayMerchantId: 'exampleGatewayMerchantId' },
        },
      }],
    },
  }];
  ```
- `details.total` stays the same $1.00 demo total.
- `canMakePayment()` call stays as-is (informational, already tolerant of rejection via
  `.catch(() => null)`).
- Add a small `maskToken(token: string)` helper: keeps the first ~30 and last ~10 characters,
  joins with `…` in between. Used only for display, never for anything functional.
- Add a `describeSuccess(response)` helper that reads
  `response.details?.cardNetwork`, `response.details?.cardDetails` (last 4 digits), and
  `response.details?.paymentMethodData?... tokenizationData?.token` (exact path depends on
  Chrome's actual response shape — read defensively with optional chaining) and builds:
  `` Payment authorized via Google Pay (TEST) — {network} •••• {last4}\nToken: {maskedToken} ``
  Falls back to `` Payment completed via "${response.methodName}". `` if the expected fields are
  absent.
- Intro copy (the `<p>` above the button) updated to explain this now opens a **real Google Pay
  test-mode sheet** — no money moves, but the payment token returned is genuine — and that it needs
  Chrome/Edge with a Google account + saved card.
- Error copy (the `catch` block, non-`AbortError` path) updated: `` {detail} — Google Pay isn't
  available here: try desktop Chrome or Android Chrome with a card saved to your Google account. ``
- `meta.ts.description` updated to mention Google Pay TEST instead of "safely handling rejection of
  unknown payment methods."

## Data flow

1. Click "Try Payment Request" → `new PaymentRequest([googlePayTestMethod], details)`.
2. `canMakePayment()` (best-effort, ignored on failure) → `request.show()`.
3. **Success:** Chrome shows the real Google Pay sheet; user picks a saved card (or cancels) →
   `response` includes `methodName: 'https://google.com/pay'` and a `details` payload with card +
   token info → `response.complete('success')` → UI renders `describeSuccess(response)`.
4. **User cancels the sheet:** `AbortError` → existing "Payment sheet was dismissed." message,
   unchanged.
5. **Method unsupported (Safari/Firefox, or no card on file):** `NotSupportedError` (or similar) →
   caught, updated explanatory copy rendered.

## Error handling

- `AbortError` path is unchanged (dismissal is not a failure).
- All other thrown errors (`NotSupportedError`, etc.) render the updated explanatory message —
  behavior structurally identical to today, only the copy changes to reflect Google Pay TEST
  instead of generic placeholder methods.
- `describeSuccess()` must not throw on a missing/differently-shaped `details` object — every field
  access is optional-chained, with a plain `methodName`-only fallback string.

## Testing

- No new automated tests: a real Google Pay sheet can't be driven headlessly in CI (requires a
  live Google account + saved card + user gesture), consistent with this project's existing
  approach to hardware/native-UI APIs (no automated E2E for those, per
  `docs/superpowers/specs/2026-07-09-pwa-showcase-design.md`).
- Existing Playwright smoke test (`e2e/smoke.spec.ts`) is unchanged — it only asserts the demo route
  renders without crashing, it doesn't click the payment button.
- Manual verification on the deployed site in desktop Chrome (with a saved card) covers the success
  path; Safari covers the "unsupported" error path.

## Out of scope

- Apple Pay JS integration (Safari) — noted above as a plausible follow-up, not part of this spec.
- Any real payment processing, server-side charge, or persisted transaction record.
