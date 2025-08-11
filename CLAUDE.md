# Ibrani Admin Dashboard - Development Guidelines

## Dashboard Data Philosophy

This dashboard should display **accurate, unfiltered data** - not sanitized metrics designed to make executives feel good. The purpose is to provide real insights into system performance and identify actual problems.

### Key Principles:
- Show real averages, including outliers that indicate system issues
- Display processing times in human-readable format (hours/minutes/seconds)
- Include failed/stuck assessments in metrics to highlight performance problems
- Provide context with both average and median values where relevant

## Data Time Range

**All dashboard metrics should be calculated from last Saturday morning onwards** - this provides a rolling weekly view that resets each week and excludes historical data that may not be relevant to current system performance.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run lint` - Run ESLint checks

## Environment Variables

Required for database access:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`