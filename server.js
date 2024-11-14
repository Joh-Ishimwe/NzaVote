import dotenv from "dotenv";
dotenv.config();

import express from "express";
// import bcrypt from "bcrypt";
import bcrypt from 'bcryptjs';

import cors from "cors";
import mongoose from "mongoose";
import configurations from "./config/index.js";
import router from "./routes/user.routes.js";
import ErrorHandler from "./middleware/ErrorHandler.js";

const app = express();

// CORS configuration
app.use(cors({
    origin: "http://localhost:3000", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.use(express.json());

// API routes
app.use('/api/v1', router);

// MongoDB connection
mongoose
  .connect(configurations.MONGODB_CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(configurations.PORT, () => {
      console.log(`Server is running on port ${configurations.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

// Error handling middleware
app.use(ErrorHandler);
