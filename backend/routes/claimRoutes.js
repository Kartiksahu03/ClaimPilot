const express = require("express");
const { createClaim, getClaims, getClaimReviewWorkspace, updateClaimReviewStatus, recordReviewDisposition, addReviewerNote } = require("../controllers/claimController");

const router = express.Router();

// Public demo endpoints. Add reviewer/admin authentication before production use.
router.get("/", getClaims);
router.post("/", createClaim);
router.get("/:claimId/review-workspace", getClaimReviewWorkspace);
router.patch("/:claimId/review-status", updateClaimReviewStatus);
router.patch("/:claimId/review-disposition", recordReviewDisposition);
router.post("/:claimId/reviewer-notes", addReviewerNote);

module.exports = router;
