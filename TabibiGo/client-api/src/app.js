const express = require("express");
const securityMiddleware = require("./config/security");
const corsMiddleware = require("./config/cors");

const healthRoutes = require("./routes/health.routes");
const apiRoutes = require("./routes/api.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ─── Security & Parsing ───────────────────────────────────────────────────────
app.use(securityMiddleware);
app.use(corsMiddleware);
app.use(express.json());

// ─── Root & Health Check ──────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TabibiGo Backend is Running!",
  });
});

app.use(healthRoutes);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api", apiRoutes);

// ─── 404 & Error Handling ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
