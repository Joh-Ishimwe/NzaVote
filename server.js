import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
// import bcrypt from "bcrypt";
// import cors from "cors";
import mongoose from "mongoose";
import configurations from "./config/index.js";
// import router from "./routes/user.routes.js"
import ErrorHandler from "./middleware/ErrorHandler.js"




const app = express();

// app.use(cors());
// app.use(express.json());


// app.use('/api/v1', router);


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


   app.use(ErrorHandler);