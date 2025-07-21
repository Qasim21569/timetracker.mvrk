@echo off
REM Production Startup Script for Time Tracker (Windows)

echo 🚀 Starting Time Tracker in Production Mode...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose -f docker-compose.prod.yml down

REM Build and start production environment
echo 🔨 Building and starting production environment...
docker-compose -f docker-compose.prod.yml up --build -d

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check container status
echo 📊 Container Status:
docker-compose -f docker-compose.prod.yml ps

echo 🎉 Production environment started!
echo 📋 Useful commands:
echo   View logs: docker-compose -f docker-compose.prod.yml logs -f
echo   Stop services: docker-compose -f docker-compose.prod.yml down
echo   Access backend: http://localhost:8000/api/

pause 