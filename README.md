# Time Tracker

A modern time tracking application with React frontend and Django backend.

## Project Structure

```
Time Tracker/
├── frontend/          # React + Vite frontend application
│   ├── src/          # React source code
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── backend/          # Django REST API
│   └── tracker/      # Django project
└── vercel.json       # Deployment configuration
```

## Development Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend/tracker
python -m venv env
source env/bin/activate  # On Windows: .\env\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Features

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn/ui
- **Backend**: Django + Django REST Framework + Token Authentication
- **Database**: SQLite (development)
- **Deployment**: Vercel (frontend) + Django backend API

## Getting Started

1. Clone the repository
2. Follow the development setup for both frontend and backend
3. Access the frontend at http://localhost:5173
4. Access the backend API at http://127.0.0.1:8000/api/

## License

MIT License
