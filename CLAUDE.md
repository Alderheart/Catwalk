# Cat Colony - Project Documentation

> A web-based cat colony simulation game built with React, TypeScript, and AWS Lambda

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     Frontend    │    │     Backend      │    │    Database     │
│   React + TS    │◄──►│  Express + AWS   │◄──►│    Supabase     │
│   Zustand       │    │    Lambda        │    │   PostgreSQL    │
│   Tailwind      │    │   Serverless     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘

Frontend Port: 5173 (Vite)
Backend Port: 3000 (Local dev)
```

## 🎮 Core Game Concepts

### **Cats**
- Primary game entities with unique traits, ages, and appearances
- Each cat has: name, gender, age (moons), skill, trait, breed
- Cats belong to authenticated users (user_id)
- Sprites are generated based on cat properties

### **Camp**
- 2D environment where cats live and interact
- Cats have draggable positions (x%, y% coordinates)
- Responsive sprite sizing based on screen size
- Click interactions open popovers/modals

### **Authentication**
- JWT-based authentication via Supabase
- Required for all cat operations
- User-scoped data (users only see their own cats)

## 📁 Project Structure

```
/frontend/                  # React application
├── src/
│   ├── components/        # React components
│   │   ├── Camp.tsx      # Main game view (2D cat environment)
│   │   ├── CatsList.tsx  # List view of all cats
│   │   ├── CatModal.tsx  # Cat detail modal
│   │   ├── CampCat.tsx   # Individual cat in camp
│   │   ├── AdminPanel.tsx # Cat creation/management
│   │   └── Auth*.tsx     # Authentication forms
│   ├── stores/           # Zustand state management
│   │   ├── catsStore.ts  # Cat data + CRUD operations
│   │   ├── authStore.ts  # Authentication state
│   │   └── catPositionsStore.ts # Cat positions in camp
│   ├── services/         # API communication
│   ├── types/           # TypeScript definitions
│   └── utils/           # Helper functions
│
/backend/                  # Express + Lambda backend
├── src/
│   ├── routes/          # API endpoints
│   │   ├── cats.ts     # Cat CRUD operations
│   │   └── auth.ts     # Authentication endpoints
│   ├── lambda/         # AWS Lambda handler
│   ├── middleware/     # Auth middleware
│   └── lib/           # Database connections
```

## 🔄 Data Flow

### **Cat Operations**
```
1. User Action (create/edit cat)
   ↓
2. Component calls catsStore method
   ↓
3. Store calls API service
   ↓
4. Backend validates auth + processes request
   ↓
5. Supabase database operation
   ↓
6. Response updates store state
   ↓
7. Components re-render with new data
```

### **Authentication Flow**
```
1. User submits login form
   ↓
2. AuthStore calls authService
   ↓
3. Backend validates with Supabase Auth
   ↓
4. JWT token stored in localStorage
   ↓
5. Token included in all API requests
   ↓
6. Backend middleware validates token
```

### **Camp Positioning**
```
1. User drags cat in camp
   ↓
2. useCatPlacement hook updates position
   ↓
3. catPositionsStore caches position locally
   ↓
4. Position persisted to localStorage
   ↓
5. Positions restored on page refresh
```

## 🗃️ Key Files & Their Purpose

### **Frontend Core**
- **`App.tsx`**: Main app component, handles auth routing
- **`stores/catsStore.ts`**: Central cat data management with caching
- **`stores/authStore.ts`**: Authentication state and JWT handling
- **`components/Camp.tsx`**: Primary game interface (2D cat view)
- **`components/CatsList.tsx`**: Alternative list view of cats
- **`hooks/useCatPlacement.ts`**: Cat positioning logic for camp

### **Backend Core**
- **`src/app.ts`**: Express app configuration
- **`src/lambda/handler.ts`**: AWS Lambda wrapper with logging
- **`src/routes/cats.ts`**: Cat API endpoints (GET, POST, PUT, DELETE)
- **`src/routes/auth.ts`**: Authentication endpoints
- **`src/middleware/auth.ts`**: JWT validation middleware

### **Configuration**
- **`serverless.yml`**: AWS Lambda deployment configuration
- **`supabase/migrations/`**: Database schema migrations
- **`frontend/vite.config.ts`**: Frontend build configuration

## 🛠️ Development Commands

### **Frontend Development**
```bash
cd frontend
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

