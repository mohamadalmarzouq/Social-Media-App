# Render Deployment Guide

## Current Setup
- **Web Service**: `Social-Media-App` (srv-d2blebk9c44c7392lqgg)
- **Database**: `Social-media-DB` (dpg-d2bm3ube5dus738cic4g-a)
- **URL**: https://social-media-app-hykt.onrender.com

## Environment Variables Setup

### 1. Database Connection
From your Render PostgreSQL service, copy the **Internal Database URL** and set:
```
DATABASE_URL=postgresql://social_media_db_user:password@dpg-d2bm3ube5dus738cic4g-a/social_media_db
```

### 2. NextAuth Configuration
Set these in your Render web service environment variables:
```
NEXTAUTH_URL=https://social-media-app-hykt.onrender.com
NEXTAUTH_SECRET=your-super-secure-random-string-at-least-32-characters-long
```

### 3. Storage Configuration
```
STORAGE_DRIVER=render-disk
UPLOAD_DIR=/data/uploads
NODE_ENV=production
```

## Render Service Configuration

### Build Settings
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18+ (default is fine)

### Persistent Disk
Make sure to attach a persistent disk to your web service:
- **Mount Path**: `/data/uploads`
- **Size**: 10GB (or as needed)

## Database Setup

After setting environment variables, you need to initialize the database:

1. Go to your Render web service
2. Open the **Shell** tab
3. Run these commands:
```bash
npm run db:push
```

This will create all the necessary tables in your PostgreSQL database.

## Post-Deployment Steps

1. **Test the application**: Visit your app URL
2. **Create test accounts**: 
   - Sign up as a business owner (USER role)
   - Sign up as a designer (DESIGNER role)
3. **Test contest creation**: Create a test contest
4. **Verify file uploads**: Test the upload functionality

## Environment Variables Checklist

Make sure these are set in your Render web service:

- [ ] `DATABASE_URL` - From PostgreSQL service
- [ ] `NEXTAUTH_URL` - Your app URL
- [ ] `NEXTAUTH_SECRET` - Secure random string
- [ ] `STORAGE_DRIVER` - Set to "render-disk"
- [ ] `UPLOAD_DIR` - Set to "/data/uploads"
- [ ] `NODE_ENV` - Set to "production"

## Troubleshooting

### Database Connection Issues
- Verify the DATABASE_URL is the internal URL, not external
- Check that the PostgreSQL service is running
- Ensure the web service and database are in the same region

### File Upload Issues
- Verify the persistent disk is attached
- Check that UPLOAD_DIR matches the mount path
- Ensure proper permissions on the upload directory

### Authentication Issues
- Verify NEXTAUTH_URL matches your actual domain
- Ensure NEXTAUTH_SECRET is at least 32 characters
- Check that the app is using HTTPS in production

## Scaling Considerations

### Storage Migration to AWS S3
When ready to scale, you can migrate to AWS S3:

1. Set up AWS S3 bucket
2. Add AWS credentials to environment variables
3. Change `STORAGE_DRIVER` to "aws-s3"
4. The app will automatically use S3 for new uploads

### Database Scaling
- Monitor your PostgreSQL usage in Render dashboard
- Upgrade to larger database plan as needed
- Consider connection pooling for high traffic

## Monitoring

- Check Render logs for any deployment issues
- Monitor database connections and queries
- Watch disk usage for file uploads
- Set up alerts for service downtime
