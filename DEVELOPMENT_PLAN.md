# Time Tracker SaaS - Phase 1 Development Plan

## 🎯 Project Overview
Building a functional time tracking SaaS application with Django REST API backend and React TypeScript frontend. MVRK will be the first tenant (internal use) before adding multi-tenancy in Phase 2.

## 📋 Senior Developer's Initial Requirements
1. **Start with authentication enhancements**
2. **Add password confirmation to signup**
3. **Build remaining API endpoints to match frontend expectations**
4. **Test thoroughly before integration**

## 🏗️ Backend Development Best Practices

### Code Quality Standards
- **Django REST Framework** patterns and conventions
- **Token-based authentication** with proper permission classes
- **Serializer validation** with custom validators
- **Error handling** with consistent response formats
- **API versioning** (`/api/v1/`) for future compatibility
- **Pagination** for list endpoints
- **Filtering and searching** capabilities
- **Proper HTTP status codes** and responses
- **Documentation** with Django REST Framework browsable API

### Database Best Practices
- **Model relationships** with proper foreign keys
- **Database indexes** on frequently queried fields
- **Migration safety** with backward compatibility
- **Data validation** at model level
- **Soft deletes** for audit trails where needed

### Security Best Practices
- **Permission classes** for role-based access
- **Input validation** and sanitization
- **Rate limiting** on authentication endpoints
- **CORS configuration** for frontend integration
- **Environment variables** for sensitive settings

## 📊 Frontend Analysis - Required APIs

Based on frontend `dataService.ts` analysis, we need these API endpoints:

### Current Frontend Services:
- `userService` - User management (CRUD)
- `projectService` - Project management with user assignments
- `timeEntryService` - Time tracking with filtering

### Frontend Data Models:
```typescript
User: { id, name, email, role, isActive, createdAt }
Project: { id, name, description, assignedUserIds, createdAt, isActive }
TimeEntry: { id, userId, projectId, date, hours, notes }
```

## 🔄 Development Cycles (3-Phase Approach)

### **CYCLE 1: Enhanced Authentication & User Management**
*Timeline: 3-4 days*

#### APIs to Build:
1. **Enhanced Signup** - Add password confirmation
2. **User List** - Admin can view all users
3. **User Detail** - Get specific user info
4. **User Update** - Admin can update user roles
5. **User Delete** - Admin can deactivate users

#### Testing Phase:
- Postman collection for all auth endpoints
- Role-based permission testing
- Error handling validation

#### Integration Phase:
- Replace frontend localStorage user functions
- Test admin user management UI
- Verify role-based access

---

### **CYCLE 2: Project Management & User Assignment**
*Timeline: 3-4 days*

#### APIs to Build:
1. **Project Assignment** - Admin assigns users to projects
2. **User Projects** - Get projects for specific user
3. **Project Members** - Get/manage project team members
4. **Project Filtering** - Filter by user, status, etc.

#### Testing Phase:
- Project assignment workflows
- User project access validation
- Admin vs user permission testing

#### Integration Phase:
- Replace frontend localStorage project functions
- Test project assignment UI
- Verify user can only see assigned projects

---

### **CYCLE 3: Advanced Time Tracking & Reporting**
*Timeline: 3-4 days*

#### APIs to Build:
1. **Time Entry Filtering** - By user, project, date range
2. **Daily Summary** - Total hours per day
3. **Weekly Summary** - Hours grouped by week
4. **Monthly Summary** - Monthly time reports
5. **Project Time Reports** - Time spent per project

#### Testing Phase:
- Time tracking workflows
- Report generation accuracy
- Date filtering validation

#### Integration Phase:
- Replace frontend localStorage time functions
- Test time tracking UI components
- Verify reporting dashboards

## 📝 Detailed API Specifications

### **CYCLE 1 APIs**

#### 1. Enhanced Signup API
```python
POST /api/auth/signup/
{
    "username": "string",
    "email": "string", 
    "password": "string",
    "password_confirm": "string",
    "first_name": "string",
    "last_name": "string"
}
```

