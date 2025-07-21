@echo off
REM Development Startup Script for Time Tracker (Windows)

echo 🚀 Starting Time Tracker in Development Mode...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build and start development environment
echo 🔨 Building and starting development environment...
docker-compose up --build -d

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check container status
echo 📊 Container Status:
docker-compose ps

echo 🎉 Development environment started!
echo 📋 Useful commands:
echo   View logs: docker-compose logs -f backend
echo   Stop services: docker-compose down
echo   Access backend: http://localhost:8000/api/
echo   Access frontend: http://localhost:8080 (if configured)

pause 