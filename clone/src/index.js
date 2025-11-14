const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const Template = path.join(__dirname, '../template');
const mongoose = require('mongoose');
const { name } = require('ejs');
const { exit } = require('process');
const { Student, Admin, Complaint } = require('./mongodb');
const multer = require("multer");
const fs = require('fs')

const app = express()
app.use(express.urlencoded({ extended: false }))

app.use(express.json())
app.set('view engine', 'ejs')
app.set('views', Template);
app.use(express.static(path.join(__dirname, '../styles')));

app.use(express.static(path.join(__dirname, '../script'), {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (filepath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

app.get('/', (req, res) => {
  res.render('login')
})
app.get('/registration', (req, res) => {
  res.render('registration')
})
app.get("/complaintform", (req, res) => {
  res.render("complaintform");
});

app.get('/admindash', (req, res) => {
  res.render('admindash')
})

app.post('/registration', async (req, res) => {
  const data = {
    role: req.body.role,
    fname: req.body.fname,
    lname: req.body.lname,
    regno: req.body.regno,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  };
  const passRounds = 10;

  try {
    // ✅ For Admin Registration
    if (data.role === 'admin') {
      // Check if an admin already exists
      const existingAdmin = await Admin.findOne();
      if (existingAdmin) {
        return res.status(403).json({
          message: "An admin account already exists."
        });
      }
      // Create admin
      data.password = await bcrypt.hash(data.password, passRounds);

      await Admin.create({
        role: data.role,
        username: data.username,
        email: data.email,
        password: data.password
      });
      return res.status(201).json({ message: "Registration successful!" });
    }


    // If user alreadyexist
    const existingUser = await Student.findOne({
      $or: [
        { regno: data.regno },
        { email: data.email }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password

    data.password = await bcrypt.hash(data.password, passRounds);

    // Get user data
    const userdata = await Student.insertMany([data]);
    console.log('Inserted data:', userdata);

    // ✅ SEND A RESPONSE so fetch() can continue
    return res.status(201).json({ message: "Registration successful!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});


// LOGIN (Admin & Student)
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // First, check if it's an admin
    const admin = await Admin.findOne({ username });
    if (admin) {
      const adminPasswordMatch = await bcrypt.compare(password, admin.password);
      if (adminPasswordMatch) {
        return res.status(200).json({ message: "Redirect to Admin Dashboard", role: 'admin' });
      } else {
        return res.status(401).json({ message: "Incorrect password" });
      }
    }

    // If not admin, check if it's a student
    const user = await Student.findOne({ username });
    if (user) {
      const userPasswordMatch = await bcrypt.compare(password, user.password);
      if (userPasswordMatch) {
        return res.status(201).json({ message: "Redirect to Complaint Form" });
      } else {
        return res.status(401).json({ message: "Incorrect password" });
      }
    }

    // If neither found
    return res.status(404).json({ message: "User not found" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred during login" });
  }
});

// complaint form data
// Where to store uploaded files
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.post("/submit-complaint", upload.single("file"), async (req, res) => {
  try {
    const { anonymous, name, regno, email, department, title, details } = req.body;

    if (!title || !details) {
      return res.status(400).json({ message: "Title and details are required!" });
    }

     // Check if the same user already submitted the exact complaint
    const existingComplaint = await Complaint.findOne({ regno, title, details });

    if (existingComplaint) {
      return res.status(400).json({ message: "You have already submitted this complaint!" });
    }

    const isAnonymous = anonymous === true || anonymous === 'true';

    const complaintData = {
      title,
      details,
      anonymous: isAnonymous,
      file: req.file ? req.file.path : null,
      status: "pending",
      createdAt: new Date()
    };

    if (!isAnonymous) {
      complaintData.name = name;
      complaintData.regno = regno;
      complaintData.email = email;
      complaintData.department = department;
    }


    if (!isAnonymous) {
      // Only attach personal info if not anonymous
      if (!name || !regno || !email || !department) {
        return res.status(400).json({ message: "All personal fields are required!" });
      }
      complaintData.name = name;
      complaintData.regno = regno;
      complaintData.email = email;
      complaintData.department = department;
    }

    const complaint = new Complaint(complaintData);
    await complaint.save();

    return res.status(201).json({ message: "Complaint submitted successfully!" });
  } catch (err) {
    console.error("❌ Submit complaint error:", err);
    return res.status(500).json({ message: "Server error. Try again later." });
  }
});



// Get all complaints (for admin dashboard)
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 }); // latest first
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching complaints" });
  }
});

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

  } catch (err) {
    console.error("Advance status error:", err);
    res.status(500).json({ message: "Server error while advancing status" });
  }
});

// Fetch Admin name
// async function loadAdmin() {
//   const res = await fetch('/api/admin'); 
//   const data = await res.json();
//   document.getElementById('adminName').textContent = data.name;
// }

// loadAdmin();



app.listen(5000, () => {
  console.log('port connected')
})












