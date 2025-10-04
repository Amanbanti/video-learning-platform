import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from "./routes/userRoute.js";
import courseRoutes from "./routes/courseRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Allow frontend to talk to backend
app.use(cors({
  origin: ['http://localhost:3000'], // Local dev frontend
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
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
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
