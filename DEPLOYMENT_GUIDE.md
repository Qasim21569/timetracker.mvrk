# 🚀 Frontend-Backend Connection Guide

## Overview
This guide helps connect your Vercel-hosted frontend with your live Django backend.

### 🔗 URLs
- **Backend**: https://kwcow8kok4s448sw4s8wo8cc.5.78.137.10.sslip.io/api/
- **Frontend**: https://timetrackermvrk.vercel.app/

---

## ⚙️ Backend Configuration (Django)

### 1. Update CORS Settings

**File**: `backend/tracker/tracker/settings.py`

```python
# CORS Settings for Production
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # Add your Vercel frontend URL here
    "https://your-app-name.vercel.app",
    "https://your-custom-domain.com",
]

# For development only
CORS_ALLOW_ALL_ORIGINS = DEBUG

CORS_ALLOW_CREDENTIALS = True

# CSRF Settings for cross-origin requests
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    # Add your Vercel frontend URL here
    "https://your-app-name.vercel.app",
    "https://your-custom-domain.com",
]
```

### 2. Verify Required Dependencies

Ensure these are in your `requirements.txt`:
```
django-cors-headers==4.6.0
```

### 3. Verify Middleware Order

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # MUST be before CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

---

## 🌐 Frontend Configuration (React/Vite)

### 1. API URL Configuration

The frontend is configured to automatically use the correct API URL:
- **Development**: `http://127.0.0.1:8000/api`
- **Production**: `https://kwcow8kok4s448sw4s8wo8cc.5.78.137.10.sslip.io/api`

This is handled in `frontend/vite.config.ts` and `frontend/src/services/api.ts`.

### 2. Vercel Deployment

When deploying to Vercel, no additional environment variables are needed since the API URL is automatically configured.

---

## 🔧 Required Steps

### Backend Steps (On your VPS/Coolify)

1. **Update settings.py** with your Vercel frontend URL:
   ```python
   CORS_ALLOWED_ORIGINS = [
       # ... existing origins ...
       "https://your-actual-vercel-url.vercel.app",
   ]
   
   CSRF_TRUSTED_ORIGINS = [
       # ... existing origins ...
       "https://your-actual-vercel-url.vercel.app", 
   ]
   ```

2. **Restart your Django application** in Coolify

3. **Test the connection**:
   ```bash
   curl https://kwcow8kok4s448sw4s8wo8cc.5.78.137.10.sslip.io/api/users/
   ```

### Frontend Steps (Vercel)

1. **Push your code** to the connected GitHub repository
2. **Vercel will auto-deploy** with the new backend URL
3. **Test the connection** by trying to log in

---

## 🧪 Testing the Connection

### 1. Test Backend API Directly
```bash
# Test signup endpoint
curl -X POST https://kwcow8kok4s448sw4s8wo8cc.5.78.137.10.sslip.io/api/signup/ \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "email": "test@example.com", "password": "testpass123", "password_confirm": "testpass123", "first_name": "Test", "last_name": "User"}'

# Test login endpoint  
curl -X POST https://kwcow8kok4s448sw4s8wo8cc.5.78.137.10.sslip.io/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```

### 2. Test Frontend Connection
1. Open your Vercel frontend
2. Try to log in with: `admin@example.com` / `password`
3. Check browser developer console for any CORS errors

---

## 🐛 Troubleshooting

### Common Issues

#### CORS Error in Browser
**Error**: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Solution**: Add your Vercel URL to `CORS_ALLOWED_ORIGINS` in Django settings.

#### Authentication Issues  
**Error**: "Authentication credentials were not provided"

**Solution**: Verify that token authentication is working:
```javascript
// Check in browser console
localStorage.getItem('auth_token')
```

#### SSL/HTTPS Issues
**Error**: "Mixed content" or SSL errors

**Solution**: Ensure all URLs use HTTPS in production.

---

## 📝 Next Steps

1. **Get your Vercel URL** and update the backend CORS settings
2. **Test the login flow** end-to-end  
3. **Verify all API endpoints** work from the frontend
4. **Monitor logs** in both Coolify and Vercel for any issues

---

## 🆘 Emergency Fallback

If you encounter issues, you can temporarily enable:
```python
CORS_ALLOW_ALL_ORIGINS = True  # Only for debugging!
```

**⚠️ Remember to disable this in production!** 