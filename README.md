# Fountain Licensing Operations

A synthetic prototype for answering one operational question: **what can we launch next, and what is blocking it?**

The interface includes a launch-readiness matrix, market details, provider coverage, evidence summaries, and a prioritized action queue.

## Privacy boundary

This public test build contains synthetic records only. It is not connected to Fountain's source spreadsheet or any production system, and it contains no SSNs, birth dates, home addresses, personal contacts, identity documents, or real provider credentials.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

The project uses Next.js App Router and can be imported directly into Vercel. No environment variables or external services are required for the synthetic prototype.
