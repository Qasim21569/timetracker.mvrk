# Time Tracker Backend API

A minimal multitenant time tracking system built with Django REST Framework featuring role-based access control, token authentication, and comprehensive API endpoints.

## 🚀 Features

- **User Management**: User registration and authentication with admin/regular user roles
- **Project Management**: Create and manage projects with ownership control
- **Time Tracking**: Log hours worked on projects with notes
- **Role-Based Access**: Admins can view all data, users see only their own
- **Token Authentication**: Secure API access using Django REST Framework tokens
- **SQLite Database**: Development-ready database configuration

## 📋 Prerequisites

- Python 3.8+
- pip (Python package installer)
- Postman (for API testing)

## 🛠️ Setup & Installation

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv env
```

### 3. Activate Virtual Environment

**Windows:**

```bash
.\env\Scripts\Activate.ps1
```

**macOS/Linux:**

```bash
source env/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Navigate to Project Directory

```bash
cd tracker
```

### 6. Run Database Migrations

```bash
python manage.py migrate
```

### 7. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 8. Start Development Server

```bash
python manage.py runserver
```

The API will be available at: `http://127.0.0.1:8000`

## 📚 API Endpoints

### Authentication Endpoints

| Method | Endpoint       | Description            | Auth Required |
| ------ | -------------- | ---------------------- | ------------- |
| POST   | `/api/signup/` | User registration      | No            |
| POST   | `/api/login/`  | User login (get token) | No            |

### Project Endpoints

| Method | Endpoint         | Description    | Auth Required |
| ------ | ---------------- | -------------- | ------------- |
| GET    | `/api/projects/` | List projects  | Yes           |
| POST   | `/api/projects/` | Create project | Yes           |

### Hour Entry Endpoints

| Method | Endpoint      | Description       | Auth Required |
| ------ | ------------- | ----------------- | ------------- |
| GET    | `/api/hours/` | List hour entries | Yes           |
| POST   | `/api/hours/` | Create hour entry | Yes           |

## 🔑 Authentication

All protected endpoints require a token in the Authorization header:

```
Authorization: Token <your-token-here>
```

## 📝 API Usage Examples

### 1. User Registration

```http
POST /api/signup/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure_password123",
  "is_admin": false
}
```

### 2. User Login

```http
POST /api/login/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure_password123"
}
```

**Response:**

```json
{
  "token": "abc123def456ghi789..."
}
```

### 3. Create Project

```http
POST /api/projects/
Authorization: Token abc123def456ghi789...
Content-Type: application/json

{
  "name": "Website Redesign Project"
}
```

### 4. Create Hour Entry

```http
POST /api/hours/
Authorization: Token abc123def456ghi789...
Content-Type: application/json

{
  "project": 1,
  "date": "2025-01-03",
  "hours": 8.0,
  "note": "Worked on backend API development"
}
```

## 🧪 Testing with Postman

### 1. Import Collection

1. Open Postman
2. Click "Import"
3. Select the file: `TimeTracker_Postman_Collection.json`
4. The collection will be imported with all endpoints

### 2. Set Base URL

- The collection uses a variable `{{base_url}}`
- Default value: `http://127.0.0.1:8000`
- Update if your server runs on a different port

### 3. Testing Workflow

1. **Sign Up**: Create a new user account
2. **Login**: Get authentication token
3. **Set Token**: Copy token from login response to `{{token}}` variable
4. **Create Project**: Add a new project
5. **Create Hour Entry**: Log time worked
6. **List Data**: View projects and hour entries

### 4. Token Management

After login, copy the token from the response and set it in the collection variable:

- Go to Collection Variables
- Set `token` value to the received token
- All authenticated requests will use this token automatically

## 🔐 Role-Based Access Control

### Regular Users

- Can only see their own projects and hour entries
- Can create new projects (automatically assigned as owner)
- Can log hours only for their own projects

### Admin Users

- Can view ALL projects and hour entries from all users
- Have full access to the system
- Set `is_admin: true` during signup

## 🗄️ Database Models

### User Model

```python
class User(AbstractUser):
    is_admin = models.BooleanField(default=False)
```

### Project Model

```python
class Project(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
```

### Hour Entry Model

```python
class HourEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    date = models.DateField()
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    note = models.TextField(blank=True)
```

## 🛠️ Development

### Project Structure

```
backend/
├── env/                    # Virtual environment
├── tracker/               # Django project
│   ├── core/             # Main app
│   │   ├── models.py     # Database models
│   │   ├── serializers.py # DRF serializers
│   │   ├── views.py      # API views
│   │   ├── urls.py       # App URLs
│   │   └── admin.py      # Admin configuration
│   ├── tracker/          # Project settings
│   │   ├── settings.py   # Django settings
│   │   └── urls.py       # Main URL configuration
│   └── manage.py         # Django management
├── requirements.txt       # Python dependencies
├── TimeTracker_Postman_Collection.json # API testing
└── README.md             # This file
```

### Key Technologies

- **Django 5.2.4**: Web framework
- **Django REST Framework 3.16.0**: API development
- **Token Authentication**: Built-in DRF authentication
- **SQLite**: Development database
- **Python 3.8+**: Programming language

## 🚨 Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful GET requests
- `201 Created`: Successful POST requests
- `400 Bad Request`: Invalid data or validation errors
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found

## 📊 Admin Panel

Access the Django admin panel at: `http://127.0.0.1:8000/admin/`

- View and manage all users, projects, and hour entries
- Requires superuser account (created with `python manage.py createsuperuser`)

## 🔧 Configuration

### Settings

Key settings in `tracker/settings.py`:

- Custom User Model: `AUTH_USER_MODEL = 'core.User'`
- Token Authentication enabled
- SQLite database for development
- Django apps: `rest_framework`, `rest_framework.authtoken`, `core`

## 📈 Next Steps

Potential enhancements for production:

- PostgreSQL/MySQL database
- JWT authentication
- API versioning
- Rate limiting
- Docker containerization
- Unit test coverage
- API documentation (Swagger/OpenAPI)

## 🤝 Support

For questions or issues:

1. Check the Postman collection for example requests
2. Review Django logs in the console
3. Verify authentication tokens are valid
4. Ensure proper Content-Type headers (`application/json`)

---

**Built with Django REST Framework following best practices for clean, maintainable code.**
