# DevPulse: PR Review Velocity & Risk Analytics Platform

> High-performance developer platform service for analyzing GitHub Pull Request lifecycles, identifying code review bottlenecks, calculating turnaround times, and assessing PR risk.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-darkblue.svg)](https://www.prisma.io/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Problem & Motivation

Engineering teams suffer from invisible bottlenecks in their code review lifecycle:
- Pull requests wait **days** before the first review, stalling feature delivery.
- Large, high-risk changes (e.g. database migrations, auth refactors) slip through without rigorous review or test coverage.
- Senior engineers become overloaded review gatekeepers without visibility.

**DevPulse** provides automated telemetry on GitHub pull requests to track review turnaround time, detect reviewer bottlenecks, and score the risk of every incoming pull request.

---

## 🏗️ Architecture

DevPulse follows a clean, modular layered architecture:

```
devpulse/
├── src/
│   ├── config/            # Environment variable validation using Zod
│   ├── controllers/       # HTTP request handlers & response mapping
│   ├── services/          # Business domain logic (Risk scoring, metrics calculations)
│   ├── repositories/      # Database access abstraction via Prisma
│   ├── middleware/        # Timing-safe HMAC verification, error handler, logger
│   ├── routes/            # Express REST endpoint routers
│   ├── validators/        # Zod request validation schemas
│   ├── types/             # Domain TypeScript definitions
│   ├── app.ts             # Express app configuration & middleware pipeline
│   └── server.ts          # Server entrypoint with graceful shutdown
├── prisma/
│   └── schema.prisma      # Prisma schema (Repository, PullRequest, Review, MetricSnapshot)
├── tests/                 # Unit & integration test suites (Vitest + Supertest)
└── package.json
```

---

## 🛠️ Tech Stack

- **Runtime & Language:** Node.js (v18+) with TypeScript 5 (Strict Mode)
- **API Framework:** Express 4
- **ORM & Database:** Prisma ORM with SQLite (PostgreSQL compatible)
- **Schema Validation:** Zod
- **Security:** Helmet, CORS, timing-safe HMAC-SHA256 signature verification
- **Testing:** Vitest & Supertest

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Subham2512/devpulse-api.git
cd devpulse-api

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Database Initialization
Generate Prisma client and push the schema to SQLite:
```bash
npm run prisma:generate
npm run prisma:push
```

### 5. Running the Application
```bash
# Development mode with hot-reloading
npm run dev

# Production build and run
npm run build
npm run start
```
The server will start on `http://localhost:4000`.

---

## 🧪 Testing

Run automated unit and integration tests:
```bash
npm test
```

---

## 📡 API Reference

### 1. Health Check
`GET /health`
```json
{
  "status": "pass",
  "timestamp": "2026-10-09T12:00:00.000Z",
  "services": {
    "api": "healthy",
    "database": "healthy"
  },
  "version": "1.0.0"
}
```

### 2. Register Repository
`POST /api/repositories`
```json
{
  "owner": "Subham2512",
  "name": "devpulse-api",
  "defaultBranch": "main"
}
```

### 3. GitHub Webhook Ingest
`POST /api/webhooks/github`
*Requires `x-hub-signature-256` header when `WEBHOOK_SECRET` is set.*
Supports `pull_request` and `pull_request_review` events.

### 4. Calculate PR Risk Score
`POST /api/metrics/risk-assessment`
```json
{
  "additions": 450,
  "deletions": 50,
  "changedFiles": 8,
  "files": [
    { "filename": "src/auth/tokenManager.ts", "additions": 120, "deletions": 10 }
  ],
  "hasTests": false
}
```

### 5. Repository Turnaround Metrics
`GET /api/metrics/repositories/:repoId/turnaround?days=30`
```json
{
  "success": true,
  "data": {
    "totalPRs": 42,
    "openPRs": 5,
    "mergedPRs": 35,
    "closedPRs": 2,
    "avgTurnaroundHours": 8.4,
    "p95TurnaroundHours": 26.2,
    "medianTurnaroundHours": 5.1,
    "reviewBottlenecks": [
      {
        "reviewer": "octocat",
        "pendingCount": 12,
        "avgLatencyHours": 14.2
      }
    ]
  }
}
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
