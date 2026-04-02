# GEN-ETHOS

GEN-ETHOS is a verification and enforcement layer for corporate claims.

Companies make sustainability and compliance claims every day, but most of those claims are still self-reported, slow to verify, and largely consequence-free. GEN-ETHOS turns a public claim into a staked commitment: the company escrows value, decentralized AI validators compare independent evidence, and the protocol records a public verdict with reputational and economic consequences.

We start with environmental disclosure and greenwashing, but the same primitive can extend to supply chain claims, vendor compliance, impact reporting, and other corporate disclosures where trust matters.

## Why It Matters

- Corporate claims are cheap to publish.
- Verification is fragmented and slow.
- Public trust is low because consequences are weak.
- AI makes it easier to generate polished claims, which makes verifiable trust more important.

## What GEN-ETHOS Does

1. A company registers a public claim target.
2. The company stakes escrow behind that claim.
3. The owner submits an audit request with evidence URLs.
4. GenLayer validators independently evaluate the evidence.
5. The protocol records a verdict: `COMPLIANT`, `MINOR_VIOLATION`, `VIOLATION`, or `INCONCLUSIVE`.
6. The system updates reputation and escrow outcomes through unlocks, slashing, and a public audit history.

## Why GenLayer

GEN-ETHOS needs more than a normal smart contract.

- It must read real-world evidence from public web sources.
- It must reason over non-deterministic inputs.
- It must reach validator consensus on natural-language outputs.

GenLayer is the right execution layer because it supports web access, AI-assisted reasoning, and equivalence-based validator consensus in a single application flow.

## Current MVP Scope

The current MVP focuses on one concrete use case:

- public company-style ESG / emissions claims
- escrow-backed accountability
- decentralized audit requests
- public explorer for scores, balances, and audit history

Core demo flow:

1. Register company
2. Deposit escrow
3. Request audit
4. Receive verdict
5. Show slash or unlock impact
6. Inspect public history in Explorer

## Repository Layout

- [contracts/gen_ethos.py](contracts/gen_ethos.py): GenLayer contract
- [frontend](frontend): Next.js app
- [frontend/README.md](frontend/README.md): frontend setup and scripts
- [docs/pitch.md](docs/pitch.md): pitch script, slide outline, and demo flow
- [docs/slides.md](docs/slides.md): copy-ready slide deck content

## Product Positioning

GEN-ETHOS is not just an ESG dashboard.

It is a protocol primitive for turning real-world corporate claims into commitments that can be challenged, evaluated, and economically enforced.

## Status

Hackathon MVP.

The system is optimized for a clear end-to-end demonstration of:

- claim registration
- escrow-backed accountability
- GenLayer consensus-based audits
- public verdict history
- visible economic consequences
