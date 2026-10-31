const express = require("express");
const { createClaim, getClaims } = require("../controllers/claimController");

const router = express.Router();

// Public claim retrieval and intake endpoints. Admin authentication will be added separately.
router.get("/", getClaims);
router.post("/", createClaim);

module.exports = router;
