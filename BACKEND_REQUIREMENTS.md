# Backend Development Requirements for Driver Availability Management System

## 1. Technology Stack Recommendations

### Backend Framework
- **Node.js with Express.js** - Fast, scalable server-side JavaScript
- **TypeScript** - Type safety and better development experience
- **JWT (JSON Web Tokens)** - Secure authentication mechanism

### Database
- **PostgreSQL** - Robust relational database with excellent JSON support
- **Redis** - Session storage and caching
- **Prisma ORM** - Type-safe database access with migrations

### Additional Technologies
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Joi/Yup** - Input validation
- **Winston** - Logging
- **Helmet** - Security middleware

## 2. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user', -- 'user', 'driver', 'admin', 'superadmin'
  is_driver BOOLEAN DEFAULT false,
  mobile_number VARCHAR(20),
  profile_photo VARCHAR(500),
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Driver Availability Table
```sql
CREATE TABLE driver_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(driver_id, available_date)
);
```

### Admin Users Table
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin', -- 'admin', 'manager', 'superadmin'
  created_by UUID REFERENCES admin_users(id),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

## 3. API Endpoints

### Authentication Endpoints
```typescript
// User Authentication
POST   /api/auth/register           // User registration
POST   /api/auth/login              // User login
POST   /api/auth/logout             // User logout
POST   /api/auth/refresh            // Refresh JWT token
GET    /api/auth/profile            // Get user profile
PUT    /api/auth/profile            // Update user profile

// Admin Authentication
POST   /api/admin/auth/login        // Admin login
POST   /api/admin/auth/logout       // Admin logout
GET    /api/admin/auth/profile      // Get admin profile
```

### Driver Availability Endpoints
```typescript
GET    /api/availability/:driverId  // Get driver availability
POST   /api/availability            // Set driver availability
PUT    /api/availability/:id        // Update availability
DELETE /api/availability/:id        // Remove availability
GET    /api/availability/calendar/:driverId // Get 2-month calendar view
```

### Admin Management Endpoints
```typescript
GET    /api/admin/users             // List all admins (superadmin only)
POST   /api/admin/users             // Create new admin (superadmin only)
PUT    /api/admin/users/:id         // Update admin (superadmin only)
DELETE /api/admin/users/:id         // Delete admin (superadmin only)
GET    /api/admin/stats             // Admin dashboard statistics
```

## 4. Authentication & Authorization Implementation

### JWT Configuration
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'driver' | 'admin' | 'superadmin';
  isDriver: boolean;
  iat: number;
  exp: number;
}

const JWT_CONFIG = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  algorithm: 'HS256'
};
```

### Role-Based Middleware
```typescript
const requireAuth = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};
```

## 5. Security Implementation

### Password Security
```typescript
import bcrypt from 'bcrypt';

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
```

### Input Validation
```typescript
import Joi from 'joi';

const userRegistrationSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  isDriver: Joi.boolean().default(false)
});
```

### Security Headers
```typescript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 6. Driver Availability Logic

### Availability Management Service
```typescript
class AvailabilityService {
  async setDriverAvailability(driverId: string, dates: string[]): Promise<void> {
    // Remove existing availability
    await db.driverAvailability.deleteMany({
      where: { driverId }
    });
    
    // Insert new availability dates
    const availabilityData = dates.map(date => ({
      driverId,
      availableDate: new Date(date),
      isAvailable: true
    }));
    
    await db.driverAvailability.createMany({
      data: availabilityData
    });
  }
  
  async getDriverAvailability(driverId: string, startDate: Date, endDate: Date) {
    return await db.driverAvailability.findMany({
      where: {
        driverId,
        availableDate: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { availableDate: 'asc' }
    });
  }
}
```

## 7. Error Handling & Logging

### Global Error Handler
```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const globalErrorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
};
```

### Logging Configuration
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});
```

## 8. Performance Optimization

### Caching Strategy
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache driver availability
const cacheDriverAvailability = async (driverId: string, data: any) => {
  await redis.setex(`availability:${driverId}`, 3600, JSON.stringify(data));
};

const getCachedAvailability = async (driverId: string) => {
  const cached = await redis.get(`availability:${driverId}`);
  return cached ? JSON.parse(cached) : null;
};
```

### Database Optimization
```sql
-- Indexes for performance
CREATE INDEX idx_driver_availability_driver_date ON driver_availability(driver_id, available_date);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
```

## 9. Deployment Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/rentwheels
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Server
PORT=3000
NODE_ENV=production

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/uploads
```

### Docker Configuration
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Deployment Script
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: rentwheels
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 10. Testing Strategy

### Unit Tests
```typescript
import { describe, it, expect } from 'jest';
import { AvailabilityService } from '../services/availability';

describe('AvailabilityService', () => {
  it('should set driver availability correctly', async () => {
    const service = new AvailabilityService();
    const driverId = 'test-driver-id';
    const dates = ['2024-02-01', '2024-02-02'];
    
    await service.setDriverAvailability(driverId, dates);
    
    const availability = await service.getDriverAvailability(
      driverId, 
      new Date('2024-02-01'), 
      new Date('2024-02-28')
    );
    
    expect(availability).toHaveLength(2);
  });
});
```

This comprehensive backend specification provides a solid foundation for implementing the driver availability management system with proper security, scalability, and maintainability considerations.