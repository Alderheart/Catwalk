# Development Workflows

## Development Commands

### Frontend Development
```bash
cd frontend
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev          # Start Express server (port 3000)
npm run dev:lambda   # Start with Serverless Offline
npm run build        # Compile TypeScript
```

### Database Management
```bash
cd backend
npm run prisma:studio    # Open Prisma Studio
npm run prisma:migrate   # Run database migrations
```

## Common Development Tasks

### Adding a New Cat Property
1. Update `Cat` interface in `frontend/src/types/Cat.ts`
2. Add database migration in `backend/supabase/migrations/`
3. Update API endpoints in `backend/src/routes/cats.ts`
4. Update UI components to display new property

### Adding a New API Endpoint
1. Add route in appropriate file in `backend/src/routes/`
2. Add service method in `frontend/src/services/`
3. Add store method if needed in `frontend/src/stores/`
4. Update TypeScript types as needed

### Adding a New Game Feature
1. Design data model (database schema)
2. Create API endpoints (backend)
3. Create Zustand store (frontend state)
4. Create React components (UI)
5. Add to navigation/routing

### Protecting Actions with Energy System
1. Import energy middleware: `import { requireEnergy, consumeEnergy, requireAndConsumeEnergy } from '../middleware/energyMiddleware'`
2. Add to route that costs energy: `router.post('/action', authMiddleware, requireAndConsumeEnergy(1), handler)`
3. Alternative two-step approach:
   - Check first: `requireEnergy(1)` 
   - Consume after success: `consumeEnergy(1)`
4. Energy is automatically regenerated when checked via API or utility functions