const express = require("express");
const { createClaim } = require("../controllers/claimController");

const router = express.Router();

// Public claim intake endpoint. Admin authentication will be added separately.
router.post("/", createClaim);

module.exports = router;
