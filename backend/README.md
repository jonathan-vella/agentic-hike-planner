# Agentic Hike Planner - Backend API

This is the backend API for the Agentic Hike Planner application, built with Node.js, Express.js, and TypeScript.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your Azure service configurations

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run tests
npm test
```

## 📁 Project Structure

```
src/
├── config/          # Configuration management
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # API route definitions
├── services/        # Business logic (future)
├── models/          # Data models (future)
└── server.ts        # Application entry point
```

## 🔧 API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /api/health` - Detailed health check
- `GET /api/health/version` - API version information

### Authentication (Placeholder)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

### Trips
- `GET /api/trips` - List user trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/:id` - Get specific trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Trails
- `GET /api/trails/search` - Search trails
- `GET /api/trails/recommendations` - Get trail recommendations
- `GET /api/trails/:id` - Get trail details

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/statistics` - Get user statistics
- `PUT /api/user/preferences` - Update user preferences

## 🔒 Authentication

Currently uses mock authentication. To access protected endpoints:

1. Login to get a token:
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}'
   ```

2. Use the token in subsequent requests:
   ```bash
   curl -H "Authorization: Bearer mock-valid-token" \
     http://localhost:3001/api/trips
   ```

## 🧪 Example Usage

### Search Trails
```bash
curl "http://localhost:3001/api/trails/search?difficulty=moderate&limit=5"
```

### Create a Trip
```bash
curl -X POST -H "Authorization: Bearer mock-valid-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekend Hike",
    "startDate": "2025-08-01T08:00:00Z",
    "endDate": "2025-08-01T16:00:00Z",
    "difficulty": "moderate",
    "location": {
      "name": "Mount Washington, NH",
      "latitude": 44.2706,
      "longitude": -71.3033
    }
  }' \
  http://localhost:3001/api/trips
```

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 3001) | No |
| `CORS_ORIGIN` | CORS origin (default: http://localhost:3000) | No |
| `AZURE_COSMOS_DB_ENDPOINT` | Azure Cosmos DB endpoint | Production |
| `AZURE_COSMOS_DB_KEY` | Azure Cosmos DB key | Production |
| `AZURE_AD_B2C_TENANT_ID` | Azure AD B2C tenant ID | Production |
| `AZURE_AD_B2C_CLIENT_ID` | Azure AD B2C client ID | Production |

## 🏗️ Architecture

The backend follows a layered architecture:

- **Controllers**: Handle HTTP requests and responses
- **Middleware**: Process requests (auth, validation, logging, error handling)
- **Routes**: Define API endpoints and route handlers
- **Config**: Manage environment configuration

## 🔍 Logging

The application uses structured logging with correlation IDs for request tracing. All requests are logged with:

- Request method and URL
- Response status and timing
- Correlation ID for request tracking
- Error details for failed requests

## ⚠️ Current Limitations

This is a foundational implementation with the following limitations:

- **Mock Authentication**: Uses placeholder authentication instead of Azure AD B2C
- **In-Memory Storage**: Data is stored in memory instead of Azure Cosmos DB
- **Mock AI Integration**: Trail recommendations use simple logic instead of Azure AI Foundry
- **No Persistence**: Data is lost when server restarts

These will be addressed in future iterations as the corresponding Azure services are integrated.