### **Backend Development**
```bash
cd backend
npm run dev          # Start Express server (port 3000)
npm run dev:lambda   # Start with Serverless Offline
npm run build        # Compile TypeScript
```

### **Database Management**
```bash
cd backend
npm run prisma:studio    # Open Prisma Studio
npm run prisma:migrate   # Run database migrations
```

## 🚀 Deployment

### **Local Development**
- Frontend: `npm run dev` (Vite development server)
- Backend: `npm run dev` (Express with nodemon)
- Database: Supabase (cloud-hosted)

### **Production (when ready)**
```bash
# Backend to AWS Lambda
cd backend
npm run deploy           # Deploy to AWS

# Frontend (TBD)
cd frontend
npm run build           # Build static files
# Deploy to Vercel/Netlify/S3
```

## 🔧 Technical Implementation Details

### **State Management**
- **Zustand**: Lightweight state management
- **Memory caching**: 2-minute cache for cat data to reduce loading screens
- **Local storage**: Cat positions persist across sessions
- **Authentication**: JWT tokens in localStorage

### **Styling**
- **Tailwind CSS**: Utility-first styling
- **Responsive design**: Works on mobile and desktop
- **Safe areas**: Handles mobile notches
- **Custom scrollbars**: Styled for game aesthetics

### **Backend Architecture**
- **Serverless**: AWS Lambda with Express wrapper
- **Database**: Supabase PostgreSQL with row-level security
- **Authentication**: Supabase Auth with JWT
- **Rate limiting**: Express rate limiter middleware

## 🎯 Common Development Tasks

### **Adding a New Cat Property**
1. Update `Cat` interface in `frontend/src/types/Cat.ts`
2. Add database migration in `backend/supabase/migrations/`
3. Update API endpoints in `backend/src/routes/cats.ts`
4. Update UI components to display new property

### **Adding a New API Endpoint**
1. Add route in appropriate file in `backend/src/routes/`
2. Add service method in `frontend/src/services/`
3. Add store method if needed in `frontend/src/stores/`
4. Update TypeScript types as needed

### **Adding a New Game Feature**
1. Design data model (database schema)
2. Create API endpoints (backend)
3. Create Zustand store (frontend state)
4. Create React components (UI)
5. Add to navigation/routing

## 🐛 Debugging Tips

### **API Issues**
- Check browser network tab for failed requests
- Verify JWT token in localStorage
- Check backend logs: `npm run logs` (when deployed)

### **State Issues**
- Use React DevTools + Zustand DevTools
- Check store state in browser console: `useCatsStore.getState()`

### **Authentication Issues**
- Clear localStorage and re-login
- Check token expiry in JWT debugger
- Verify Supabase environment variables

## 🔒 Security Considerations

### **Current Protections**
- JWT authentication on all API endpoints
- User-scoped data (row-level security)
- CORS configuration
- Rate limiting
- Input validation
- Helmet security headers

### **Client-Side Security**
- Cache is memory-only (not persisted)
- No sensitive data in localStorage except JWT
- Backend validates all operations regardless of frontend state

## 📊 Performance Optimizations

### **Implemented**
- Cat data caching (2-minute expiry)
- Sprite preloading
- Responsive image sizing
- Compression middleware
- Lambda cold start optimization

### **Future Considerations**
- Image optimization (WebP conversion)
- CDN for static assets
- Database connection pooling
- Client-side route caching

---

## 🎮 Game Design Goals

This project aims to recreate the beloved Clangen experience as a modern web application:
- **Accessible**: Playable on any device with a browser
- **Social**: Multiple users can have their own colonies
- **Extensible**: Built to support complex game mechanics
- **Performant**: Fast loading and smooth interactions

Last Updated: 6/20/2025