#### 2. User Management APIs
```python
GET /api/users/                    # List all users (admin only)
GET /api/users/{id}/              # Get user details
PUT /api/users/{id}/              # Update user (admin only)
DELETE /api/users/{id}/           # Deactivate user (admin only)
POST /api/users/                  # Create new user (admin only)
```

### **CYCLE 2 APIs**

#### 3. Project Assignment APIs
```python
POST /api/projects/{id}/assign/   # Assign users to project
DELETE /api/projects/{id}/unassign/ # Remove users from project
GET /api/projects/my/             # Get current user's projects
GET /api/projects/{id}/members/   # Get project team members
```

#### 4. Enhanced Project APIs
```python
GET /api/projects/?assigned_to={user_id}  # Filter projects
GET /api/projects/?status={active|inactive}
```

### **CYCLE 3 APIs**

#### 5. Time Tracking APIs
```python
GET /api/time-entries/?user={id}&date_from={date}&date_to={date}
GET /api/time-entries/daily/?date={date}&user={id}
GET /api/time-entries/weekly/?week={date}&user={id}
GET /api/time-entries/monthly/?month={date}&user={id}
GET /api/reports/project/{id}/time/
```

## 🧪 Testing Strategy

### Postman Collections
1. **Authentication Collection**
   - Signup with password confirmation
   - Login and token generation
   - Profile access

2. **User Management Collection** 
   - Admin user CRUD operations
   - Permission testing (admin vs user)
   - Error handling scenarios

3. **Project Management Collection**
   - Project assignment workflows
   - User project access
   - Project filtering

4. **Time Tracking Collection**
   - Time entry CRUD
   - Reporting endpoints
   - Date filtering

### Test Data Setup
```python
# Django fixtures for consistent testing
- Admin user: admin@mvrk.com
- Regular users: user1@test.com, user2@test.com
- Sample projects: "MVRK Internal", "Client Project A"
- Sample time entries: Various dates and hours
```

## 🔗 Integration Strategy

### Frontend Service Layer Updates
Replace localStorage functions with API calls:

```typescript
// BEFORE (localStorage)
const users = getFromStorage<User>(STORAGE_KEYS.USERS);

// AFTER (API)
const users = await apiClient.get<User[]>('/api/users/');
```

### Error Handling
```typescript
// Consistent error handling across all services
try {
    const response = await apiClient.get('/api/users/');
    return response.data;
} catch (error) {
    if (error.status === 401) {
        // Redirect to login
    } else if (error.status === 403) {
        // Show permission error
    }
    throw error;
}
```

## 📈 Success Metrics

### Development Metrics
- **API Response Time** < 200ms average
- **Test Coverage** > 90% for all endpoints
- **Error Rate** < 1% in testing
- **Documentation** Complete for all endpoints

### User Experience Metrics
- **Authentication Flow** < 30 seconds
- **Project Assignment** < 5 clicks for admin
- **Time Entry** < 2 minutes to log hours
- **Report Generation** < 3 seconds

## 🚀 Deployment Preparation

### Environment Setup
```python
# settings.py configurations
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',  # Production ready
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
    }
}

# Security settings
ALLOWED_HOSTS = ['api.timetracker.mvrk.com']
CORS_ALLOWED_ORIGINS = ['https://timetracker.mvrk.com']
```

### Docker Configuration
```dockerfile
# Production-ready Django setup
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "tracker.wsgi:application"]
```

## 📅 Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Cycle 1 | 3-4 days | Enhanced auth + user management |
| Cycle 2 | 3-4 days | Project assignment system |
| Cycle 3 | 3-4 days | Advanced time tracking |
| **Total** | **9-12 days** | **Fully functional system** |

## 🎯 Next Steps

1. **Start Cycle 1** - Enhanced authentication
2. **Setup Django admin** - For database management
3. **Create Postman workspace** - For API testing
4. **Initialize Git workflow** - Feature branches for each cycle

---

*This plan follows enterprise-grade development practices suitable for a real-world SaaS product that will be licensed to multiple companies.* 