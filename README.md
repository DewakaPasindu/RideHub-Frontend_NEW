# RentWheels - Vehicle & Driver Rental Platform

A comprehensive web application for managing vehicle rentals, driver bookings, and availability scheduling with role-based access control and real-time updates.

## Overview

RentWheels is a full-stack rental management system that allows users to book vehicles and drivers, manage availability calendars, process payments, and handle approvals through an admin dashboard. The platform supports multiple user roles (users, drivers, admins, super admins) with specific permissions and features for each.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling
- **React Router DOM** for navigation
- **Lucide React** for icons
- **Vitest** for unit and integration testing

### Backend & Database
- **Supabase** for backend infrastructure
  - PostgreSQL database
  - Authentication & authorization
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Edge Functions (serverless)

### Additional Tools
- **Axios** for HTTP requests
- **Docker** for containerization
- **GitHub Actions** for CI/CD

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase Account** (free tier available at [supabase.com](https://supabase.com))

Optional:
- **Docker** and **Docker Compose** for containerized development

## Project Structure

```
rentwheels/
├── src/                          # Frontend source code
│   ├── components/               # Reusable React components
│   │   ├── admin/               # Admin-specific components
│   │   ├── auth/                # Authentication components
│   │   ├── booking/             # Booking-related components
│   │   ├── common/              # Shared components
│   │   ├── drivers/             # Driver components
│   │   ├── layout/              # Layout components
│   │   ├── reviews/             # Review components
│   │   └── vehicles/            # Vehicle components
│   ├── pages/                   # Page-level components
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── auth/               # Authentication pages
│   │   ├── booking/            # Booking pages
│   │   ├── drivers/            # Driver pages
│   │   └── vehicles/           # Vehicle pages
│   ├── contexts/                # React Context providers
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API service layer
│   ├── utils/                   # Utility functions
│   ├── types/                   # TypeScript type definitions
│   └── config/                  # Configuration files
├── backend/                      # Backend service (Node.js/Express)
│   ├── src/
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic services
│   │   ├── middleware/         # Express middleware
│   │   └── utils/              # Backend utilities
│   ├── tests/                  # Backend tests
│   └── prisma/                 # Prisma schema (legacy)
├── supabase/                    # Supabase configuration
│   └── migrations/             # Database migration files
├── public/                      # Static assets
└── dist/                       # Production build output
```

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd rentwheels
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Supabase Setup

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in or create an account
2. Click "New Project"
3. Fill in project details:
   - **Name**: RentWheels (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for provisioning

#### Get Your API Keys

1. In your Supabase project dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (safe to use in frontend)

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Database Setup

#### Run Migrations

The project includes pre-configured database migrations. Apply them to your Supabase database:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run each migration file from `supabase/migrations/` in order:
   - `20250922111608_hidden_hat.sql`
   - `20250924050432_dawn_peak.sql`
   - `20250924050440_tiny_sunset.sql`
   - `20250924050448_soft_palace.sql`
   - `20250924050455_nameless_night.sql`

Alternatively, if you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

#### Database Schema Overview

The migrations create the following tables:

- **users** - User accounts with role-based access
- **profiles** - Extended user profile information
- **drivers** - Driver-specific information and documentation
- **vehicles** - Vehicle listings with specifications
- **bookings** - Booking records for vehicles and drivers
- **availability** - Driver availability schedules
- **reviews** - User reviews and ratings
- **admin_actions** - Audit log for admin activities

All tables include Row Level Security (RLS) policies for secure data access.

### Step 6: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Authentication Setup

The application uses Supabase Authentication with email/password sign-in.

### Configure Auth Settings

1. In Supabase dashboard, go to **Authentication > Providers**
2. Enable **Email** provider
3. Configure **Email Templates** (optional):
   - Confirmation email
   - Password reset email
   - Magic link email

### Disable Email Confirmation (Development)

For faster development, you can disable email confirmation:

1. Go to **Authentication > Settings**
2. Under **User Signups**, toggle off **Enable email confirmations**

**Note**: Re-enable this in production for security.

### Default User Roles

- **user** - Regular customers who can book vehicles/drivers
- **driver** - Users who can be booked and manage availability
- **admin** - Administrators who can approve bookings and manage content
- **superadmin** - Full system access with user management capabilities

## Database Configuration

### Understanding Supabase Database

Supabase uses PostgreSQL with the following key features:

- **Row Level Security (RLS)**: Automatically enforces data access policies
- **Real-time subscriptions**: Live updates when data changes
- **Automatic API generation**: RESTful API and GraphQL endpoint
- **Built-in auth integration**: Seamless user authentication

### Viewing Your Database

1. In Supabase dashboard, go to **Database > Tables**
2. Browse tables, view data, and run queries
3. Use **SQL Editor** for custom queries

### Modifying the Schema

To add new tables or modify existing ones:

1. Write migration SQL in `supabase/migrations/`
2. Use descriptive filenames: `YYYYMMDDHHMMSS_description.sql`
3. Include detailed comments explaining changes
4. Always create RLS policies for new tables

Example migration template:

```sql
/*
  # Add new feature

  1. New Tables
    - `table_name`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `table_name`
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS table_name (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

## API Development

### Using Supabase Client

The application uses `@supabase/supabase-js` client library:

```typescript
import { supabase } from './config/supabase';

// Query data
const { data, error } = await supabase
  .from('vehicles')
  .select('*')
  .eq('available', true);

// Insert data
const { data, error } = await supabase
  .from('bookings')
  .insert({ vehicle_id, user_id, start_date, end_date });

// Update data
const { data, error } = await supabase
  .from('bookings')
  .update({ status: 'confirmed' })
  .eq('id', bookingId);

// Delete data
const { data, error } = await supabase
  .from('bookings')
  .delete()
  .eq('id', bookingId);
```

### Creating API Services

API services are located in `src/services/`:

```typescript
// src/services/vehicleService.ts
import { supabase } from '../config/supabase';

export class VehicleService {
  static async getAvailableVehicles() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'approved')
      .eq('available', true);

    if (error) throw error;
    return data;
  }
}
```

### Real-time Subscriptions

Subscribe to database changes:

```typescript
const subscription = supabase
  .channel('bookings')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'bookings' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

### Edge Functions

Supabase Edge Functions run on Deno and are deployed using the Supabase CLI:

```bash
# Create a new function
supabase functions new my-function

# Deploy function
supabase functions deploy my-function
```

Example edge function:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { name } = await req.json();

  return new Response(
    JSON.stringify({ message: `Hello ${name}!` }),
    { headers: { "Content-Type": "application/json" } }
  );
});
```

## Testing

### Frontend Tests

Run unit and integration tests using Vitest:

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage report
npm run test:coverage

# Watch mode (auto-rerun on changes)
npm run test:watch
```

