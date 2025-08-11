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

## Design Guidelines

Follow Apple's design principles for a clean, intuitive executive dashboard:

### Visual Hierarchy
- **Clear typography hierarchy** - Use consistent font weights and sizes
- **Generous white space** - Don't overcrowd elements, let content breathe
- **Subtle shadows and borders** - Use soft shadows (shadow-sm) and light borders for depth

### Color Palette
- **Minimal color usage** - Primarily grays with accent colors for status
- **Semantic colors** - Red for errors/failures, green for success, blue for information
- **High contrast** - Ensure text is easily readable (gray-900 on white backgrounds)

### Layout & Components
- **Grid-based layouts** - Use consistent spacing and alignment
- **Card-based design** - Group related information in clean white cards
- **Consistent iconography** - Use Lucide React icons consistently sized (typically 24px)
- **Rounded corners** - Use subtle border radius (rounded-lg) for modern feel

### Interaction Design
- **Subtle hover states** - Minimal but clear interactive feedback
- **Loading states** - Handle async data gracefully
- **Error states** - Clear, actionable error messages

### Content Strategy
- **Scannable metrics** - Large, prominent numbers with clear labels
- **Progressive disclosure** - Show essential info first, details on demand
- **Consistent terminology** - Use same language throughout the dashboard

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run lint` - Run ESLint checks

## Environment Variables

Required for database access:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`