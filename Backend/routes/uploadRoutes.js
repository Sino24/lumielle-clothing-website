// routes/uploadRoutes.js

const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

const router = express.Router();

// memoryStorage = file lives in req.file.buffer (no disk path)
const upload = multer({ storage: multer.memoryStorage() });

// Helper: pipe a buffer into Cloudinary's upload_stream
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Convert buffer → readable stream and pipe it
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null); // signal end-of-stream
    readable.pipe(uploadStream);
  });
}

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "lumielle-products",
      resource_type: "image",
    });

    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;