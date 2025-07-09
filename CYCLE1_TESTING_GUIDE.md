# Cycle 1 Testing Guide: Enhanced Authentication & User Management

## 🎯 Testing Overview
This guide covers comprehensive testing of our enhanced authentication system and user management features through both **Postman** and **Django Admin Interface**.

## 📊 What We're Testing

### ✅ Enhanced Authentication Features:
- Password confirmation validation
- Enhanced user fields (first_name, last_name, email)
- Frontend-compatible response format
- Token-based authentication

### ✅ User Management Features:
- Admin-only user CRUD operations
- Role-based permissions
- User filtering capabilities
- Soft delete functionality

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
- **Role**: Admin (can access all endpoints)

---

## 🌐 Testing with Django Admin Interface

### 1. Access Django Admin
1. Navigate to: `http://localhost:8000/admin/`
2. Login with admin credentials
3. You should see the admin dashboard

### 2. User Management via Admin
1. **View Users**: Click on "Users" to see all registered users
2. **Add User**: Click "Add User" to create new users
3. **Edit User**: Click on any user to edit their details
4. **User Fields**: Verify all fields are present:
   - Username, Email, First Name, Last Name
   - is_admin checkbox
   - is_active checkbox
   - Date joined

### 3. Check Model Relationships
1. **Projects**: Should show owner relationship
2. **Hour Entries**: Should show user and project relationships
3. **Tokens**: Should show user authentication tokens

### 4. Test Data Integrity
1. Create a test user via admin
2. Assign them to a project
3. Create some hour entries
4. Verify relationships are maintained

---

## 📮 Testing with Postman

### 1. Import Collection 
1. Open Postman
2. Click "Import" 
3. Upload `CYCLE1_POSTMAN_COLLECTION.json`
4. Collection will include all test cases

### 2. Environment Variables
The collection uses these variables (automatically set):
- `base_url`: `http://localhost:8000/api`
- `admin_token`: Set after admin login
- `user_token`: Set after user login
- `created_user_id`: Set after creating user

### 3. Test Execution Order
**Run tests in this sequence:**

#### Step 1: Authentication Tests
1. **Enhanced Signup - Valid**
   - ✅ Expect: 201 Created
   - ✅ Verify: User data returned with name, role fields
   - ✅ Verify: Password not in response

2. **Enhanced Signup - Password Mismatch**
   - ✅ Expect: 400 Bad Request
   - ✅ Verify: Password confirmation error message

3. **Admin Login**
   - ✅ Expect: 200 OK
   - ✅ Verify: Token returned and saved to variable

4. **User Login**
   - ✅ Expect: 200 OK
   - ✅ Verify: Token returned and saved to variable

#### Step 2: Profile Management
1. **Get Admin Profile**
   - ✅ Expect: 200 OK
   - ✅ Verify: role = "admin", is_admin = true

2. **Get User Profile**
   - ✅ Expect: 200 OK
   - ✅ Verify: role = "user", is_admin = false

#### Step 3: Admin User Management
1. **List All Users (Admin)**
   - ✅ Expect: 200 OK
   - ✅ Verify: Array of users returned

2. **Create New User (Admin)**
   - ✅ Expect: 201 Created
   - ✅ Verify: User created with correct data

3. **Get User Details (Admin)**
   - ✅ Expect: 200 OK
   - ✅ Verify: Specific user data returned

4. **Update User (Admin)**
   - ✅ Expect: 200 OK
   - ✅ Verify: User data updated correctly

#### Step 4: Permission Tests
1. **Non-Admin Access Denied**
   - ✅ Expect: 403 Forbidden
   - ✅ Verify: Regular user cannot access admin endpoints

2. **Unauthenticated Access Denied**
   - ✅ Expect: 401 Unauthorized
   - ✅ Verify: No token = no access

#### Step 5: Filtering Tests
1. **Filter Users by Role - Admin**
   - ✅ Expect: 200 OK
   - ✅ Verify: Only admin users returned

2. **Filter Users by Role - User**
   - ✅ Expect: 200 OK
   - ✅ Verify: Only regular users returned

---

## 🧪 Manual API Testing (Alternative to Postman)

### Using curl commands:

#### 1. Enhanced Signup
```bash
curl -X POST http://localhost:8000/api/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "password": "testpass123",
    "password_confirm": "testpass123"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

#### 3. Get Profile (replace TOKEN)
```bash
curl -X GET http://localhost:8000/api/profile/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

#### 4. List Users (Admin only)
```bash
curl -X GET http://localhost:8000/api/users/ \
  -H "Authorization: Token YOUR_ADMIN_TOKEN_HERE"
```

---

## ✅ Expected Test Results

### All Tests Should Pass:
- ✅ **Authentication**: Signup, login, profile access
- ✅ **Validation**: Password confirmation, required fields
- ✅ **Permissions**: Admin vs user access control
- ✅ **User Management**: CRUD operations for admin
- ✅ **Filtering**: Role-based user filtering
- ✅ **Security**: Token authentication, permission checks

### Key Success Metrics:
- **Response Times**: < 200ms for all endpoints
- **Error Handling**: Proper HTTP status codes
- **Data Integrity**: Consistent user data structure
- **Security**: No unauthorized access allowed

---

## 🚨 Common Issues & Solutions

### Issue 1: Server Not Running
**Error**: Connection refused
**Solution**: Ensure Django server is running on port 8000

### Issue 2: Migration Issues
**Error**: Database errors
**Solution**: Run `python manage.py migrate`

### Issue 3: Admin Login Failed
**Error**: Invalid credentials
**Solution**: Verify admin user exists with correct password

### Issue 4: Token Issues
**Error**: 401 Unauthorized
**Solution**: Ensure token is included in Authorization header

### Issue 5: Permission Denied
**Error**: 403 Forbidden
**Solution**: Verify user has admin privileges for admin endpoints

---

## 📈 Performance Benchmarks

### Expected Response Times:
- **Signup**: < 300ms
- **Login**: < 200ms
- **Profile**: < 100ms
- **User List**: < 200ms
- **User CRUD**: < 250ms

### Load Testing:
- **Concurrent Users**: Should handle 10+ simultaneous requests
- **Memory Usage**: Stable under normal load
- **Database Queries**: Optimized with proper indexing

---

## 🎉 Success Criteria

### Cycle 1 is complete when:
1. ✅ All Postman tests pass (green results)
2. ✅ Django admin interface works smoothly
3. ✅ Password confirmation prevents mismatched passwords
4. ✅ Admin users can manage all users
5. ✅ Regular users cannot access admin endpoints
6. ✅ User filtering works correctly
7. ✅ Response format matches frontend expectations

**Once all tests pass, we're ready for Cycle 2: Project Assignment System! 🚀** 