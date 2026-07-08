import 'dotenv/config';

// Disable TLS verification for local dev environments to avoid cert issues
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Configure allowed origins (supports comma-separated list of URLs)
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

// Enable CORS so multiple frontend domains can communicate with the backend
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Server health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Register AdminZero semantic gateway API routes
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  AdminZero Semantic Gateway Running     `);
  console.log(`  Port: ${PORT}                          `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'} `);
  console.log(`=========================================`);
});
