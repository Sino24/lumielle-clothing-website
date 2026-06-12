const Contact = require("../models/Contact");

// POST /api/contact
const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: "All fields are required" });

    // Detect logged-in user from optional Bearer token
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const jwt     = require("jsonwebtoken");
        const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
        userId = decoded.id ?? decoded._id ?? null;
      } catch {
        // invalid / expired token — treat as guest
      }
    }

    const contact = await Contact.create({ name, email, message, userId });
    res.status(201).json({ message: "Message received!", contact });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/contact  (admin)
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort("-createdAt");

    const result = contacts.map((c) => ({
      ...c.toObject(),
      hasAccount: !!c.userId,  // reliable: set at submission time
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/contact/:id/status  (admin)
const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/contact/:id/reply  (admin)
const replyToContact = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply?.trim())
      return res.status(400).json({ message: "Reply cannot be empty" });

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { reply, repliedAt: new Date(), status: "replied" },
      { new: true }
    );
    if (!contact)
      return res.status(404).json({ message: "Message not found" });

    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/contact/:id  (admin)
const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  submitContact,
  getContacts,
  updateContactStatus,
  replyToContact,
  deleteContact,
};