const express = require('express');
const cors = require('cors');

// Import your route files
const employeeRoutes = require('./routes/employees');
const leaveRoutes = require('./routes/leaves');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Add this line to parse JSON bodies

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Leave System API' });
});

// API Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);

// 404 for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;