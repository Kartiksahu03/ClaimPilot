require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const pool = require("./config/db");
const claimRoutes = require("./routes/claimRoutes");
const documentRoutes = require("./routes/documentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false
}));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ClaimPilot API is running"
  });
});

app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS database_time");

    res.status(200).json({
      success: true,
      message: "Supabase PostgreSQL connection is working",
      databaseTime: result.rows[0].database_time
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(503).json({
      success: false,
      message: "Could not connect to the database. Check DATABASE_URL and Supabase settings."
    });
  }
});

app.use("/api/claims", claimRoutes);
app.use("/api/claims", documentRoutes);

app.get("/", (req, res) => {
  res.send("ClaimPilot API");
});

app.listen(PORT, () => {
  console.log(`ClaimPilot server running on port ${PORT}`);
});
