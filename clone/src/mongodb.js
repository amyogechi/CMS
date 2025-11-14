const mongoose = require('mongoose');

// connect to MongoDB
mongoose.connect('mongodb://localhost:27017/LoginSignupdb')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(() => console.log('❌ Failed to connect'));

// Student Schema
const studentSchema = new mongoose.Schema({
  role: { type: String, required: true },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  regno: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
});


// ✅ Admin schema — only one admin allowed
const adminSchema = new mongoose.Schema({
  role: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});


// Complaint Schema
const complaintSchema = new mongoose.Schema({
  name: { type: String, required: function() { return !this.anonymous } },
  regno: { type: String, required: function() { return !this.anonymous } },
  email: { type: String, required: function() { return !this.anonymous } },
  department: { type: String, required: function() { return !this.anonymous } },
  title: { type: String, required: true },
  details: { type: String, required: true },
  file: { type: String },
  anonymous: { type: Boolean, default: false },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'resolved', 'in-progress',]
  },
  createdAt: { type: Date, default: Date.now }
});


// Complaint Schema
const updateComplaintSchema = new mongoose.Schema({
  update_id: { type: Number, required: true },
  admin_id: { type: Number, required: true },
  complaint_id: { type: Number, required: true },
  feedback_message: { type: String, required: true },
  title: { type: String, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

// Create models
const Student = mongoose.model('Student', studentSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);
const udatecomplaint = mongoose.model('udatecomplaint', updateComplaintSchema);

// Export both models together
module.exports = { Student, Complaint, Admin, udatecomplaint };



