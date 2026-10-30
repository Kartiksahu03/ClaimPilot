const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function uploadClaimDocuments(req, res) {
  const { claimId } = req.params;
  const files = req.files || [];

  if (files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Choose at least one document to upload."
    });
  }

  try {
    const claimResult = await pool.query(
      "SELECT id FROM claims WHERE id = $1",
      [claimId]
    );

    if (claimResult.rowCount === 0) {
      files.forEach((file) => fs.unlink(file.path, () => {}));
      return res.status(404).json({
        success: false,
        message: "Claim not found."
      });
    }

    const savedDocuments = [];

    for (const file of files) {
      const result = await pool.query(
        `INSERT INTO claim_documents
          (claim_id, original_file_name, storage_path, mime_type, file_size_bytes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, claim_id, original_file_name, mime_type, file_size_bytes, uploaded_at`,
        [
          claimId,
          file.originalname,
          path.basename(file.path),
          file.mimetype,
          file.size
        ]
      );

      savedDocuments.push(result.rows[0]);
    }

    return res.status(201).json({
      success: true,
      message: "Documents uploaded and linked to the claim.",
      documents: savedDocuments
    });
  } catch (error) {
    console.error("Document upload failed:", error.message);
    files.forEach((file) => fs.unlink(file.path, () => {}));
    return res.status(500).json({
      success: false,
      message: "Could not save document details. Please try again."
    });
  }
}

module.exports = { uploadClaimDocuments };
