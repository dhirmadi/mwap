# NWAP Mini Project

A full-stack web application built with React, Node.js, Express, MongoDB, and Auth0.

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Auth0 account

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your Auth0 credentials:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

### Backend

```
server/
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # Express routes
│   ├── services/     # Business logic
│   └── index.js      # Entry point
```

### Frontend

```
client/
├── src/
│   ├── auth/         # Auth0 configuration
│   ├── components/   # React components
│   ├── hooks/        # Custom hooks
│   ├── services/     # API services
│   ├── utils/        # Utility functions
│   └── App.tsx       # Main component
```

## Authentication

This project uses Auth0 for authentication. To set it up:

1. Create an Auth0 account and application
2. Configure the application settings in Auth0 dashboard
3. Update the `.env` files with your Auth0 credentials

## API Endpoints

### Protected Routes

- GET /api/tasks - Get all tasks for the authenticated user
- POST /api/tasks - Create a new task
- PATCH /api/tasks/:id - Update a task
- DELETE /api/tasks/:id - Delete a task
- GET /api/users/me - Get current user profile
- POST /api/users/me - Update current user profile

## Development

- Backend runs on http://localhost:3000
- Frontend runs on http://localhost:5173
- API endpoints are prefixed with /api

## Security

- All API routes are protected with Auth0 JWT validation
- MongoDB connection uses secure URI with credentials
- Environment variables are used for sensitive data
- CORS is configured for security
