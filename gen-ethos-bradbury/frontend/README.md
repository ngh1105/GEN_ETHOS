# GEN-ETHOS Frontend

Next.js application for the GEN-ETHOS protocol.

This backup app is configured for GenLayer Bradbury Testnet.

GEN-ETHOS is a verification and enforcement layer for corporate claims. The frontend demonstrates how a company can register a public claim, stake escrow behind it, request a decentralized audit, and expose the resulting verdict, score, and economic consequence in a public explorer.

## Main User Flows

- Onboarding: register company and deposit escrow
- Audit Engine: request audit with 1 required source and up to 2 optional sources
- Explorer: inspect score, escrow, unlocked amount, latest verdict, and audit history

## Prerequisites

- Node.js 20+
- MetaMask or another compatible EIP-1193 wallet
- A deployed GEN-ETHOS contract on Bradbury testnet

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_GENLAYER_RPC=https://rpc-bradbury.genlayer.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

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

## Notes

- This folder is the Bradbury-oriented backup testnet app.
- Bradbury has shown instability during live testing, especially on contract reads.
- If Bradbury is unstable, use the main Studio demo path instead.

## Related Docs

- [Root README](../../README.md)
- [Pitch Pack](../../docs/pitch.md)
- [Slide Deck Outline](../../docs/slides.md)
