# MWAP (Modular Web Application Platform)

A microservices-based web application platform that leverages MongoDB for data storage and Docker for containerization.

## Project Overview
MWAP is designed as a modular platform where different microservices work together to create a comprehensive web application solution. The platform emphasizes security, scalability, and maintainability.

## Current Features
- MongoDB integration with connection pooling and client-side encryption support
- RESTful API endpoints for CRUD operations
- Docker containerization
- Secure environment variable management
- Winston-based logging system

## Technology Stack
- **Backend**: Node.js with Express
- **Database**: MongoDB (Atlas)
- **Container**: Docker
- **Deployment**: Heroku
- **Security**: Helmet middleware, environment-based configuration
- **Logging**: Winston

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Docker
- MongoDB Atlas account
- Heroku account

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/dhirmadi/mwap.git
   cd mwap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file based on .env.example:
   ```bash
   cp .env.example .env
   ```
   Update the environment variables with your MongoDB connection string.

4. Start the application:
   ```bash
   npm start
   ```

### Deployment Options

#### Heroku Deployment (Recommended)
The application is configured for automatic deployment to Heroku. Every push to the SimpleDeploy branch automatically triggers a new deployment.

See [Simple Deployment Guide](docs/simple-deploy.md) for setup instructions.

#### Local Docker Deployment
1. Build the Docker image:
   ```bash
   docker build -t mwap .
   ```

2. Run the container:
   ```bash
   docker run -p 3100:3100 --env-file .env mwap
   ```

## Project Structure
```
mwap/
├── src/
│   ├── config/       # Configuration files
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   ├── utils/        # Utility functions
│   └── app.js        # Application entry point
├── Dockerfile        # Docker configuration
├── .env.example      # Example environment variables
└── package.json      # Project dependencies
```

## API Documentation
The service exposes RESTful endpoints for basic CRUD operations:

- GET /items - Retrieve all items
- GET /items/:id - Retrieve a specific item
- POST /items - Create a new item
- PUT /items/:id - Update an existing item
- DELETE /items/:id - Delete an item

## Security
- Environment-based configuration
- Helmet middleware for HTTP security headers
- MongoDB client-side encryption support
- Secure connection pooling

## Contributing
1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## License
ISC License
