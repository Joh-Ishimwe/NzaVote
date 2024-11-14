import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  party: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  }
  ,
  votes: {
    type: Number,
    default: 0,  // To track the number of votes each candidate has received
  },
});

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;
