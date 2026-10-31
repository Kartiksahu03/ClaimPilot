const express = require("express");
const { createClaim, getClaims, getClaimReviewWorkspace, updateClaimReviewStatus, addReviewerNote } = require("../controllers/claimController");

const router = express.Router();

// Public demo endpoints. Add reviewer/admin authentication before production use.
router.get("/", getClaims);
router.post("/", createClaim);
router.get("/:claimId/review-workspace", getClaimReviewWorkspace);
router.patch("/:claimId/review-status", updateClaimReviewStatus);
router.post("/:claimId/reviewer-notes", addReviewerNote);

module.exports = router;
