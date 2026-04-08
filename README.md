# Clothing Brand App/System

Monorepo structure:

- `backend` - FastAPI API with JWT auth and clothing catalog CRUD
- `frontend` - Vite React web app connected to backend
- `mobile` - reserved for future app using same backend

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Backend docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Deploy to GitHub

```bash
git init
git add .
git commit -m "Initial clothing brand app system setup"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Deploy to Render (Native)

1. Push this repository to GitHub.
2. In Render, create a Blueprint and point to your repo so `render.yaml` is used.
3. Configure env vars:
   - Backend: `SECRET_KEY`, `CORS_ORIGINS`
   - Frontend: `VITE_API_BASE_URL` (set to backend public URL + `/api/v1`)
4. Deploy both services.
