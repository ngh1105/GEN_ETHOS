# GEN-ETHOS Frontend

Next.js application for the GEN-ETHOS protocol.

GEN-ETHOS is a verification and enforcement layer for corporate claims. The frontend demonstrates how a company can register a public claim, stake escrow behind it, request a decentralized audit, and expose the resulting verdict, score, and economic consequence in a public explorer.

This app is built for a hackathon MVP with one clear wedge:

- ESG / emissions-style corporate claims
- escrow-backed accountability
- decentralized AI audit flow
- public verdict history

## Product Framing

This is not just an ESG dashboard.

The product is a trust layer for corporate disclosures:

1. Register a public claim
2. Stake escrow behind it
3. Submit evidence for audit
4. Reach GenLayer validator consensus
5. Apply public reputational and economic consequences

## Main User Flows

- Onboarding: register company and deposit escrow
- Audit Engine: request audit with 1 required source and up to 2 optional sources
- Explorer: inspect score, escrow, unlocked amount, latest verdict, and audit history

## Prerequisites

- Node.js 20+
- MetaMask or another compatible EIP-1193 wallet
- A deployed GEN-ETHOS contract on GenLayer testnet

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_GENLAYER_RPC=https://rpc-bradbury.genlayer.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

Optional:

```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Notes:

- `NEXT_PUBLIC_CONTRACT_ADDRESS` is required in normal contract mode.
- `NEXT_PUBLIC_USE_MOCK_DATA=true` enables deterministic demo and smoke-test data.

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run test
npm run test:e2e
npm run build
npm run start
```

## Demo Mode

For a stable judge demo, mock mode is the safest path:

```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Preset entities:

- `APPLE_INC`
- `PAGED_INC`

Recommended live demo flow:

1. Register a company
2. Deposit escrow
3. Request an audit
4. Show verdict card and transaction status
5. Open Explorer and show score, escrow, unlocked amount, and audit history

## Why GenLayer

GEN-ETHOS needs more than a deterministic contract:

- it reads public web evidence
- it reasons over non-deterministic inputs
- it depends on validator consensus over audit outcomes

GenLayer is the execution layer that makes this flow possible.

## Security Notes

- The contract validates audit source URLs as public `https://` inputs.
- The frontend supports wallet network switching in the header flow.
- CI runs `lint`, `test`, `build`, and `test:e2e`.

## Quality Status

Current verification status for the frontend stack:

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:e2e`

## Related Docs

- [Root README](../README.md)
- [Pitch Pack](../docs/pitch.md)
- [Slide Deck Outline](../docs/slides.md)
