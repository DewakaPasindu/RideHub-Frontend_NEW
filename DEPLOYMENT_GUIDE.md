# Deployment Guide for Driver Availability Management System

## 1. Environment Setup

### Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd driver-availability-system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables
```env
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=RentWheels
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# Backend Environment Variables (for reference)
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/rentwheels
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
BCRYPT_SALT_ROUNDS=12
```

## 2. Production Deployment

### Frontend Deployment (Netlify/Vercel)

#### Netlify Deployment
```bash
# Build the application
npm run build

# Deploy to Netlify
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

#### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Backend Deployment (Railway/Heroku/DigitalOcean)

#### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

#### Docker Deployment
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose Setup
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://backend:3000/api
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/rentwheels
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: rentwheels
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  redis_data:
```

## 3. Database Setup

### PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE rentwheels;

-- Create user
CREATE USER rentwheels_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE rentwheels TO rentwheels_user;

-- Run migrations
npm run migrate
```

### Database Migrations
```bash
# Generate migration
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## 4. Security Configuration

### SSL/TLS Setup
```nginx
# Nginx configuration for HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Security Headers
```typescript
// Backend security configuration
import helmet from 'helmet';
import cors from 'cors';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 5. Monitoring & Logging

### Application Monitoring
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});
```

### Log Management
```bash
# Log rotation with logrotate
/var/log/rentwheels/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 app app
    postrotate
        systemctl reload rentwheels
    endscript
}
```

## 6. Performance Optimization

### Frontend Optimization
```typescript
// Lazy loading for routes
const DriverAvailability = React.lazy(() => import('./pages/DriverAvailability'));
const AdminManagement = React.lazy(() => import('./pages/admin/AdminManagement'));

// Wrap with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <DriverAvailability />
</Suspense>
```

### Backend Optimization
```typescript
// Database connection pooling
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 7. Backup Strategy

### Database Backup
```bash
#!/bin/bash
# Automated backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="rentwheels"

# Create backup
pg_dump $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://your-backup-bucket/
```

## 8. CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deploy frontend
          npm run build
          # Deploy backend
          docker build -t rentwheels-backend .
          docker push your-registry/rentwheels-backend
```

## 9. Scaling Considerations

### Load Balancing
```nginx
upstream backend {
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

### Database Scaling
```typescript
// Read replicas for performance
const masterDb = new Pool({ /* master config */ });
const replicaDb = new Pool({ /* replica config */ });

// Use replica for read operations
const getDriverAvailability = async (driverId: string) => {
  return await replicaDb.query(
    'SELECT * FROM driver_availability WHERE driver_id = $1',
    [driverId]
  );
};

// Use master for write operations
const setDriverAvailability = async (driverId: string, dates: string[]) => {
  return await masterDb.query(
    'INSERT INTO driver_availability (driver_id, available_date) VALUES ...',
    [driverId, ...dates]
  );
};
```

This deployment guide provides comprehensive instructions for setting up, deploying, and scaling the driver availability management system in production environments.