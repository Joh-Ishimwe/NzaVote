import express from "express";
import { registerUser, verifyOtp, loginUser, castVote, addCandidate, getCandidates, getUsers } from "../controllers/user.controller.js";
import {adminMiddleware, authenticateUser} from "../middleware/authorization.js";

const router = express.Router();

// Existing routes
router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.post("/vote", authenticateUser, castVote);

// Add  candidates
router.post("/add-candidate", addCandidate);

// Getting candidates
router.get("/candidates", getCandidates);

// Getting users
router.get("/users", getUsers);


export default router;
