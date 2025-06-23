# Technical Implementation Details

## State Management
- **Zustand**: Lightweight state management
- **Memory caching**: 2-minute cache for cat data to reduce loading screens
- **Local storage**: Cat positions persist across sessions
- **Authentication**: JWT tokens in localStorage

## Styling
- **Tailwind CSS**: Utility-first styling
- **Responsive design**: Works on mobile and desktop
- **Safe areas**: Handles mobile notches
- **Custom scrollbars**: Styled for game aesthetics

## Backend Architecture
- **Serverless**: AWS Lambda with Express wrapper
- **Database**: Supabase PostgreSQL with row-level security
- **Authentication**: Supabase Auth with JWT
- **Rate limiting**: Express rate limiter middleware