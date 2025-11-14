// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/complaintsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema & Model
const complaintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  matric: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  title: { type: String, required: true },
  details: { type: String, required: true },
  username: String,
  userId: String,
  dateSubmitted: { type: Date, default: Date.now },
});

const Complaint = mongoose.model("Complaint", complaintSchema);

// Routes
app.post("/api/complaints", async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    const savedComplaint = await complaint.save();
    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully!",
      id: savedComplaint._id,
    });
  } catch (error) {
    console.error("Error saving complaint:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error. Please try again later.",
    });
  }
});

// Optional: Get all complaints (for admin view)
app.get("/api/complaints", async (req, res) => {
  const complaints = await Complaint.find().sort({ dateSubmitted: -1 });
  res.json(complaints);
});

// ✅ Serve static frontend files (optional)
app.use(express.static(path.join(__dirname, "frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
