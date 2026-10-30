require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

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

app.get("/", (req, res) => {
  res.send("ClaimPilot API");
});

app.listen(PORT, () => {
  console.log(`ClaimPilot server running on port ${PORT}`);
});
