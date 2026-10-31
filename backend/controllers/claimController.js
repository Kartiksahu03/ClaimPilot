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

async function getClaims(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, claimant_name, email, claim_category, policy_number,
              claim_amount, status, review_status, created_at
       FROM claims
       ORDER BY created_at DESC
       LIMIT 100`
    );
    return res.status(200).json({ success: true, claims: result.rows });
  } catch (error) {
    console.error("Fetch claims failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to retrieve claims right now." });
  }
}


async function getClaimReviewWorkspace(req, res) {
  const { claimId } = req.params;
  try {
    const claimResult = await pool.query(
      "SELECT id, review_status FROM claims WHERE id = $1",
      [claimId]
    );
    if (!claimResult.rows.length) return res.status(404).json({ success: false, message: "Claim not found." });
    const [notes, logs] = await Promise.all([
      pool.query("SELECT id, claim_id, note, reviewer_name, created_at FROM claim_reviewer_notes WHERE claim_id = $1 ORDER BY created_at DESC", [claimId]),
      pool.query("SELECT id, claim_id, action, details, created_at FROM claim_activity_logs WHERE claim_id = $1 ORDER BY created_at DESC", [claimId])
    ]);
    return res.json({ success: true, claim: claimResult.rows[0], notes: notes.rows, activity: logs.rows });
  } catch (error) {
    console.error("Review workspace load failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load review workspace." });
  }
}

async function updateClaimReviewStatus(req, res) {
  const { claimId } = req.params;
  const reviewStatus = cleanText(req.body.review_status);
  const allowed = ["Submitted", "In Review", "Review Completed"];
  if (!allowed.includes(reviewStatus)) return res.status(400).json({ success: false, message: "Invalid review status." });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const updated = await client.query(
      "UPDATE claims SET review_status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, review_status",
      [reviewStatus, claimId]
    );
    if (!updated.rows.length) { await client.query("ROLLBACK"); return res.status(404).json({ success: false, message: "Claim not found." }); }
    await client.query(
      "INSERT INTO claim_activity_logs (claim_id, action, details) VALUES ($1, $2, $3)",
      [claimId, "review_status_updated", JSON.stringify({ description: "Review status changed to " + reviewStatus, review_status: reviewStatus })]
    );
    await client.query("COMMIT");
    return res.json({ success: true, claim: updated.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Review status update failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update review status." });
  } finally { client.release(); }
}

async function addReviewerNote(req, res) {
  const { claimId } = req.params;
  const note = cleanText(req.body.note);
  const reviewerName = cleanText(req.body.reviewer_name) || "Demo Reviewer";
  if (!note || note.length > 3000) return res.status(400).json({ success: false, message: "Enter a note of 1–3000 characters." });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inserted = await client.query(
      "INSERT INTO claim_reviewer_notes (claim_id, note, reviewer_name) VALUES ($1, $2, $3) RETURNING id, claim_id, note, reviewer_name, created_at",
      [claimId, note, reviewerName]
    );
    await client.query(
      "INSERT INTO claim_activity_logs (claim_id, action, details) VALUES ($1, $2, $3)",
      [claimId, "reviewer_note_added", JSON.stringify({ description: "Reviewer added a note", note_id: inserted.rows[0].id })]
    );
    await client.query("COMMIT");
    return res.status(201).json({ success: true, note: inserted.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Reviewer note add failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to save reviewer note." });
  } finally { client.release(); }
}

module.exports = { createClaim, getClaims, getClaimReviewWorkspace, updateClaimReviewStatus, addReviewerNote };

