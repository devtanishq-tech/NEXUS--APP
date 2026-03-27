const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ── GET /signup ─────────────────────────────────────────────────────────────
const getSignup = (req, res) => {
  res.render("signup", {
    title: "Create Account",
    errors: req.flash("error"),
    success: req.flash("success"),
    formData: req.flash("formData")[0] || {},
  });
};

// ── POST /signup ────────────────────────────────────────────────────────────
const postSignup = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // ── Input validation ──────────────────────────────────────────────────
    const errors = [];

    if (!name || name.trim().length < 2) {
      errors.push("Name must be at least 2 characters.");
    }

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email.trim())) {
      errors.push("Please enter a valid email address.");
    }

    if (!password || password.length < 6) {
      errors.push("Password must be at least 6 characters.");
    }

    if (password !== confirmPassword) {
      errors.push("Passwords do not match.");
    }

    if (errors.length > 0) {
      req.flash("error", errors);
      req.flash("formData", { name, email });
      return res.redirect("/signup");
    }

    // ── Check for existing user ───────────────────────────────────────────
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      req.flash("error", "An account with this email already exists.");
      req.flash("formData", { name, email });
      return res.redirect("/signup");
    }

    // ── Create user (password hashed in pre-save hook) ────────────────────
    await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    req.flash("success", "Account created successfully! Please log in.");
    res.redirect("/login");
  } catch (error) {
    next(error);
  }
};

// ── GET /login ──────────────────────────────────────────────────────────────
const getLogin = (req, res) => {
  res.render("login", {
    title: "Sign In",
    errors: req.flash("error"),
    success: req.flash("success"),
  });
};

// ── POST /login ─────────────────────────────────────────────────────────────
const postLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Basic pre-check
  if (!email || !password) {
    req.flash("error", "Email and password are required.");
    return res.redirect("/login");
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      req.flash("error", info?.message || "Invalid credentials.");
      return res.redirect("/login");
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);

      // Regenerate session to prevent session fixation
      req.session.regenerate((regenErr) => {
        if (regenErr) return next(regenErr);

        // Re-store user after regeneration
        req.session.passport = { user: user._id };
        req.session.save((saveErr) => {
          if (saveErr) return next(saveErr);
          res.redirect("/dashboard");
        });
      });
    });
  })(req, res, next);
};

// ── GET /logout ─────────────────────────────────────────────────────────────
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destroy error:", destroyErr);
      }
      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
  });
};

// ── GET /api/auth/user — returns current session user ──────────────────────
const getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    });
  }
  res.status(401).json({ success: false, message: "Not authenticated." });
};
// ── POST /api/auth/login ────────────────────────────────────────────────────
const apiLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(401)
        .json({
          success: false,
          message: info?.message || "Invalid credentials.",
        });

    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      req.session.regenerate((regenErr) => {
        if (regenErr) return next(regenErr);
        req.session.passport = { user: user._id };
        req.session.save((saveErr) => {
          if (saveErr) return next(saveErr);
          res.json({
            success: true,
            user: { _id: user._id, name: user.name, email: user.email },
          });
        });
      });
    });
  })(req, res, next);
};

// ── POST /api/auth/signup ───────────────────────────────────────────────────
const apiSignup = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2)
      errors.push("Name must be at least 2 characters.");
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email.trim()))
      errors.push("Please enter a valid email address.");
    if (!password || password.length < 6)
      errors.push("Password must be at least 6 characters.");
    if (password !== confirmPassword) errors.push("Passwords do not match.");

    if (errors.length > 0) {
      return res.status(422).json({ success: false, message: errors[0] });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return res
        .status(409)
        .json({
          success: false,
          message: "An account with this email already exists.",
        });
    }

    await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });
    res.json({ success: true, message: "Account created successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSignup,
  postSignup,
  getLogin,
  postLogin,
  logout,
  getCurrentUser,
  apiLogin, // ← add
  apiSignup, // ← add
};
