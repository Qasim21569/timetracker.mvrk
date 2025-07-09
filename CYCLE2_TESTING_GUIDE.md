# Cycle 2 Testing Guide: Project Assignment System

## 🎯 Testing Overview
This guide covers comprehensive testing of our **Project Assignment System** through both manual API calls and the expected functionality.

## 📊 What We're Testing

### ✅ Project Assignment Features:
- Bulk user assignment to projects
- User unassignment from projects (soft delete)
- Assignment retrieval and listing
- User's assigned projects listing
- Assignment statistics and reporting

### ✅ Enhanced Project Features:
- Client field in projects
- Project listing with assignment data
- Frontend-compatible assigned_user_ids field

### ✅ Role-Based Permissions:
- Admin-only assignment operations
- User access to own projects only
- Permission validation and error handling

---

## 🔧 Setup Instructions

### 1. Start Django Server
```bash
cd backend/tracker
python manage.py runserver
```
Server will be available at: `http://localhost:8000`

### 2. Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin (can manage all assignments)

---

## 🌐 Testing with Manual API Calls

### 1. Authentication
First, get your admin token:

```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{"token": "your_admin_token_here"}
```

### 2. Create a Test Project with Client
```bash
curl -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{
    "name": "MVRK Website Redesign",
    "client": "MVRK Development"
  }'
```

**Expected Response:**
```json
{
  "id": 2,
  "name": "MVRK Website Redesign",
  "client": "MVRK Development",
  "owner": 1,
  "owner_name": "Admin User",
  "assigned_user_ids": [],
  "assigned_users": []
}
```

### 3. Create a Test User
```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{
    "username": "john_developer",
    "email": "john@mvrk.dev",
    "first_name": "John",
    "last_name": "Developer",
    "password": "devpass123",
    "password_confirm": "devpass123"
  }'
```

### 4. Assign User to Project
```bash
curl -X POST http://localhost:8000/api/projects/2/assign/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{
    "user_ids": [3],
    "notes": "Assigned to frontend development tasks"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Assignment operation completed for project \"MVRK Website Redesign\"",
  "data": {
    "project_id": 2,
    "project_name": "MVRK Website Redesign",
    "assigned": [
      {
        "user_id": 3,
        "username": "john_developer",
        "name": "John Developer"
      }
    ],
    "already_assigned": [],
    "errors": []
  }
}
```

### 5. Get Project Assignments
```bash
curl -X GET http://localhost:8000/api/projects/2/assignments/ \
  -H "Authorization: Token YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 3,
        "username": "john_developer",
        "name": "John Developer",
        "email": "john@mvrk.dev",
        "is_admin": false
      },
      "assigned_by": {
        "id": 1,
        "username": "admin",
        "name": "Admin User"
      },
      "assigned_date": "2025-07-09T14:43:55.024938+00:00",
      "is_active": true,
      "notes": "Assigned to frontend development tasks"
    }
  ]
}
```

### 6. Get User's Assigned Projects
```bash
curl -X GET http://localhost:8000/api/users/3/projects/ \
  -H "Authorization: Token YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "project": {
        "id": 2,
        "name": "MVRK Website Redesign",
        "client": "MVRK Development",
        "owner": {
          "id": 1,
          "username": "admin",
          "name": "Admin User"
        }
      },
      "assignment": {
        "id": 1,
        "assigned_date": "2025-07-09T14:43:55.024938+00:00",
        "assigned_by": {
          "id": 1,
          "username": "admin",
          "name": "Admin User"
        },
        "is_active": true,
        "notes": "Assigned to frontend development tasks"
      }
    }
  ]
}
```

### 7. Get Assignment Statistics
```bash
curl -X GET http://localhost:8000/api/assignments/stats/ \
  -H "Authorization: Token YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_assignments": 1,
    "total_projects": 2,
    "total_users": 2,
    "unassigned_projects": 1,
    "unassigned_users": 1,
    "assignment_coverage": {
      "projects": 50.0,
      "users": 50.0
    }
  }
}
```

### 8. Unassign User from Project
```bash
curl -X POST http://localhost:8000/api/projects/2/unassign/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{
    "user_ids": [3]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Unassignment operation completed for project \"MVRK Website Redesign\"",
  "data": {
    "project_id": 2,
    "project_name": "MVRK Website Redesign",
    "unassigned": [
      {
        "user_id": 3,
        "username": "john_developer",
        "name": "John Developer"
      }
    ],
    "not_assigned": [],
    "errors": []
  }
}
```

### 9. Verify Enhanced Project List
```bash
curl -X GET http://localhost:8000/api/projects/ \
  -H "Authorization: Token YOUR_TOKEN"
```

**Expected Response:**
Should include the new `client`, `assigned_user_ids`, and `assigned_users` fields:
```json
[
  {
    "id": 2,
    "name": "MVRK Website Redesign",
    "client": "MVRK Development",
    "owner": 1,
    "owner_name": "Admin User",
    "assigned_user_ids": [],
    "assigned_users": []
  }
]
```

---

## 🧪 Permission Testing

### 1. Test Non-Admin Assignment (Should Fail)
First, login as the regular user:
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_developer",
    "password": "devpass123"
  }'
```

Then try to assign (should get 403 Forbidden):
```bash
curl -X POST http://localhost:8000/api/projects/2/assign/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token USER_TOKEN" \
  -d '{
    "user_ids": [1]
  }'
```

**Expected Response:** `403 Forbidden`

### 2. Test User Access to Own Projects Only
User should be able to access their own projects but not other users' projects.

---

## ✅ Expected Test Results

### All Tests Should Pass:
- ✅ **Project Creation**: With client field included
- ✅ **User Assignment**: Bulk assignment with audit trail
- ✅ **Assignment Retrieval**: Full assignment details
- ✅ **User Projects**: List of assigned projects
- ✅ **Unassignment**: Soft delete functionality
- ✅ **Statistics**: Assignment coverage metrics
- ✅ **Permissions**: Admin-only assignment operations
- ✅ **Enhanced APIs**: Project list includes assignment data
- ✅ **Error Handling**: Invalid project/user validation
- ✅ **Frontend Compatibility**: assigned_user_ids field

---

## 🎯 Key Features Verified

### ✅ **Database Design**
- ProjectAssignment through model with audit fields
- Unique constraints preventing duplicate assignments
- Soft delete with is_active flag
- Proper foreign key relationships

### ✅ **Service Layer**
- Clean business logic separation
- Transaction safety for bulk operations
- Comprehensive error handling
- Detailed result reporting

### ✅ **API Design**
- RESTful endpoint structure
- Consistent response formats
- Proper HTTP status codes
- Frontend-compatible data formats

### ✅ **Security**
- Role-based access control
- Permission validation
- User isolation for project access
- Admin-only assignment operations

## 🚀 **Cycle 2 Complete!**

The Project Assignment System is now fully functional with:
- ✅ Enterprise-grade database design
- ✅ Clean service layer architecture  
- ✅ Comprehensive API endpoints
- ✅ Role-based security
- ✅ Frontend-ready data formats
- ✅ Audit trail and statistics

**Ready for Cycle 3: Advanced Time Tracking & Reporting!** 