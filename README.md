# 🚀 SAHAYAK — Welfare Radar

> **Citizen-first welfare intelligence platform that helps people discover relevant government schemes, identify potential benefit gaps, understand why they match, and prepare the documents needed to apply.**

**🌐 Live Demo:** https://sahayak-iejb.onrender.com/  
**💻 GitHub:** https://github.com/kalashsh/SAHAYAK

---

## 🎯 What is Sahayak?

Sahayak starts with the **citizen, not the scheme**.

Instead of making citizens search through long lists of government schemes, Sahayak collects their situation through an adaptive profile and generates explainable, personalized welfare recommendations.

### Core flow

**Citizen Profile → Eligibility Signals → Recommendation Engine → Welfare Radar → Explanation → Documents → Next Action**

> **Important:** Sahayak provides a **profile-match recommendation**, not a guarantee of official eligibility.

---

## ✨ Key Features

- 🧑‍💼 **Adaptive Citizen Profile Wizard**
- 🎯 **Personalized scheme recommendations**
- 🗂️ **40-scheme citizen catalogue**
- 🔍 **Explainable “Why this matched you”**
- 📊 **Welfare Radar & potential gap detection**
- 📄 **Document readiness**
- ✅ **Before You Apply checklist**
- 💾 **Save & Compare schemes**
- 🌐 **English + Hindi**
- 🌓 **Light & Dark themes**
- 📱 **Responsive mobile/tablet/desktop UI**
- 🔐 **Session-based authentication**
- 🗄️ **PostgreSQL persistence**

---

## 🧠 Recommendation Engine

The recommendation engine is **deterministic and explainable** rather than a black-box model.

Each scheme contains structured eligibility metadata such as:

- Target groups
- Occupation
- Age
- Income
- Agriculture / land
- Student status
- Employment status
- Disability
- Gender
- Social category
- Housing
- Household signals
- Required information

The engine converts these signals into weighted scores and assigns:

**High relevance · Relevant · May be relevant · Low relevance · Needs more information**

It also provides confidence:

**High · Medium · Needs verification**

This makes every recommendation easier to understand and audit.

---

## 👤 Citizen Experience

### Profile
Collects information about:

- Location
- Age, gender & social category
- Household
- Income & housing
- Employment & pension
- Agriculture
- Education & skills
- Business/self-employment
- Existing welfare support

### Welfare Radar
Shows:
- High-relevance opportunities
- Relevant schemes
- Potential opportunities
- Potential welfare gaps
- Items needing verification

### Scheme Details
Every recommendation can show:
- Profile match
- Why it matched
- Matched/missing factors
- Potential benefit
- Required documents
- Document readiness
- Next steps

### Save & Compare
Citizens can save schemes for preparation and compare options side-by-side.

---

## 🗂️ Scheme Coverage

The current citizen catalogue contains **40 schemes/pathways** across areas including:

- 🌾 Agriculture
- 🏠 Housing
- 💼 Livelihood & employment
- 🏪 Business & entrepreneurship
- 🎓 Education & skills
- 👴 Pension & social security
- 🍚 Food security
- ♿ Disability
- 👩‍👧 Women & child welfare
- 💳 Financial inclusion

The deployed PostgreSQL database contains the same **40 distinct scheme IDs**.

> The catalogue and eligibility metadata are demonstration logic for the prototype. Official scheme requirements should always be checked before application.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS + Radix UI |
| Routing | Wouter |
| Animation | Framer Motion |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Authentication | bcryptjs + sessions + HttpOnly cookies |
| Testing | Vitest |
| Hosting | Render |
| Database Hosting | Neon |
| Source Control | GitHub |

---

## 🔌 Core API

```text
GET  /api/health

GET  /api/districts
GET  /api/schemes
GET  /api/schemes/:id

POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout

GET  /api/citizen/profile
POST /api/citizen/profile

POST /api/citizen/recommendations

GET    /api/citizen/saved
POST   /api/citizen/saved
DELETE /api/citizen/saved/:schemeId
```

---

## 🗃️ Important Project Files

```text
client/src/lib/citizen.ts
    → Citizen profile model, 40-scheme catalogue & eligibility rules

client/src/lib/citizenAnalysis.ts
    → Welfare gaps, coverage, overlaps & document readiness

server/recommendations.ts
    → Recommendation scoring & confidence logic

server/auth.ts
    → Authentication & role authorization

server/db/seed.ts
    → Idempotent 40-scheme database seed

server/index.ts
    → Express server & API
```

---

## 🧪 Testing

Final hardening checks:

```text
pnpm check       ✓
pnpm vitest run  ✓ 35/35 tests
pnpm build       ✓
```

Also validated:
- Authentication round-trip
- Profile persistence
- Saved schemes
- Recommendation changes
- English/Hindi
- Responsive layouts
- Light/dark themes
- Loading/error/empty states
- 40-scheme database consistency

---

## 🚀 Run Locally

```bash
pnpm install
pnpm dev
```

Database commands:

```bash
pnpm db:push
pnpm db:seed
```

Validation:

```bash
pnpm check
pnpm vitest run
pnpm build
```

Create a local `.env` for your database connection. **Never commit secrets.**

---

## 🏛️ Deployment Architecture

```text
                 Citizen
                    │
                  HTTPS
                    ▼
              ┌───────────┐
              │  Render   │
              │ React +   │
              │ Express  │
              └─────┬─────┘
                    │
               PostgreSQL
                    ▼
              ┌───────────┐
              │   Neon    │
              └───────────┘
                    ▲
                    │
              ┌───────────┐
              │  GitHub   │
              └───────────┘
```

---

## 🏆 SIH Demo Story

Recommended demo persona:

**Farmer · Age 46–60 · Haryana · Sohna · 1–4 hectares**

Demo flow:

**Profile → Welfare Radar → What You Might Be Missing → Why This Matched → Document Readiness → Before You Apply → Save → Compare**

### One-line pitch

> **“Sahayak starts with the citizen, not the scheme.”**

---

## 🔮 Future Scope

The prototype can evolve toward:

- Authoritative government scheme APIs
- Versioned eligibility rules
- State/district-specific eligibility
- Official application integrations
- Verified document workflows
- More Indian languages
- Accessibility enhancements
- Government/CSC integration
- Privacy-aware analytics

---

## 📌 Project Status

**Status:** 🟢 Live Production Demo

**40 schemes · 35/35 tests · English + Hindi · PostgreSQL · Render + Neon**

Made for **Smart India Hackathon 2026**.
