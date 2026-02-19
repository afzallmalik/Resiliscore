# Resiliscore v1 – Next.js Starter (MVP)

This is a ready-to-run MVP web app that:
- Loads the Resiliscore v1 question set from `data/questions.v1.json`
- Renders a domain-by-domain assessment (96 questions)
- Stores responses and computed scores in Postgres via Prisma
- Shows a results page with overall score, grade, domain scores, and simple strengths/risks

## Prerequisites
- Node.js 18+
- A Postgres database (Supabase Postgres works well)

## Setup
1. Copy `.env.example` to `.env` and set `DATABASE_URL`
2. Install deps:
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Run migrations:
   ```bash
   npm run prisma:migrate
   ```
5. Start dev server:
   ```bash
   npm run dev
   ```

## API Endpoints
- GET `/api/questions`
- POST `/api/assessments`
- POST `/api/assessments/{id}/responses`
- POST `/api/assessments/{id}/compute`
- GET `/api/assessments/{id}/results`


## PDF Export
- GET `/api/assessments/{id}/pdf` returns a printable PDF report.
