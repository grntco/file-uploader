const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(), // Keep files in memory as buffers
  limits: {
    fileSize: 10 * 1024 * 1024, // Optional: 10MB limit
  },
});

module.exports = upload;
