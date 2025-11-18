app.get("/api/complaint-status/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const complaint = await Complaint.findOne({ complaintID: id });

    if (!complaint) {
      return res.json({ status: null });
    }

    res.json({ status: complaint.status });
  } catch (err) {
    res.status(500).json({ status: "Server Error" });
  }
});




















// GET /api/user-complaints/:regNo
app.get("/api/user-complaints/:regNo", async (req, res) => {
  try {
    const regNo = req.params.regNo;

    // Find all complaints for this user
    const complaints = await Complaint.find({ regNo })
      .sort({ createdAt: -1 }) // latest first
      .select("complaintId title status"); // only needed fields

    res.json({ success: true, complaints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
