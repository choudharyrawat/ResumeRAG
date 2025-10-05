# ResumeRAG (FastAPI)

Minimal Resume Search & Job Match project using FastAPI and React.

## Backend (FastAPI)
1. Create virtual environment and install dependencies:
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run server:
```bash
uvicorn main:app --reload --port 8000
```

## Frontend (React)
1. Install dependencies and run:
```bash
cd frontend
npm install
npm start
```

Open frontend at http://localhost:3000 and backend at http://localhost:8000.
