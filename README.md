# ClaimPilot

AI-assisted medical insurance claim review workspace built with React, Node.js, Express, Supabase PostgreSQL, and Groq.

ClaimPilot helps organize submitted claim information and supporting documents. Groq AI is intended to assist with document summarization and information extraction. An authorized human reviewer remains responsible for reviewing the information and making any claim decision.

> **Educational demonstration only.** Use synthetic sample documents. Do not upload real patient records or sensitive medical information. AI output may be incomplete or incorrect and must be verified.

## Project structure

```
ClaimPilot/
├── frontend/   # React + Vite + Tailwind CSS
└── backend/    # Node.js + Express API
```

## Requirements

- Node.js 20 or later
- npm
- A Supabase project with PostgreSQL
- A Groq API key for AI features (added in a later setup step)

## Run locally

### 1. Backend

Open a terminal in the repository folder:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in the environment values. Do not commit the real `.env` file.

Start the API:

```bash
npm run dev
```

Health check: `http://localhost:5000/api/health`.

### 2. Frontend

Open a second terminal in the repository folder:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`, then start Vite:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Database

Run `backend/schema.sql` in the Supabase SQL Editor. The backend will connect to PostgreSQL using the standard `pg` package and the server-side `DATABASE_URL`.

## Environment variables

See `frontend/.env.example` and `backend/.env.example`. Never commit database passwords, API keys, or JWT secrets. Keep the Supabase database connection string and Groq key on the backend only.

## Current implementation status

- [x] Initial frontend and backend structure
- [x] React + Vite landing screen
- [x] Express health endpoint
- [x] Initial PostgreSQL schema
- [ ] Supabase connection and document storage
- [ ] Public claim submission and document upload
- [ ] Custom admin JWT authentication
- [ ] Admin claims dashboard, search, and filters
- [ ] Groq document extraction and summaries
- [ ] Claim review workflow and activity log
- [ ] Testing and deployment

## Responsible use

Use synthetic sample documents only. ClaimPilot is a workflow demonstration, not a medical device or an automated insurance decision system. AI-generated information must be checked by an authorized human reviewer.
