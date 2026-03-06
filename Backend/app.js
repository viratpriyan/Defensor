const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorMiddleware');
require('./config/firebase');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/emergency', require('./routes/emergencyRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));
app.use('/api/route', require('./routes/routeRoutes'));

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Women Safety App API is running');
});

// Error Handler Middleware
app.use(errorHandler);

module.exports = app;
