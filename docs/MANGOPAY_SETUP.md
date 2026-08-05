# MangoPay Payment Integration

Lendly uses MangoPay for card payments (ILS). This doc covers local dev and production setup.

## How It Works

1. Renter clicks "Pay" on the checkout page.
2. Backend creates a MangoPay Natural User (if first time) and a Card Web PayIn.
3. Renter is redirected to MangoPay's hosted payment page for card entry + 3DS.
4. After payment, MangoPay redirects back to the checkout page.
5. MangoPay sends a webhook (`PAYIN_NORMAL_SUCCEEDED`) which confirms the booking automatically.

## Sandbox Setup

1. Sign up at [hub.mangopay.com](https://hub.mangopay.com) for a sandbox account.
2. From the Dashboard, get your **Client ID** and **API Key**.
3. Create a **Wallet** for the platform (this receives all pay-ins).
4. Add to `.env.local`:

```
MANGOPAY_CLIENT_ID=your-sandbox-client-id
MANGOPAY_API_KEY=your-sandbox-api-key
MANGOPAY_API_URL=https://api.sandbox.mangopay.com
MANGOPAY_PLATFORM_WALLET_ID=your-wallet-id
```

## Webhook Setup (Local Dev)

MangoPay webhooks require a publicly accessible URL. Use a tunnel for local development:

```bash
# Using ngrok
ngrok http 3000
# Then register the URL in MangoPay Dashboard:
# https://your-ngrok-url.ngrok.io/api/webhooks/mangopay
```

In MangoPay Dashboard → Configuration → Notifications:
- Add URL: `https://YOUR_DOMAIN/api/webhooks/mangopay`
- Events: `PAYIN_NORMAL_SUCCEEDED`, `PAYIN_NORMAL_FAILED`

## Production Setup

1. Get production credentials from MangoPay Dashboard.
2. Set environment variables:

```
MANGOPAY_CLIENT_ID=your-production-client-id
MANGOPAY_API_KEY=your-production-api-key
MANGOPAY_API_URL=https://api.mangopay.com
MANGOPAY_PLATFORM_WALLET_ID=your-production-wallet-id
```

3. Register webhook URL: `https://lendly.co.il/api/webhooks/mangopay`
4. Events: `PAYIN_NORMAL_SUCCEEDED`, `PAYIN_NORMAL_FAILED`

## Test Cards (Sandbox)

| Card Number        | Result    |
|-------------------|-----------|
| 4970105191923460  | Success   |
| 4970101122334422  | Failed    |

CVV: any 3 digits, Expiry: any future date.

## Architecture Notes

- **Provider detection**: `MANGOPAY_CLIENT_ID` env var enables MangoPay automatically. Override with `PAYMENTS_PROVIDER=mangopay|manual_bit|mock`.
- **User mapping**: Each app user gets a MangoPay Natural User (PAYER category) created lazily on first payment. The `mangopayUserId` is stored on the User model.
- **Amounts**: All amounts stored in whole ILS, converted to agorot (x100) for MangoPay API calls.
- **Deposit**: Charged as part of total payment. Release is DB-status-only until MangoPay payouts are implemented.
- **Fees**: Platform service fee is passed as MangoPay Fees on the PayIn, automatically credited to the platform's client wallet.
