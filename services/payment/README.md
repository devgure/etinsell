Payment service
================

This service handles Stripe checkout, webhook processing, and tipping via the ETI token.

Required environment variables (minimum for tipping):

- DATABASE_URL - MongoDB connection string for Prisma
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PREMIUM_PRICE_ID
- STRIPE_GOLD_PRICE_ID
- STRIPE_TRUSTED_BADGE_PRICE_ID
- STRIPE_UNDO_SWIPE_PRICE_ID
- STRIPE_INCOGNITO_PRICE_ID
- STRIPE_ROSE_GIFT_PRICE_ID
- STRIPE_DIAMOND_GIFT_PRICE_ID
- ETI_RPC_URL - Polygon RPC endpoint
- ETI_PRIVATE_KEY - Private key for platform wallet (used to send platform fee)
- ETI_CONTRACT_ADDRESS - ETI ERC-20 contract address
- ETI_DECIMALS - (optional) token decimals, default 18
- PLATFORM_WALLET_ADDRESS - on-chain address to receive platform fees
- FRONTEND_URL - used for Stripe success/cancel urls

Local quickstart (development):

1. Install dependencies:

   cd services/payment
   npm install

2. Generate Prisma client (from repo root):

   npx prisma generate

3. Start the service:

   node src/index.js

4. To test tipping (dry-run):
   - Either set ETI_RPC_URL to a testnet RPC and ETI_PRIVATE_KEY to a funded testnet key
   - Or mock `sendETIWithFee` in unit tests to avoid real transfers

Notes:
- sendETIWithFee performs ERC-20 `transfer` on the configured `ETI_CONTRACT_ADDRESS`.
- The function splits the amount 15% platform / 85% recipient by default.
- In production, ensure the private key is stored securely (KMS / vault) and not in plaintext .env files.

# Payment service

This service provides Stripe Checkout integration and webhook handling for subscriptions, one-time purchases, and a stubbed Polygon (ETI) tipping flow.

Endpoints:

- GET /health => health check
- POST /create-checkout-session => { priceId, successUrl, cancelUrl, customerEmail } -> returns { url, id }
- POST /webhook => Stripe webhook endpoint (expects raw body + signature header)
- POST /tip => { fromUserId, toAddress, amountETI } -> sends ETI (stubbed via ethers)

Environment variables (use the project root .env):

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PREMIUM_PRICE_ID
- STRIPE_GOLD_PRICE_ID
- STRIPE_TRUSTED_BADGE_PRICE_ID
- STRIPE_UNDO_SWIPE_PRICE_ID
- STRIPE_INCOGNITO_PRICE_ID
- STRIPE_SUPER_LIKE_PRICE_ID
- STRIPE_ROSE_GIFT_PRICE_ID
- STRIPE_DIAMOND_GIFT_PRICE_ID
- STRIPE_WEBHOOK_URL
- ETI_RPC_URL
- ETI_PRIVATE_KEY
- ETI_DECIMALS

Local dev:

1. Install deps:

```bash
cd services/payment
npm install
```

2. Start the service:

```bash
npm run start
```

3. Create a checkout session (example):

POST http://localhost:3010/create-checkout-session
{
	"priceId": "price_...",
	"customerEmail": "user@example.com",
	"successUrl": "http://localhost:3000/success",
	"cancelUrl": "http://localhost:3000/cancel"
}

4. Webhook testing: use Stripe CLI to forward events to /webhook or set STRIPE_WEBHOOK_SECRET accordingly.
