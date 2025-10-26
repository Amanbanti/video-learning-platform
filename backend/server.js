import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from "./routes/userRoute.js";
import courseRoutes from "./routes/courseRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Trust proxy for correct protocol detection (Vercel/Proxies)
app.set('trust proxy', 1);

// Allow frontend to talk to backend
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  'http://localhost:3000',
].filter(Boolean);
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Set __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// API Routes
app.use('/api/users', userRoutes);
app.use("/api/courses", courseRoutes);


// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // Correct path: frontend is a sibling of backend; avoid leading slash which makes it absolute
  const buildDir = path.join(__dirname, '..', 'frontend', 'build');
  const indexFile = path.join(buildDir, 'index.html');

  if (fs.existsSync(indexFile)) {
    app.use(express.static(buildDir));

    // Express 5/path-to-regexp v6: use '/*' or '(.*)' instead of '*'
    app.get('/*', (req, res) => {
      res.sendFile(indexFile);
    });
  } else {
    // If the frontend build is not present (e.g., backend-only deploy), keep a simple health route
    app.get('/', (req, res) => {
      res.send('API is running...');
    });
  }
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server only if DB connects
const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
  });
};

startServer();
