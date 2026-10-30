const pool = require("../config/db");

const allowedUserTypes = ["Patient", "Caregiver", "Hospital Representative"];
const allowedCategories = [
  "Hospitalization",
  "Daycare",
  "Pre/Post Hospitalization",
  "Other"
];

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function createClaim(req, res) {
  const claimantName = cleanText(req.body.claimant_name);
  const email = cleanText(req.body.email).toLowerCase();
  const phone = cleanText(req.body.phone);
  const userType = cleanText(req.body.user_type);
  const claimCategory = cleanText(req.body.claim_category);
  const policyNumber = cleanText(req.body.policy_number);
  const description = cleanText(req.body.description);
  const rawAmount = req.body.claim_amount;

  const errors = {};

  if (!claimantName) errors.claimant_name = "Claimant name is required.";
  else if (claimantName.length > 150) errors.claimant_name = "Name must be 150 characters or fewer.";

  if (!email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";

  if (!phone) errors.phone = "Phone number is required.";
  else if (phone.length > 25) errors.phone = "Phone number must be 25 characters or fewer.";

  if (!allowedUserTypes.includes(userType)) {
    errors.user_type = "Choose a valid user type.";
  }

  if (!allowedCategories.includes(claimCategory)) {
    errors.claim_category = "Choose a valid claim category.";
  }

  if (!description) errors.description = "Please describe the claim.";
  else if (description.length > 5000) errors.description = "Description must be 5000 characters or fewer.";

  let claimAmount = null;
  if (rawAmount !== undefined && rawAmount !== null && rawAmount !== "") {
    claimAmount = Number(rawAmount);
    if (!Number.isFinite(claimAmount) || claimAmount <= 0 || claimAmount > 9999999999.99) {
      errors.claim_amount = "Claim amount must be a positive valid amount.";
    }
  }

  if (policyNumber.length > 100) {
    errors.policy_number = "Policy number must be 100 characters or fewer.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Please correct the highlighted fields.",
      errors
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO claims
        (claimant_name, email, phone, user_type, claim_category, policy_number, claim_amount, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, claimant_name, email, phone, user_type, claim_category,
                 policy_number, claim_amount, description, status, created_at`,
      [
        claimantName,
        email,
        phone,
        userType,
        claimCategory,
        policyNumber || null,
        claimAmount,
        description
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Claim submitted successfully. It is awaiting review.",
      claim: result.rows[0]
    });
  } catch (error) {
    console.error("Create claim failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to submit the claim right now. Please try again."
    });
  }
}

module.exports = { createClaim };
