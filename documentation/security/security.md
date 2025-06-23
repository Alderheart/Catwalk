# Security

## Authentication
- JWT-based authentication via Supabase
- Required for all cat operations
- User-scoped data (users only see their own cats)
- Middleware validation on all protected routes

## Security Protections
- JWT authentication on all API endpoints
- User-scoped data (row-level security)
- CORS configuration
- Rate limiting
- Input validation
- Helmet security headers

## Client-Side Security
- Cache is memory-only (not persisted)
- No sensitive data in localStorage except JWT
- Backend validates all operations regardless of frontend state