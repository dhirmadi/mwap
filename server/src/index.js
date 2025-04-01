require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const env = require('./config/environment');
const setupSecurity = require('./middleware/security');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// Security setup (includes CORS, helmet, rate limiting)
setupSecurity(app);

// Basic middleware
app.use(express.json());

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: env.getEnvironmentName(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', routes);

// Serve static files in production
if (env.isProduction()) {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// Error handling
app.use(errorHandler);

// Database connection
mongoose
  .connect(env.mongodb.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`Connected to MongoDB (${env.getEnvironmentName()})`))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
app.listen(env.port, () => {
  console.log(`Server running on port ${env.port} (${env.getEnvironmentName()})`);
  
  if (env.isDevelopment()) {
    console.log('Configuration:', {
      environment: env.getEnvironmentName(),
      port: env.port,
      mongoDb: 'Connected',
      auth0Domain: env.auth0.domain,
      corsOrigin: env.security.corsOrigin,
    });
  }
});
