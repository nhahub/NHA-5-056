const express = require("express");
const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TabibiGo Client API is healthy",
  });
});

module.exports = router;

