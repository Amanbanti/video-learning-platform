import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import axios from 'axios';

import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoute.js';
import courseRoutes from './routes/courseRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Set __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
app.use(
  cors({
    origin: [
      'https://video-learning-platform-znaf.vercel.app', // production frontend
      'http://localhost:3000', // local dev
    ],
    credentials: true, // allow cookies
  })
);

// Body parser & cookie parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend', 'build')));
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
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });

    // Cron job: ping your server every 60 minutes
    cron.schedule('0 * * * *', async () => {
      try {
        const url = process.env.PING_URL || `http://localhost:${port}/`;
        await axios.get(url);
        console.log('✅ Pinged server to prevent sleep');
      } catch (err) {
        console.error('❌ Ping failed:', err.message);
      }
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
};

startServer();
