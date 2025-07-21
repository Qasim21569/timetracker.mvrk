# 🐳 Time Tracker - Docker Deployment Guide

## Overview

This guide will help you deploy the Time Tracker application using Docker and Docker Compose. The setup includes:

- **Django Backend** with Gunicorn for production
- **PostgreSQL Database** for data persistence
- **Development and Production configurations**
- **Health checks and monitoring**

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.x or later
- 4GB+ RAM available
- Windows 10/11, macOS, or Linux

## 🚀 Quick Start (Development)

### 1. Clone and Navigate
```bash
git clone <your-repo>
cd time-tracker
```

### 2. Start Development Environment
```bash
# Start all services in background
docker-compose up -d

# View logs
docker-compose logs -f backend

# Check container status
docker-compose ps
```

### 3. Access the Application
- **Backend API**: http://localhost:8000/api/
- **Database**: localhost:5432 (internal)

### 4. Stop the Environment
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

## 🏭 Production Deployment

### 1. Use Production Compose File
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 2. Environment Variables
Create a `.env` file for production:
```env
# Database
POSTGRES_DB=timetracker_prod
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password

# Django
SECRET_KEY=your-super-secret-key-here
DEBUG=0
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

# Database URL
DATABASE_URL=postgresql://your_db_user:your_secure_password@db:5432/timetracker_prod
```

## 🔧 Configuration Options

### Backend Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Enable Django debug mode | `1` (dev), `0` (prod) |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Frontend URLs | `http://localhost:8080` |
| `DATABASE_URL` | PostgreSQL connection string | SQLite (dev only) |

### Database Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `timetracker` |
| `POSTGRES_USER` | Database user | `timetracker_user` |
| `POSTGRES_PASSWORD` | Database password | `timetracker_pass` |

## 🛠️ Common Docker Commands

### Container Management
```bash
# Build only backend image
docker build -t timetracker-backend ./backend

# Run backend container standalone
docker run -p 8000:8000 timetracker-backend

# Execute commands in running container
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py collectstatic

# Access container shell
docker-compose exec backend bash
```

### Database Operations
```bash
# Access PostgreSQL shell
docker-compose exec db psql -U timetracker_user -d timetracker

# Backup database
docker-compose exec db pg_dump -U timetracker_user timetracker > backup.sql

# Restore database
docker-compose exec -T db psql -U timetracker_user timetracker < backup.sql
```

### Monitoring and Logs
```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f backend
docker-compose logs -f db

# View resource usage
docker stats
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port 8000
netstat -tulpn | grep :8000

# Change port in docker-compose.yml
ports:
  - "8001:8000"  # Use port 8001 instead
```

#### 2. Permission Denied
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

#### 3. Database Connection Issues
```bash
# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

#### 4. Build Failures
```bash
# Clean build (no cache)
docker-compose build --no-cache

# Remove all containers and rebuild
docker-compose down
docker system prune -a
docker-compose up --build
```

### Health Checks
```bash
# Check backend health
curl http://localhost:8000/api/users/ -H "Authorization: Bearer <token>"

# Check database health
docker-compose exec db pg_isready -U timetracker_user
```

## 📈 Performance Optimization

### Production Optimizations
1. **Multi-stage builds** (already implemented)
2. **Non-root user** (security)
3. **Gunicorn workers** (3 workers by default)
4. **Static file serving** with WhiteNoise
5. **Health checks** for all services

### Scaling
```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Use load balancer (Nginx) for multiple instances
```

## 🚢 Deployment to Server

### Option 1: Direct Docker Compose
```bash
# On your server
git clone <your-repo>
cd time-tracker
cp docker-compose.prod.yml docker-compose.yml
docker-compose up -d
```

### Option 2: CI/CD with GitHub Actions
The repository includes GitHub Actions workflow for automated deployment.

### Option 3: Container Registry
```bash
# Tag and push to registry
docker tag timetracker-backend your-registry.com/timetracker-backend
docker push your-registry.com/timetracker-backend
```

## 🔐 Security Best Practices

1. **Use specific image tags** (not `:latest`)
2. **Run as non-root user** ✅ (implemented)
3. **Use secrets management** for passwords
4. **Enable SSL/TLS** in production
5. **Regular security updates**
6. **Network isolation** ✅ (implemented)

## 📚 Additional Resources

- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [PostgreSQL in Docker](https://hub.docker.com/_/postgres)

## 🆘 Support

For issues related to:
- **Docker setup**: Check this README
- **Django backend**: See `backend/README.md`
- **Frontend**: See `frontend/README.md`

---

**Happy Dockerizing! 🐳** 