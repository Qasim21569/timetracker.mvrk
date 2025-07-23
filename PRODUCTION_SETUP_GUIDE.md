# 🚀 Production Setup Guide - Time Tracker

## Overview
This guide will help you prepare your Time Tracker application for production use in your company.

---

## 📋 **Pre-Production Checklist**

### ✅ **Phase 1: Clean Up Development Code**
- [x] Remove development credentials from login page
- [x] Configure production API URLs
- [x] Update CORS settings for live domain

### 🗄️ **Phase 2: Database Management**

#### **2.1 Access Your Live Database**

**Option A: Django Admin Interface (Recommended)**
1. **Create a superuser** on your VPS:
   ```bash
   # SSH to your VPS
   ssh your-username@your-vps-ip
   
   # Navigate to your Django project
   cd /path/to/your/django/project
   
   # Create superuser
   python manage.py createsuperuser
   ```

2. **Access Django Admin**:
   - URL: `https://kwcow8kok4s448sw4s8wo8cc.5.78.137.10.sslip.io/admin/`
   - Login with your superuser credentials

**Option B: Database Shell Access**
```bash
# Access Django shell
python manage.py shell

# Access database directly
python manage.py dbshell
```

#### **2.2 Clean/Reset Database (If Needed)**

**⚠️ WARNING: This will delete ALL data!**

```bash
# Method 1: Reset migrations (Nuclear option)
python manage.py flush  # Removes all data, keeps structure

# Method 2: Delete and recreate database
rm db.sqlite3  # If using SQLite
python manage.py migrate
```

#### **2.3 Create Initial Admin User**

**Via Django Shell:**
```python
python manage.py shell

# In the shell:
from django.contrib.auth import get_user_model
User = get_user_model()

# Create your company admin
admin_user = User.objects.create_user(
    username='admin',
    email='admin@mvrk.com',  # Use your company email
    password='your_secure_password',
    first_name='Admin',
    last_name='User',
    is_admin=True,
    is_superuser=True,
    is_staff=True
)
print(f"Admin user created: {admin_user.email}")
```

---

## 👥 **User Management for Production**

### **3.1 Create Company Users**

**Method 1: Via Django Admin**
1. Go to `https://your-domain/admin/core/user/`
2. Click "Add User"
3. Fill in details:
   - Username: employee email or unique ID
   - Email: company email address
   - First/Last name: Employee name
   - Is admin: Check for managers
   - Is active: Always check

**Method 2: Via Frontend**
1. Login as admin to your frontend
2. Go to "User Management"
3. Click "Add New User"
4. Create users for each employee

### **3.2 Recommended User Structure**
```
Admin Users (is_admin=True):
- CEO/Founder
- Project Managers
- HR/Admin Staff

Regular Users (is_admin=False):
- Developers
- Designers
- Other employees
```

---

## 🏢 **Project Setup for Your Company**

### **4.1 Create Initial Projects**

**Via Frontend (Recommended):**
1. Login as admin
2. Go to "Project Management"
3. Create projects like:
   - "Internal Development"
   - "Client Project A"
   - "Marketing Campaigns"
   - "Administrative Tasks"

**Via Django Shell:**
```python
from core.models import Project, User

admin_user = User.objects.get(email='admin@mvrk.com')

# Create sample projects
projects = [
    {'name': 'Website Development', 'client': 'Internal'},
    {'name': 'Mobile App', 'client': 'Client ABC'},
    {'name': 'Marketing Campaign', 'client': 'Internal'},
]

for proj_data in projects:
    Project.objects.create(
        name=proj_data['name'],
        client=proj_data['client'],
        owner=admin_user
    )
```

---

## 🔒 **Security & Access Control**

### **5.1 Update Default Passwords**
- [ ] Change all default passwords
- [ ] Use strong passwords (12+ characters)
- [ ] Consider using password manager

### **5.2 User Permissions**
- **Admins can**: View all data, manage users/projects, generate reports
- **Users can**: Log their own time, view their own data

### **5.3 Data Privacy**
- Users can only see their own time entries
- Admins can see all time entries
- No cross-user data leakage

---

## 📊 **Monitoring & Maintenance**

### **6.1 Regular Database Backups**

**Setup Automatic Backups:**
```bash
# Create backup script
cat > backup_database.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
python manage.py dumpdata > backup_$DATE.json
# Upload to cloud storage or move to safe location
EOF

chmod +x backup_database.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup_database.sh
```

### **6.2 Monitor Usage**
- Check Django admin regularly
- Monitor user activity
- Review time entries for accuracy

---

## 🧪 **Testing Before Company Rollout**

### **Phase 1: Admin Testing (You)**
1. [ ] Create test projects
2. [ ] Log sample time entries
3. [ ] Generate reports
4. [ ] Test user management

### **Phase 2: Small Team Testing**
1. [ ] Create 2-3 test users
2. [ ] Have them log time for 1 week
3. [ ] Verify data accuracy
4. [ ] Fix any issues

### **Phase 3: Company Rollout**
1. [ ] Create all employee accounts
2. [ ] Send login credentials securely
3. [ ] Provide brief training
4. [ ] Monitor for first week

---

## 📧 **Communicating with Your Team**

### **Email Template for Employees**
```
Subject: New Time Tracking System - TimeTracker

Hi Team,

We're launching our new time tracking system to better manage projects and productivity.

🔗 Access: https://timetrackermvrk.vercel.app/
📧 Your login: [employee_email]
🔑 Temporary password: [secure_password]

First Steps:
1. Login and change your password
2. Start logging time for your current projects
3. Report any issues to [admin_email]

Questions? Contact me or check the system's help section.

Best,
[Your Name]
```

---

## 🚨 **Troubleshooting Common Issues**

### **Login Issues**
- Verify email is correct
- Check password requirements
- Ensure user account is active

### **CORS Errors**
- Verify frontend URL in Django CORS settings
- Check browser console for specific errors

### **Database Issues**
- Check Django logs in Coolify
- Verify database connections
- Monitor disk space

---

## 📞 **Support & Next Steps**

### **Immediate Actions**
1. [ ] Create admin user with your company email
2. [ ] Test login on frontend
3. [ ] Create initial projects
4. [ ] Add 1-2 test employees

### **This Week**
1. [ ] Complete small team testing
2. [ ] Document any company-specific workflows
3. [ ] Prepare employee training materials

### **Next Week**
1. [ ] Company-wide rollout
2. [ ] Monitor usage patterns
3. [ ] Gather feedback for improvements

---

## 🎯 **Success Metrics**

Track these to measure success:
- [ ] All employees logging time daily
- [ ] Accurate project time allocation
- [ ] Regular report generation
- [ ] Reduced time tracking overhead

Your system is now production-ready! 🚀 