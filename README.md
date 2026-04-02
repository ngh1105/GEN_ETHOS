# GEN-ETHOS

Current live DApp note: Bradbury testnet has been unstable during testing, especially on contract reads and transaction consistency, so the working DApp currently uses GenLayer Studio Network for demos and team testing.

GEN-ETHOS is a GenLayer-based verification and enforcement layer for corporate claims.

The project turns a public company disclosure into a staked commitment. A company registers a target, escrows value behind it, submits evidence, and lets decentralized AI validators compare that claim against public sources. The result is not just a dashboard entry. It becomes a recorded verdict with visible reputational and economic consequences.

The current MVP focuses on ESG and emissions-style claims, but the same primitive can extend to supply-chain assertions, vendor compliance, reporting integrity, and other categories of real-world corporate disclosure.

## Problem

Corporate claims are easy to publish and expensive to verify.

- Most disclosures are still self-reported.
- Third-party verification is fragmented and slow.
- Public consequences for false or overstated claims are weak.
- AI makes polished reporting easier to generate, which increases the need for verifiable trust.

GEN-ETHOS is built around one simple idea: if a company makes a claim publicly, that claim should be challengeable, auditable, and costly to misrepresent.

## What The Protocol Does

GEN-ETHOS currently supports this flow:

1. A company registers a public reduction target.
2. The company deposits escrow tied to that claim.
3. The owner submits an audit request with evidence URLs.
4. GenLayer validators independently read and reason over the submitted evidence.
5. The protocol records a verdict:
   - `COMPLIANT`
   - `MINOR_VIOLATION`
   - `VIOLATION`
   - `INCONCLUSIVE`
6. The system updates the company score and escrow outcome based on the verdict.
7. The public explorer shows the latest state and audit history.

## Why GenLayer

GEN-ETHOS needs more than a deterministic contract.

- It must read public web evidence.
- It must reason over non-deterministic, natural-language inputs.
- It must reach validator consensus on outputs that are not purely arithmetic.

GenLayer is the execution layer that makes this possible, because it combines web access, AI-assisted reasoning, and validator consensus in one application flow.

## MVP Scope

This repo is optimized for a hackathon MVP, not a generalized production protocol.

Current scope:

- company-style ESG / emissions claims
- escrow-backed accountability
- decentralized AI audit requests
- public explorer for scores, balances, and verdict history
- live testnet demos on GenLayer-compatible networks

## Repository Structure

- [contracts/gen_ethos.py](contracts/gen_ethos.py): main GenLayer contract
- [frontend](frontend): primary Next.js frontend configured for Bradbury-style testnet usage
- [gen-ethos-studionet](gen-ethos-studionet): backup copy configured for Studio network
- [docs/pitch.md](docs/pitch.md): pitch script and messaging
- [docs/slides.md](docs/slides.md): slide-outline content

## Architecture

The system has two main pieces:

### 1. Contract Layer

The contract manages:

- company registration
- escrow deposits
- audit requests
- verdict storage
- company score updates
- slash / unlock accounting
- company profile and audit-history reads

Main contract file:

- [gen_ethos.py](contracts/gen_ethos.py)

### 2. Frontend Layer

The frontend provides three core flows:

- Onboarding
  - register company
  - deposit escrow
- Audit Engine
  - submit live evidence URLs
  - track transaction / consensus status
- Explorer
  - inspect company profile
  - inspect score, escrow, withdrawable amount
  - inspect audit history

Frontend entry points:

- [page.tsx](frontend/src/app/page.tsx)
- [onboarding/page.tsx](frontend/src/app/onboarding/page.tsx)
- [audit-engine/page.tsx](frontend/src/app/audit-engine/page.tsx)
- [explorer/page.tsx](frontend/src/app/explorer/page.tsx)

## Current Deployment Focus

This repository keeps both network variants:

- [frontend](frontend): Bradbury-oriented frontend
- [gen-ethos-studionet/frontend](gen-ethos-studionet/frontend): Studio frontend used for the current live demo path

Right now, the recommended demo and team testing path is the Studio version because Bradbury testnet has shown unstable read behavior and inconsistent transaction processing during live testing.

## Quick Start

### Option A: Run The Current Studio DApp

```bash
cd gen-ethos-studionet/frontend
npm install
npm run dev -- --port 3001
```

Default local URL:

```text
http://localhost:3001
```

### Option B: Run The Bradbury Variant

```bash
cd frontend
npm install
npm run dev
```

Default local URL:

```text
http://localhost:3000
```

## Environment Variables

### Current Studio DApp

File:

- [gen-ethos-studionet/frontend/.env.local](gen-ethos-studionet/frontend/.env.local)

Current values:

```bash
NEXT_PUBLIC_GENLAYER_RPC=https://studio.genlayer.com/api
NEXT_PUBLIC_CONTRACT_ADDRESS=0x34AE1198bef2447A2e33ed80C9E89F2DB70617A5
```

### Bradbury Variant

File:

- [frontend/.env.local](frontend/.env.local)

Typical values:

```bash
NEXT_PUBLIC_GENLAYER_RPC=https://rpc-bradbury.genlayer.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

Important:

- Contract addresses are network-specific.
- A Bradbury deployment address cannot be reused on Studio.
- Explorer URLs can differ from RPC URLs and may still be intentionally pointed to a preferred explorer UX.

## Wallet / Network Setup

The app relies on an EIP-1193 wallet such as MetaMask.

### Current Recommended Setup

- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`

