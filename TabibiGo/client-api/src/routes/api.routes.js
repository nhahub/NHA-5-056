const express = require("express");
const router = express.Router();

const authRoutes = require("../modules/auth/auth.routes");
const providerApplicationRoutes = require("../modules/provider-application/provider-application.routes");

// Mount feature routers under /api
router.use("/auth", authRoutes);
router.use("/provider/application", providerApplicationRoutes);

module.exports = router;
