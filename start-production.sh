#!/bin/bash

# Production Startup Script for Time Tracker
echo "🚀 Starting Time Tracker in Production Mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build and start production environment
echo "🔨 Building and starting production environment..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check container status
echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps

# Check if backend is healthy
echo "🔍 Checking backend health..."
if curl -f http://localhost:8000/api/ > /dev/null 2>&1; then
    echo "✅ Backend is running successfully!"
else
    echo "⚠️ Backend may still be starting up. Check logs with: docker-compose -f docker-compose.prod.yml logs backend"
fi

echo "🎉 Production environment started!"
echo "📋 Useful commands:"
echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  Access backend: http://localhost:8000/api/" 