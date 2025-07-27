# Deployment Guide

This guide covers deploying the Orange Site Inspector frontend to various platforms.

## 🚀 Quick Deploy Options

### 1. Vercel (Recommended - Easiest)

**Prerequisites:**
- GitHub account
- Vercel account

**Steps:**
1. Fork/clone the repository to your GitHub account
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.com/api
   VITE_APP_ENV=production
   VITE_APP_VERSION=1.0.0
   ```
6. Click "Deploy"

**Custom Domain:**
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### 2. Netlify

**Prerequisites:**
- GitHub account
- Netlify account

**Steps:**
1. Fork/clone the repository to your GitHub account
2. Go to [Netlify](https://netlify.com) and sign in
3. Click "New site from Git"
4. Connect your GitHub repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in "Site settings" → "Environment variables"
7. Click "Deploy site"

### 3. GitHub Pages

**Prerequisites:**
- GitHub repository

**Steps:**
1. Add GitHub Actions workflow (see `.github/workflows/deploy.yml`)
2. Configure repository secrets:
   - `VITE_API_BASE_URL`
   - `VITE_APP_ENV`
3. Push to main branch to trigger deployment

## 🐳 Docker Deployment

### Local Docker Build

```bash
# Build the image
docker build -t orange-site-inspector-frontend .

# Run the container
docker run -p 3000:80 orange-site-inspector-frontend
```

### Docker Compose (Full Stack)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Deployment

1. **Build and push to registry:**
```bash
docker build -t your-registry/orange-site-inspector-frontend:latest .
docker push your-registry/orange-site-inspector-frontend:latest
```

2. **Deploy to server:**
```bash
docker pull your-registry/orange-site-inspector-frontend:latest
docker run -d -p 80:80 --name orange-frontend your-registry/orange-site-inspector-frontend:latest
```

## ☁️ Cloud Platform Deployment

### AWS (EC2 + S3 + CloudFront)

**S3 Static Website:**
1. Create S3 bucket
2. Enable static website hosting
3. Upload built files from `dist/` folder
4. Configure bucket policy for public read access

**CloudFront Distribution:**
1. Create CloudFront distribution
2. Set S3 bucket as origin
3. Configure custom domain and SSL certificate
4. Set up error pages to redirect to `/index.html`

**EC2 with Nginx:**
1. Launch EC2 instance
2. Install Docker
3. Run container:
```bash
docker run -d -p 80:80 --name orange-frontend your-image:latest
```

### Azure (Static Web Apps)

1. Go to Azure Portal
2. Create "Static Web App"
3. Connect GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Output location: `dist`
5. Add environment variables
6. Deploy

### Google Cloud (Cloud Run)

1. Build and push to Google Container Registry:
```bash
docker build -t gcr.io/your-project/orange-frontend .
docker push gcr.io/your-project/orange-frontend
```

2. Deploy to Cloud Run:
```bash
gcloud run deploy orange-frontend \
  --image gcr.io/your-project/orange-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_API_TIMEOUT=30000

# Application
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

### Environment-Specific Configurations

**Development:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

**Staging:**
```env
VITE_API_BASE_URL=https://staging-api.yourdomain.com/api
VITE_APP_ENV=staging
```

**Production:**
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_ENV=production
```

## 🔒 Security Considerations

### HTTPS
- Always use HTTPS in production
- Configure SSL certificates
- Redirect HTTP to HTTPS

### Headers
The application includes security headers:
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

### CORS
Ensure your backend allows requests from your frontend domain:
```csharp
app.UseCors(builder => builder
    .WithOrigins("https://your-frontend-domain.com")
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());
```

## 📊 Monitoring and Analytics

### Performance Monitoring
- Use Vercel Analytics (if using Vercel)
- Google Analytics 4
- Sentry for error tracking

### Health Checks
The application includes a health check endpoint:
- URL: `/health`
- Returns: `200 OK` with "healthy" message

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
- Check Node.js version (18+)
- Clear node_modules and reinstall
- Verify environment variables

**Runtime Errors:**
- Check browser console for errors
- Verify API endpoint is accessible
- Check CORS configuration

**Performance Issues:**
- Enable gzip compression
- Use CDN for static assets
- Optimize images and bundle size

### Debug Mode
Enable debug mode by setting:
```env
VITE_APP_ENV=development
```

This will show additional error details and debug information.

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review platform-specific documentation
3. Contact the development team
4. Create an issue in the repository

---

**Last Updated**: December 2024 