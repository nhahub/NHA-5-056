const express = require("express");
const router = express.Router();

const authenticate = require("../../middlewares/authenticate");
const authorizeRoles = require("../../middlewares/authorizeRoles");
const {
  createApplication,
  getApplication,
  submitMyApplication,
} = require("./provider-application.controller");
const {
  createApplicationValidation,
} = require("./provider-application.validation");

// All provider application routes require authentication and provider role
router.use(authenticate, authorizeRoles("provider"));

router.get("/", getApplication);
router.post("/", createApplicationValidation, createApplication);
router.post("/submit", submitMyApplication);

module.exports = router;
