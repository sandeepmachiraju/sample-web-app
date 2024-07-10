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
app.use(helmet.hsts({
  maxAge: 31536000,     // 1 year in seconds
  includeSubDomains: true,
  preload: true
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
  res.cookie('myCookie', 'someValue', { httpOnly: true, secure: true });
  res.status(200).json({ message: 'Hello Node!' });
});

// Define the todos API route
app.get('/api/todos', async (req, res) => {
  try {
    const apiResponse = { "userId": 1, "id": 1, "title": "foobar" }
    res.status(200).json(apiResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inject environment variable into HTML and serve it
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  // Add HTTP Strict Transport Security (HSTS) header
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', 'script-src \'self\' \'unsafe-inline\'');
  
  fs.readFile(indexPath, 'utf8', (err, html) => {
    if (err) {
      res.status(500).send('Error reading index.html');
      return;
    }
    // Replace the placeholder with the actual API hostname
    const modifiedHtml = html.replace('__API_HOSTNAME__', process.env.API_HOSTNAME);
    console.log('Modified index.html content:');
    console.log(modifiedHtml);
    res.send(modifiedHtml);
  });
});

// Start server
app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}/`);
});
