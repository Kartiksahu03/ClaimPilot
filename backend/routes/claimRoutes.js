const express = require("express");
const { createClaim, getClaims } = require("../controllers/claimController");

const router = express.Router();

// Public claim intake endpoint. Admin authentication will be added separately.
router.get("/", getClaims);\nrouter.post("/", createClaim);

module.exports = router;
