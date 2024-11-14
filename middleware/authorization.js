import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import Voter from "../models/user.model.js";

// Middleware for Admin Authorization
const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    // Check for token presence and format
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized. Token missing or invalid format." });
    }

    // Extract the token value
    const accessToken = token.split(" ")[1];

    // Verify the token
    jwt.verify(accessToken, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized. Invalid or expired token." });
      }

      const userId = decoded.userId;

      try {
        // Find the user in the database
        const user = await userModel.findOne({ _id: userId });
        if (!user) {
          return res.status(401).json({ message: "Unauthorized. User not found." });
        }

        // Check if the user has the Admin role
        if (user.role === "Admin") {
          req.user = user; // Attach the user object to the request
          return next(); // Proceed to the next middleware
        } else {
          return res.status(403).json({ message: "Forbidden. Admin access required." });
        }
      } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: "Internal server error." });
      }
    });
  } catch (error) {
    console.error("Middleware error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided. Access denied." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await Voter.findById(decoded.userId);

    if (!req.user) {
      return res.status(404).json({ message: "User not found." });
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Invalid token. Access denied." });
  }
};

export {adminMiddleware, authenticateUser}
