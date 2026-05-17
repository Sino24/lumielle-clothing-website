const Contact = require("../models/Contact");

// POST /api/contact
const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      message,
    });

    res.status(201).json({
      message: "Message received!",
      contact,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// GET /api/contact
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort("-createdAt");

    res.json(contacts);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// PATCH /api/contact/:id/status
const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const contact =
      await Contact.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

    res.json(contact);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// DELETE /api/contact/:id
const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Deleted",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  submitContact,
  getContacts,
  updateContactStatus,
  deleteContact,
};