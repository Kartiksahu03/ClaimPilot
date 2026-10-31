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

async function getClaimDocuments(req, res) {
  const { claimId } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, claim_id, original_file_name, mime_type, file_size_bytes, uploaded_at
       FROM claim_documents WHERE claim_id = $1 ORDER BY uploaded_at DESC`,
      [claimId]
    );
    return res.status(200).json({ success: true, documents: result.rows });
  } catch (error) {
    console.error("Fetch claim documents failed:", error.message);
    return res.status(500).json({ success: false, message: "Could not retrieve claim documents." });
  }
}

async function viewClaimDocument(req, res) {
  const { claimId, documentId } = req.params;
  try {
    const result = await pool.query(
      "SELECT storage_path, mime_type, original_file_name FROM claim_documents WHERE id = $1 AND claim_id = $2",
      [documentId, claimId]
    );
    if (!result.rowCount) return res.status(404).json({ success: false, message: "Document not found." });
    const uploadDir = path.resolve(__dirname, "../uploads");
    const filePath = path.resolve(uploadDir, path.basename(result.rows[0].storage_path));
    if (!filePath.startsWith(uploadDir + path.sep)) return res.status(400).json({ success: false, message: "Invalid document path." });
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: "File is not present in this backend's uploads folder." });
    res.setHeader("Content-Type", result.rows[0].mime_type || "application/octet-stream");
    res.setHeader("Content-Disposition", "inline; filename*=UTF-8''" + encodeURIComponent(result.rows[0].original_file_name || "claim-document"));
    return res.sendFile(filePath);
  } catch (error) {
    console.error("View claim document failed:", error.message);
    return res.status(500).json({ success: false, message: "Could not open this document." });
  }
}

module.exports = { uploadClaimDocuments, getClaimDocuments, viewClaimDocument };
