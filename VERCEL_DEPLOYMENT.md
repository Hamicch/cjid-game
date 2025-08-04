# Vercel Deployment Guide

## Environment Variables Setup

Add these environment variables in your Vercel project settings:

### Required Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

### How to Add Environment Variables:

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anon key
   - **NEXT_PUBLIC_ADMIN_PASSWORD**: Your admin password (default: admin123)

## Deployment Steps:

1. **Commit and push to main branch:**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Vercel will automatically deploy** when it detects the push to main

3. **Verify deployment** by checking your Vercel dashboard

## Post-Deployment Checklist:

✅ Environment variables are set
✅ Database tables are created in Supabase
✅ Admin password is configured
✅ Test the game functionality
✅ Test admin dashboard access

## Admin Access:
- **URL**: `https://your-domain.vercel.app/admin`
- **Password**: The one you set in `NEXT_PUBLIC_ADMIN_PASSWORD`