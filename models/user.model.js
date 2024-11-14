import mongoose from "mongoose";
import bcrypt from "bcrypt";


// Voter Schema
const voterSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    dateOfBirth: {
      type: Date,
      required: true, 
    },
    voterID: {
      type: String,
      unique: true, 
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false, 
    },
    hasVoted: {
        type: Boolean,
        default: false, 
      },
    otp: {
        type: String
    },
    role: {
      type: String,
      enum: ["Voter", "Admin"], 
      default: "Voter",
    },
  },
  { timestamps: true }
);

// Hash password before saving to the database
voterSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS) || 10); 
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error); 
  }
});

const Voter = mongoose.model("Voter", voterSchema);

export default Voter;
