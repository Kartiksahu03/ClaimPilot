const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDirectory = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadDirectory),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${require("crypto").randomUUID()}${extension}`;
    callback(null, safeName);
  }
});

function fileFilter(req, file, callback) {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(new Error("Only PDF, JPG, and PNG files are allowed."));
  }
  callback(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  }
});

module.exports = upload;
