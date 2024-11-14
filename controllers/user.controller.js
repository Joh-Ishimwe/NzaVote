import Voter from "../models/user.model.js";
import Candidate from "../models/candidate.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import otpGenerator from "../utils/otp.js";
import sendEmail from "../utils/sendEmail.js";

/**
 * Register a new user
 */
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, voterID } = req.body;

    // Check if email or voterID already exists
    const existingUser = await Voter.findOne({ $or: [{ email }, { voterID }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or Voter ID already exists." });
    }

    // Generate OTP for the user
    const otp = otpGenerator();

    // Send OTP to user's email
    try {
      await sendEmail(email, "Your OTP Code for NzaVote Registration", `Your OTP code is: ${otp}`);
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
      return res.status(500).json({ message: "Failed to send OTP. Please try again later." });
    }

    // Hash password before saving the user to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Voter({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      dateOfBirth,
      voterID,
      otp,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: "Registration successful! Please check your email for OTP verification." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Verify OTP for a user
 */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await Voter.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    user.isVerified = true;
    user.otp = undefined; // Clear the OTP
    await user.save();

    res.status(200).json({ message: "OTP verified successfully! Your account is now active." });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Login a user
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Log incoming request for debugging
    console.log("Request body:", req.body);

    // Ensure email is lowercase
    const user = await Voter.findOne({ email: email.toLowerCase() });

    // Log fetched user
    console.log("Fetched user:", user);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Log password validation
    console.log("Is password valid:", isPasswordValid);

    // if (!isPasswordValid) {
    //   return res.status(401).json({ message: "Invalid email or password." });
    // }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


/**
 * Add a new candidate
 */
const addCandidate = async (req, res) => {
  try {
    const { name, party, description } = req.body;

    if (!name || !party || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newCandidate = new Candidate({
      name,
      party,
      description,
    });

    await newCandidate.save();

    res.status(201).json({ message: "Candidate added successfully!", candidate: newCandidate });
  } catch (error) {
    console.error("Error adding candidate:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Get all candidates
 */
const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    if (candidates.length === 0) {
      return res.status(404).json({ message: "No candidates found." });
    }

    res.status(200).json({ candidates });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Get all users
 */
const getUsers = async (req, res) => {
  try {
    const users = await Voter.find();
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const castVote = async (req, res) => {
  try {
    const { candidateID } = req.body;

    // Ensure the user is verified and hasn't already voted
    if (!req.user.isVerified) {
      return res.status(403).json({ message: "You must complete OTP verification before voting." });
    }

    if (req.user.hasVoted) {
      return res.status(403).json({ message: "You have already cast your vote." });
    }

    // Mark the user as having voted
    req.user.hasVoted = true;
    await req.user.save();

    // Update candidate votes
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    candidate.votes += 1;
    await candidate.save();

    res.status(200).json({ message: `Vote recorded successfully for candidate ${candidate.name}!` });
  } catch (error) {
    console.error("Error during vote:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


/**
 * Update a candidate
 */
const updateCandidate = async (req, res) => {
  try {
    const { candidateID } = req.params;
    const { name, party, description } = req.body;

    // Find and update the candidate
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateID,
      { name, party, description },
      { new: true, runValidators: true }
    );

    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    res.status(200).json({ message: "Candidate updated successfully!", candidate: updatedCandidate });
  } catch (error) {
    console.error("Error updating candidate:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Delete a candidate
 */
const deleteCandidate = async (req, res) => {
  try {
    const { candidateID } = req.params;

    const deletedCandidate = await Candidate.findByIdAndDelete(candidateID);

    if (!deletedCandidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    res.status(200).json({ message: "Candidate deleted successfully!" });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { registerUser, verifyOtp, loginUser, castVote, addCandidate, getCandidates, getUsers, updateCandidate, deleteCandidate };
