@echo off
echo 🚀 Starting Time Tracker Backend with PostgreSQL...
echo.

REM Activate virtual environment
call .venv\Scripts\activate

REM Set environment variables for PostgreSQL
set DATABASE_URL=postgresql://timetracker_user:timetracker_pass@localhost:5432/timetracker
set SECRET_KEY=django-insecure-dfd@%%i4g=of57mg6p78o9#^w=t2n1wb6)t^i77n$q&irklo+9c
set DEBUG=True
set ALLOWED_HOSTS=127.0.0.1,localhost,kwcow8kok4s448sw4s8wo8cc.5.78.137.10.sslip.io
set CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,https://timetrackermvrk.vercel.app,https://time.mvrk.ca,https://kwcow8kok4s448sw4s8wo8cc.5.78.137.10.sslip.io
set CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,https://timetrackermvrk.vercel.app,https://time.mvrk.ca,https://kwcow8kok4s448sw4s8wo8cc.5.78.137.10.sslip.io

echo ✅ Environment variables set for PostgreSQL
echo 🔄 Starting Django server...
echo.

cd tracker
python manage.py runserver

pause