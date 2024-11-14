import jwt from "jsonwebtoken";
import Voter from "../models/user.model.js";

// Middleware to authenticate any user
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await Voter.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = user; // Attach user to the request
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Invalid or expired token. Access denied." });
  }
};

// Middleware to authenticate admin
const adminMiddleware = async (req, res, next) => {
  try {
    await authenticateUser(req, res, async () => {
      if (req.user.role !== "Admin") {
        return res.status(403).json({ message: "Forbidden. Admin access required." });
      }
      next();
    });
  } catch (error) {
    console.error("Admin authorization error:", error);
    res.status(403).json({ message: "Forbidden. Admin access required." });
  }
};

export { authenticateUser, adminMiddleware };
