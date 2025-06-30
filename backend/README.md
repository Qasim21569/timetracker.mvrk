# Time Tracker Backend API

A Django REST Framework-based backend for a multitenant time tracking system with role-based access control.

## Features

- Custom User model with Admin/User roles
- Token-based authentication
- Project management with ownership
- Hour entry tracking
- Role-based data access (Admins see all data, Users see only their own)
- SQLite database for development
- Django Admin interface

## Setup Instructions

### 1. Virtual Environment Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv env

# Activate virtual environment
# On Windows:
.\env\Scripts\Activate.ps1
# On macOS/Linux:
source env/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Database Setup

```bash
# Navigate to tracker project
cd tracker

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 4. Run Development Server

```bash
python manage.py runserver
```

The API will be available at: `http://127.0.0.1:8000/`

## API Endpoints

### Authentication

#### Signup (Create User)

- **POST** `/api/signup/`
- **Body:**

```json
{
  "username": "john",
  "password": "123456",
  "is_admin": false
}
```

#### Login (Get Token)

- **POST** `/api/login/`
- **Body:**

```json
{
  "username": "john",
  "password": "123456"
}
```

- **Response:**

```json
{
  "token": "abc123token"
}
```

### Projects

#### List/Create Projects

- **GET/POST** `/api/projects/`
- **Headers:** `Authorization: Token abc123token`
- **POST Body:**

```json
{
  "name": "Internal Project"
}
```

### Hour Entries

#### List/Create Hour Entries

- **GET/POST** `/api/hours/`
- **Headers:** `Authorization: Token abc123token`
- **POST Body:**

```json
{
  "project": 1,
  "date": "2025-06-30",
  "hours": 8.5,
  "note": "Worked on backend setup"
}
```

## Models

### User

- Extends Django's AbstractUser
- Additional field: `is_admin` (Boolean)

### Project

- `name`: CharField(max_length=100)
- `owner`: ForeignKey to User

### HourEntry

- `user`: ForeignKey to User
- `project`: ForeignKey to Project
- `date`: DateField
- `hours`: DecimalField(max_digits=5, decimal_places=2)
- `note`: TextField(blank=True)

## Role-Based Access

- **Admin Users**: Can view and manage all projects and hour entries
- **Regular Users**: Can only view and manage their own projects and hour entries

## Django Admin

Access the admin interface at: `http://127.0.0.1:8000/admin/`

Use the superuser credentials created during setup to manage:

- Users
- Projects
- Hour Entries

## Development Notes

- Uses SQLite database (`db.sqlite3`) for development
- Token authentication via Django REST Framework
- All API endpoints require authentication except signup and login
- CORS headers may need to be configured for frontend integration

## Testing the API

You can test the API using tools like:

- Postman
- curl
- HTTPie
- Or any REST client

Example curl commands:

```bash
# Signup
curl -X POST http://127.0.0.1:8000/api/signup/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123","is_admin":false}'

# Login
curl -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# Create Project (replace TOKEN with actual token)
curl -X POST http://127.0.0.1:8000/api/projects/ \
  -H "Authorization: Token TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project"}'
```
