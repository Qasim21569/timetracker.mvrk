  # PostgreSQL Migration Guide 🚀

This guide will help you migrate your Time Tracker application from SQLite to PostgreSQL without losing any data.

## 🎯 Why This Migration is Important

**The Problem:** SQLite files are stored inside Docker containers. When Coolify redeploys your app, the container is rebuilt and the SQLite database is lost.

**The Solution:** PostgreSQL runs as a separate container with persistent storage, so your data survives deployments.

## 📋 Migration Steps

### Phase 1: Backup Current Production Data

1. **Connect to your production server:**
   ```bash
   # SSH into your VPS or access Coolify terminal
   ssh your-server
   ```

2. **Navigate to your project directory and backup data:**
   ```bash
   cd /path/to/your/project
   python backend/backup_data.py
   ```

3. **Download the backup to your local machine:**
   ```bash
   # Copy the backup directory to your local machine
   scp -r user@your-server:/path/to/backup_YYYYMMDD_HHMMSS ./
   ```

### Phase 2: Local Testing (IMPORTANT!)

1. **Install new dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Test PostgreSQL locally:**
   ```bash
   # Start PostgreSQL using docker-compose
   docker-compose up db
   ```

3. **Test the connection with environment variable:**
   ```bash
   # In backend/tracker/ directory
   export DATABASE_URL="postgresql://timetracker_user:timetracker_pass@localhost:5432/timetracker"
   python manage.py migrate
   python manage.py createsuperuser
   ```

4. **Test data restore:**
   ```bash
   python ../restore_data.py backup_YYYYMMDD_HHMMSS
   ```

5. **Verify everything works:**
   ```bash
   python manage.py runserver
   # Test your API endpoints
   ```

### Phase 3: Production Deployment

1. **In Coolify, set these environment variables:**
   ```
   DATABASE_URL=postgresql://timetracker_user:timetracker_pass@db:5432/timetracker
   DEBUG=False
   SECRET_KEY=your-secure-secret-key-here
   ALLOWED_HOSTS=your-domain.com,kwcow8kok4s448sw4s8wo8cc.5.78.137.10.sslip.io
   ```

2. **Update your docker-compose for production:**
   - Use the `docker-compose.prod.yml` file
   - Ensure PostgreSQL service is included

3. **Deploy the updated code:**
   ```bash
   git add .
   git commit -m "Migrate to PostgreSQL with environment configuration"
   git push
   ```

4. **After successful deployment, restore data:**
   ```bash
   # Access your production container
   docker exec -it your-backend-container bash
   
   # Restore the data
   python ../restore_data.py backup_YYYYMMDD_HHMMSS
   ```

### Phase 4: Verification

1. **Check database connection:**
   ```bash
   python manage.py dbshell
   \dt  # List tables
   \q   # Quit
   ```

2. **Verify data integrity:**
   - Check user accounts
   - Verify projects
   - Test time entries
   - Confirm assignments

3. **Test all functionality:**
   - Login/logout
   - Create/edit users
   - Create/edit projects
   - Time tracking
   - Reports

## 🛠️ Troubleshooting

### Common Issues:

1. **"relation does not exist" error:**
   ```bash
   python manage.py migrate --run-syncdb
   ```

2. **Permission denied errors:**
   ```bash
   # Check database permissions
   python manage.py dbshell
   \du  # List users and permissions
   ```

3. **Connection refused:**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure ports are open

### Rollback Plan:

If something goes wrong:
1. Revert to SQLite by removing DATABASE_URL environment variable
2. Restore from backup using Django's loaddata command
3. Debug the issue and try again

## 📁 File Changes Made

- ✅ `backend/tracker/tracker/settings.py` - Updated for environment-based configuration
- ✅ `backend/requirements.txt` - Added dj-database-url
- ✅ `backend/backup_data.py` - Script to backup current data
- ✅ `backend/restore_data.py` - Script to restore data
- ✅ `backend/env.example` - Environment variable examples

## 🔒 Security Notes

- Always use strong passwords for PostgreSQL
- Keep DATABASE_URL secret
- Use environment variables, never hardcode credentials
- Regularly backup your data

## 🎉 Benefits After Migration

- ✅ No more data loss during deployments
- ✅ Better performance for concurrent users
- ✅ Professional database setup
- ✅ Easy backups and maintenance
- ✅ Scalable for future growth

---

**Need Help?** If you encounter any issues during migration, review the troubleshooting section or check the backup files for data recovery. 