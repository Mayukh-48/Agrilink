# KisanLink (Agrilink)

[![Project](https://img.shields.io/badge/project-KisanLink-green)]() [![License: MIT](https://img.shields.io/badge/license-MIT-blue)]()

KisanLink (formerly Agrilink) is a farmer-focused web platform that connects farmers with buyers, agricultural advisories, and tools — helping improve farm outcomes with timely information and easy marketplace access. This repository contains the codebase for the KisanLink website and services (frontend, backend, and supporting scripts).

Features
- Farmer marketplace for listing produce and connecting with buyers
- Crop advisory and recommendations (weather, crop care, fertilizer tips)
- User accounts for farmers and buyers
- Admin dashboard for managing listings and content
- APIs for mobile/web clients
- (Optional) ML-backed crop recommendation or disease detection components

Tech stack (based on repository composition)
- Frontend: JavaScript (React/Vite) — UI, client-side routing, and web pages
- Backend: Python (FastAPI) — API, auth, business logic
- Styling: CSS and HTML
- ML / Data: Python scripts or services for analytics & demo forecasting

Quick demo
- Live site (deployed): https://kisanlink-nine.vercel.app
- Admin/demo credentials: (add after setup)

Contents (expected)
- /frontend — JavaScript-based UI (React + Vite)
- /backend — Python FastAPI server
- /docs — project documentation and design notes
- /scripts or /tools — helper scripts (build, deploy, seeds)

Getting started — local development

Prerequisites
- Node.js 16+ and npm/yarn (for frontend)
- Python 3.8+ and pip (for backend)
- SQLite (default for MVP) or PostgreSQL for production
- Git
- (Optional) Docker & Docker Compose

Run backend (Windows / macOS / Linux)
1. cd backend
2. Create a virtual environment and install dependencies
   - python -m venv .venv
   - source .venv/bin/activate  # macOS/Linux
   - .\.venv\Scripts\activate  # Windows (PowerShell)
   - pip install -r requirements.txt
3. Start the server
   - uvicorn main:app --reload

Backend: http://127.0.0.1:8000
Swagger: http://127.0.0.1:8000/docs

Run frontend
1. cd frontend
2. npm install
3. npm run dev

Open the URL shown by Vite (typically http://localhost:5173)

Environment variables (example)
Create a .env file in the backend directory with keys similar to:
- SECRET_KEY=your-secret-key
- DATABASE_URL=sqlite:///./dev.db  # or a Postgres URL in production
- DEBUG=true
- ALLOWED_HOSTS=localhost,127.0.0.1
- STORAGE_BUCKET= (if using cloud storage)
- GOOGLE_MAPS_API_KEY= (optional)

Database
- Default for MVP: SQLite (no setup required)
- Recommended for production: PostgreSQL

Docker (example)
```yaml
version: '3.8'
services:
  web:
    build: ./backend
    env_file: ./backend/.env
    ports:
      - "8000:8000"
    depends_on:
      - db
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: kisanlink
    volumes:
      - db-data:/var/lib/postgresql/data
volumes:
  db-data:
```

Tests
- Frontend: npm test (Jest) or relevant command
- Backend: pytest or framework-specific tests
- Add CI (GitHub Actions) to run tests on push/PR

Deployment suggestions
- Frontend: Vercel / Netlify
- Backend: Render / GCP Cloud Run / AWS Cloud Run / Heroku
- Use environment secrets for production credentials and a CDN for static assets

Security
- Never commit credentials or .env files
- Use a strong SECRET_KEY and rotate keys when necessary
- Validate and sanitize user inputs
- Implement rate-limiting and authentication on APIs

Contributing
We welcome contributions! Please follow these steps:
1. Fork the repo and create a branch: git checkout -b feat/your-feature
2. Make changes and add tests
3. Run tests locally
4. Open a Pull Request describing your change and linking any relevant issues

Roadmap (example)
- [ ] Core marketplace flow (listings, search, messaging)
- [ ] Authentication & user profiles
- [ ] Admin dashboard
- [ ] Crop advisory and weather feeds
- [ ] Mobile-friendly UI / PWA or mobile app
- [ ] ML-based crop/disease recommendations

Credits
- Built by the KisanLink team (Agrilink)
- Third-party libraries and contributors — see package.json and requirements.txt for details

License
This project is open source. Choose a license (MIT is suggested).

Contact
- Repo: https://github.com/Mayukh-48/Agrilink


---


