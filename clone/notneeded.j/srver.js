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



















































app.put('/api/complaints/:id/advance', async (req, res) => {
  const { id } = req.params;

  try {
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    console.log('Current status:', complaint.status);

    let newStatus;
    if (complaint.status === 'pending') newStatus = 'in-progress';
    else if (complaint.status === 'in-progress') newStatus = 'resolved';
    else if (complaint.status === 'resolved') {
      return res.status(400).json({ message: "Complaint is already resolved" });
    }

    complaint.status = newStatus;
    await complaint.save(); // if this fails, schema is wrong or DB issue

    console.log('New status saved:', complaint.status);
    res.json({ message: `Complaint status advanced to ${complaint.status}`, status: complaint.status });


       // ✅ Send email only when resolved
    if (complaint.status === 'resolved' && complaint.email) {
      const mailOptions = {
        from: 'zubairua471@gmail.com',
        to: complaint.email,
        subject: 'Complaint Resolved',
        html: `
          <p>Hello <strong>${complaint.name || 'User'}</strong>,</p>
          <p>Your complaint titled "<strong>${complaint.title}</strong>" has been resolved.</p>
          <p>Status: <strong>${complaint.status}</strong></p>
          <br>
          <p>Thank you,<br>The Admin Team</p>
        `
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error('Email error:', err);
        else console.log('Email sent:', info.response);
      });
    }

  } catch (err) {
    console.error("Advance status error:", err);
    res.status(500).json({ message: "Server error while advancing status" });
  }
});