const https = require('https');
const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet'); // Helmet helps you secure your Express apps by setting various HTTP headers
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

// Load environment variables from .env file
require('dotenv').config();

// Middleware to set HTTP headers for security
app.use(helmet());

// Middleware to enforce HSTS for a specified duration
// 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
app.use(helmet.hsts({
  maxAge: 31536000,     // 1 year in seconds
  includeSubDomains: true,
  preload: true
}));

// Middleware to allow unsafe scripts to run
// 'Content-Security-Policy': "script-src 'self' 'unsafe-inline'"
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    connectSrc: ["*"],
  }
}));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Use morgan for HTTP request logging
app.use(morgan('combined'));

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Define the hello API route with strict HSTS
app.get('/api/hello', (req, res) => {
  // Set a cookie example
  res.cookie('myCookie', 'someValue', { httpOnly: false, secure: true, sameSite: 'Strict', path: '/' });
  res.status(200).json({ message: 'Hello! How are you doing today? :)' });
});

// Define the without-cross-origin-haders API route
app.get('/api/without-cross-origin-null-headers', async (req, res) => {
  try {
    const apiResponse = { "userId": 1, "id": 1, "name": "Number 1" }
    res.status(200).json(apiResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Define the api-with-cross-origin-headers API route
app.get('/api/with-cross-origin-null-headers', async (req, res) => {
  try {
    const apiResponse = { "userId": 1, "id": 1, "name": "Number 1" }
    res.setHeader('Access-Control-Allow-Origin', 'null');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(200).json(apiResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serving the index.html
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath);
});

// Start server
app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}/`);
});