### Writing Tests

Example component test:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VehicleCard } from './VehicleCard';

describe('VehicleCard', () => {
  it('renders vehicle information', () => {
    const vehicle = {
      id: '1',
      name: 'Tesla Model 3',
      price: 50
    };

    render(<VehicleCard vehicle={vehicle} />);
    expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
  });
});
```

### Backend Tests

If using the Node.js backend:

```bash
cd backend
npm run test
```

## Building for Production

### Frontend Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Build Output

The build process:
1. Compiles TypeScript to JavaScript
2. Bundles and minifies code
3. Optimizes assets
4. Generates source maps
5. Creates `dist/` directory with:
   - `index.html` - Entry point
   - `assets/` - JavaScript, CSS, and static files

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard

### Deploy to Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

3. Configure environment variables in Netlify dashboard

### Deploy with Docker

Build and run using Docker:

```bash
# Build image
docker build -t rentwheels-frontend -f Dockerfile.frontend .

# Run container
docker run -p 80:80 rentwheels-frontend
```

Or use Docker Compose:

```bash
docker-compose up -d
```

### Environment Variables for Production

Ensure the following variables are set in your production environment:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

**Important**: Never commit your `.env` file. Always use your hosting platform's environment variable management.

## Security Best Practices

### Row Level Security (RLS)

All Supabase tables should have RLS enabled:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

Create restrictive policies:

```sql
-- Users can only read their own bookings
CREATE POLICY "Users read own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only create their own bookings
CREATE POLICY "Users create own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

### API Security

- Always use the `anon` key in frontend (not service role key)
- Validate all user inputs
- Use parameterized queries (Supabase handles this automatically)
- Implement rate limiting for sensitive operations
- Enable HTTPS in production

### Authentication Security

- Use strong password requirements
- Enable email verification in production
- Implement password reset flows
- Use refresh tokens for session management
- Set appropriate JWT expiration times

## Project Maintenance

### Database Migrations

When making schema changes:

1. Create a new migration file in `supabase/migrations/`
2. Test locally first
3. Document all changes in migration comments
4. Apply to production carefully
5. Keep migrations idempotent (use `IF NOT EXISTS`)

### Monitoring

Monitor your application using Supabase dashboard:

- **Database**: Query performance, table sizes
- **Auth**: User signups, login activity
- **Storage**: File uploads and bandwidth
- **Edge Functions**: Invocation logs and errors

### Backups

Supabase automatically backs up your database. To manually backup:

1. Go to **Database > Backups**
2. Download backup or schedule automatic backups
3. For critical data, implement additional backup strategies

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

**Supabase connection errors:**
- Verify environment variables are set correctly
- Check Supabase project is active (not paused)
- Ensure API keys are valid

**RLS policy errors:**
- Check policies are correctly configured
- Verify user authentication state
- Test policies in SQL editor

**CORS errors:**
- Add your domain to allowed origins in Supabase dashboard
- Check API endpoint URLs are correct

### Debug Mode

Enable debug logging:

```typescript
// Add to src/config/supabase.ts
export const supabase = createClient(url, key, {
  auth: {
    debug: true
  }
});
```

### Getting Help

- Check [Supabase Documentation](https://supabase.com/docs)
- Visit [Supabase Discord](https://discord.supabase.com)
- Review existing issues in repository
- Open a new issue with reproduction steps

## Further Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Tutorials
- [Supabase React Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Community
- [Supabase GitHub](https://github.com/supabase/supabase)
- [React Community](https://react.dev/community)
- [TypeScript Community](https://www.typescriptlang.org/community)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@rentwheels.com
- Create an issue in the repository
- Check existing documentation and FAQs
#   R i d e H u b - F r o n t e n d _ N E W  
 