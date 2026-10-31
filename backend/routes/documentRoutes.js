const express = require("express");
const upload = require("../middleware/upload");
const { uploadClaimDocuments, getClaimDocuments, setDocumentVerification, viewClaimDocument } = require("../controllers/documentController");
const { analyzeClaimDocuments } = require("../controllers/aiReviewController");

const router = express.Router();

router.get("/:claimId/documents", getClaimDocuments);
router.get("/:claimId/documents/:documentId/view", viewClaimDocument);
router.patch("/:claimId/documents/:documentId/verification", setDocumentVerification);

router.post("/:claimId/ai-review", analyzeClaimDocuments);

router.post("/:claimId/documents", (req, res, next) => {
  upload.array("documents", 5)(req, res, (error) => {
    if (error) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "Each file must be 10 MB or smaller."
          : error.code === "LIMIT_FILE_COUNT"
          ? "You can upload up to 5 files at once."
          : error.message || "File upload failed.";

      return res.status(400).json({ success: false, message });
    }
    next();
  });
}, uploadClaimDocuments);

module.exports = router;
