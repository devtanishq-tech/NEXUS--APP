if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
  // this above line make a connection with .env with server side code
}

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");
const path = require("path");

const connectDB = require("./config/db");
const configurePassport = require("./config/passport");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const apiRoutes = require("./routes/apiRoutes");
const {
  globalErrorHandler,
  notFoundHandler,
} = require("./middleware/errorHandler");

// ── Initialize Express ──────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB();

// ── Configure Passport ──────────────────────────────────────────────────────
configurePassport();

// ── View Engine ─────────────────────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ── Static Files ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ── Body Parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── CORS (for React frontend) ────────────────────────────────────────────────
app.use((req, res, next) => {
  const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ── Session Configuration ────────────────────────────────────────────────────
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "fallback_secret_change_in_production",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
    ttl: 24 * 60 * 60, // 1 day
  }),
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  name: "sessionId", // Obscure default cookie name
};

app.use(session(sessionConfig));

// ── Passport Middleware ─────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Flash Messages ──────────────────────────────────────────────────────────
app.use(flash());

// ── Global Template Variables ────────────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/api", apiRoutes);

// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── Global Error Handler (must be last) ─────────────────────────────────────
app.use(globalErrorHandler);

// ── Start Server ────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(
    `\n🚀 Server running in ${process.env.NODE_ENV || "development"} mode`,
  );
  console.log(`📡 Listening on http://localhost:${PORT}\n`);
});

// ── Graceful Shutdown ────────────────────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Promise Rejection:", err.message);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});

module.exports = app;