### Bradbury Variant Setup

- Chain ID: `4221`
- RPC: `https://rpc-bradbury.genlayer.com`

If MetaMask already has an older custom network with the same chain ID, it may switch to that chain without replacing the stored RPC URL. In practice, that can cause transaction behavior to differ from what the app expects.

## Demo Flow

Recommended end-to-end flow for a live demo:

1. Register a company.
2. Deposit escrow.
3. Submit an audit with real `https://` evidence URLs.
4. Wait for the verdict / transaction state to settle.
5. Open Explorer and inspect:
   - company score
   - escrow balance
   - latest verdict
   - audit history

## Real Test Data

These are real, public URLs the team can use for manual testing on the live DApp.

Important notes before testing:

- `register` requires a fresh, globally unique `company_id`
- `deposit` must be sent by the same wallet that registered the company
- `audit` should use public `https://` URLs
- live verdicts can vary slightly because validators read current web content

### Studio Quick Read Test

If the team only wants to confirm Studio reads are alive, use:

- `company_id`: `nike`

Observed Studio profile:

```json
{
  "company_id": "nike",
  "target_reduction": "30",
  "ethos_score": 100,
  "audit_count": 0
}
```

### Real Demo Bundle 1: Amazon

```json
{
  "register": {
    "company_id": "AMAZON_REAL_DEMO_2",
    "target_reduction_percentage": "100"
  },
  "deposit": {
    "company_id": "AMAZON_REAL_DEMO_2",
    "amount": "600"
  },
  "audit": {
    "company_id": "AMAZON_REAL_DEMO_2",
    "official_report_url": "https://www.aboutamazon.com/news/sustainability/amazon-sustainability-report-2024",
    "iot_sensor_url": "https://publications.stand.earth/prime-polluter/",
    "ngo_watchdog_url": "https://www.amazonclimatejustice.org/our-research"
  }
}
```

### Real Demo Bundle 2: Apple

```json
{
  "register": {
    "company_id": "APPLE_REAL_DEMO_2",
    "target_reduction_percentage": "60"
  },
  "deposit": {
    "company_id": "APPLE_REAL_DEMO_2",
    "amount": "450"
  },
  "audit": {
    "company_id": "APPLE_REAL_DEMO_2",
    "official_report_url": "https://www.apple.com/newsroom/2025/04/apple-surpasses-60-percent-reduction-in-global-greenhouse-gas-emissions/",
    "iot_sensor_url": "https://www.apple.com/environment/reports/",
    "ngo_watchdog_url": "https://www.greenpeace.org/static/planet4-eastasia-stateless/2022/10/89382b33-supplychange.pdf"
  }
}
```

### Real Demo Bundle 3: Google

```json
{
  "register": {
    "company_id": "GOOGLE_REAL_DEMO",
    "target_reduction_percentage": "100"
  },
  "deposit": {
    "company_id": "GOOGLE_REAL_DEMO",
    "amount": "500"
  },
  "audit": {
    "company_id": "GOOGLE_REAL_DEMO",
    "official_report_url": "https://blog.google/outreach-initiatives/sustainability/google-2025-environmental-report/",
    "iot_sensor_url": "https://www.greenpeace.org/eastasia/press/7698/microsoft-google-reliant-on-fossil-fuels-despite-100-renewable-energy-pledges-study/",
    "ngo_watchdog_url": "https://stand.earth/wp-content/uploads/2025/09/Crossroads-Report-SEPT-15.pdf"
  }
}
```

## Example Real Entity For Studio Read Testing

The Studio contract currently returns data for at least:

- `nike`

Example read result observed from Studio:

- `company_id: "nike"`
- `target_reduction: "30"`
- `ethos_score: 100`
- `audit_count: 0`

This is useful for quickly validating that the Studio read path is alive.

## Current Known Network Notes

During recent testing:

- Bradbury testnet showed upstream RPC instability on contract reads.
- Explorer pages could still be available while `readContract` calls timed out.
- Studio network read calls were observed returning normally.

That means:

- if Bradbury feels slow or inconsistent, it may be a network issue rather than an app logic issue
- the Studio backup exists specifically to keep the demo unblocked

## Frontend Quality / Recent Improvements

The current frontend includes a few important fixes made during testing:

- safer parsing for numeric contract return values
- better receipt status parsing for newer `genlayer-js` response shapes
- faster transaction polling
- light-mode-only UI lock to avoid theme mismatch during demos
- Studio backup frontend with separate network configuration

## Scripts

Both frontend variants expose the same main scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:e2e
```

## Product Positioning

GEN-ETHOS is not an ESG dashboard.

It is a trust primitive for turning corporate disclosures into commitments that can be challenged, evaluated, and economically enforced.

The key product wedge is simple:

- claims become stake-backed
- audits become decentralized
- outcomes become public
- consequences become visible

## Related Docs

- [Frontend README](frontend/README.md)
- [Studio Frontend README](gen-ethos-studionet/frontend/README.md)
- [Pitch Pack](docs/pitch.md)
- [Slides Outline](docs/slides.md)

## Status

Hackathon MVP.

The repo is currently optimized for:

- an end-to-end live demo
- iterative testnet debugging
- a clear story around escrow-backed accountability for corporate claims
