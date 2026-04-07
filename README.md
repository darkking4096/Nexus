# NEXUS — AI-Powered Instagram Management Platform

## Overview

NEXUS is a comprehensive platform for AI-assisted Instagram content management, featuring:
- Local authentication with JWT tokens
- Profile management for multiple Instagram accounts
- AI-powered content generation (text, visuals, stories)
- Dual-mode operation (Manual + Autopilot)
- Advanced analytics and scheduling

## Project Structure

```
nexus/
├── packages/
│   ├── backend/          # Express.js API server
│   │   └── src/
│   │       ├── config/   # Database, encryption setup
│   │       ├── routes/   # API endpoints
│   │       ├── models/   # Data models
│   │       ├── middleware/ # Auth, validation, error handling
│   │       └── utils/    # Utilities (encryption, hashing, etc.)
│   └── frontend/         # React.js + Vite UI
│       └── src/
│           ├── components/
│           ├── pages/
│           ├── context/
│           └── hooks/
├── docs/
│   └── stories/          # Development stories (AIOX format)
├── data/                 # SQLite database (gitignored)
└── .env                  # Environment variables
```

## Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Generate secure keys (TODO)
# JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ENCRYPTION_KEY
```

### Development

```bash
# Start both backend (5000) and frontend (5173)
npm run dev

# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npm run typecheck

# Build for production
npm run build
```

## Tech Stack

- **Backend:** Express.js v4, Node.js 18+
- **Frontend:** React 18, Vite, Tailwind CSS
- **Database:** SQLite + better-sqlite3
- **Authentication:** JWT (access + refresh tokens)
- **Encryption:** AES-256-GCM for sensitive data
- **Testing:** Vitest (unit), Playwright (E2E)
- **Build Tools:** TypeScript, ESLint, Prettier

## Development Status

- **Phase 1: Setup** ✅ Complete
- **Phase 2: Schema & Encryption** ⏳ Next
- **Phase 3: Auth Backend** ⏳
- **Phase 4: Frontend UI** ⏳
- **Phase 5: Testing** ⏳
- **Phase 6: Validation** ⏳

## Database Schema

See `docs/stories/1.1.story.md` for full schema definitions.

## Environment Variables

See `.env.example` for template.
