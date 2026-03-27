const express = require("express");
const router = express.Router();
const {
  getSignup,
  postSignup,
  getLogin,
  postLogin,
  logout,
  getCurrentUser,
  apiLogin,
  apiSignup,
} = require("../controllers/authController");
const { ensureAuthenticated, ensureGuest } = require("../middleware/auth");

// Public routes (redirect if already logged in)
router.get("/signup", ensureGuest, getSignup);
router.post("/signup", ensureGuest, postSignup);
router.get("/login", ensureGuest, getLogin);
router.post("/login", ensureGuest, postLogin);

// Logout (requires session)
router.get("/logout", ensureAuthenticated, logout);

// API: get current session user
router.post("/api/auth/login", apiLogin);
router.post("/api/auth/signup", apiSignup);
router.get("/api/auth/user", getCurrentUser);

module.exports = router;
