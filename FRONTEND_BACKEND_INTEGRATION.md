# Frontend-Backend Integration

This document describes how the React frontend integrates with the Node.js backend API.

## Backend API Endpoints

The frontend has been updated to use the following backend API endpoints:

### Authentication Routes
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout 
- `POST /api/auth/refresh` - Refresh authentication token

### User Routes
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/statistics` - Get user hiking statistics
- `PUT /api/user/preferences` - Update user preferences

### Trip Routes
- `GET /api/trips` - Get all trips for authenticated user
- `POST /api/trips` - Create new trip
- `GET /api/trips/:id` - Get trip by ID
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Trail Routes
- `GET /api/trails/search` - Search trails with filters
- `GET /api/trails/recommendations` - Get trail recommendations
- `GET /api/trails/:id` - Get trail by ID

## Key Integration Features

### 1. API Client Configuration
- Base URL: `/api` (proxied to backend in development)
- Automatic authentication header injection
- Token refresh handling on 401 responses
- Error handling for network issues

### 2. State Management
- **TanStack Query** for server state management
- **Zustand** for client state
- Automatic caching and revalidation
- Optimistic updates for better UX

### 3. Fallback Handling
All API services include fallback mock data to ensure the app works even when:
- Backend is not running
- Network connectivity issues
- API endpoints return errors

### 4. Type Safety
- Shared TypeScript interfaces between frontend and backend
- Proper API response typing
- Type-safe service methods

## Running the Full Stack

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev  # Runs on http://localhost:3001
```

### 2. Start the Frontend
```bash
cd frontend  
npm install
npm run dev  # Runs on http://localhost:3000
```

The frontend will automatically proxy API requests to the backend via Vite's proxy configuration.

## Development vs Production

### Development
- Frontend runs on port 3000
- Backend runs on port 3001
- Vite proxy handles API routing
- Hot reload for both frontend and backend

### Production
- Frontend builds to static files
- Backend serves as API server
- Frontend can be served from CDN or static hosting
- API calls go directly to backend URL

## Error Handling

The integration includes comprehensive error handling:

1. **Network Errors**: Graceful fallback to mock data
2. **Authentication Errors**: Automatic token refresh, redirect to login
3. **Server Errors**: User-friendly error messages
4. **Loading States**: Proper loading indicators

## Features Using Backend Integration

1. **Dashboard**: Real user statistics and trip data
2. **Trails Page**: Live trail search and recommendations  
3. **Trip Planning**: Actual trip creation and management
4. **User Profile**: Real profile data and preferences
5. **Authentication**: Proper login/logout flow

The frontend is fully functional with or without the backend, ensuring a smooth development experience.