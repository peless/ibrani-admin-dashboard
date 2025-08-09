# Ibrani Admin Dashboard

Executive dashboard for the Hebrew language assessment platform "Ibrani".

## Overview

This dashboard provides C-suite executives with key metrics and insights from the Hebrew speaking evaluation platform, including:

- Total assessments and daily activity
- Success rates and processing times
- User trends and geographic distribution
- System health and performance metrics

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Database**: Shared Supabase instance with main Ibrani app
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Deployment**: Vercel (separate from main app)

## Environment Variables

Copy `.env.local` from the main Ibrani app or set these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Development

This dashboard shares database access with the main Ibrani assessment app but runs as a completely separate application. This allows for:

- Independent deployment cycles
- Different security configurations
- Separate development teams
- Isolated scaling and performance optimization

## Data Sources

Dashboard queries the same Supabase database as the main app:
- `assessments` table for core metrics
- `assessment_results` for success rates
- `v3_sessions` for user activity trends

## Security

- Uses Supabase service role key for admin-level database access
- Separate authentication system from main app
- Read-only access to assessment data
