import express from "express";
import { 
  registerUser, 
  verifyOtp, 
  loginUser, 
  castVote, 
  addCandidate, 
  getCandidates, 
  getUsers, 
  updateCandidate, 
  deleteCandidate 
} from "../controllers/user.controller.js";

import { adminMiddleware, authenticateUser } from "../middleware/authorization.js";

const router = express.Router();

// User routes
router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.get("/users", getUsers); 

// Candidate routes
router.post("/candidates", addCandidate); 
router.get("/candidates", getCandidates); 
router.put("/candidates/:candidateID", updateCandidate); 
router.delete("/candidates/:candidateID", deleteCandidate); 

// Voting 
router.post("/vote", authenticateUser, castVote);


export default router;
