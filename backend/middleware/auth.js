/**
 * Middleware: ensureAuthenticated
 * Protects routes that require a logged-in session.
 * - For HTML routes → redirects to /login
 * - For API routes  → returns 401 JSON
 */
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  // Detect API requests
  const isApiRequest =
    req.path.startsWith('/api/') || req.headers.accept?.includes('application/json');

  if (isApiRequest) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please log in to access this resource.',
    });
  }

  req.flash('error', 'Please log in to continue.');
  res.redirect('/login');
};

/**
 * Middleware: ensureGuest
 * Prevents already-authenticated users from accessing login/signup.
 */
const ensureGuest = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  next();
};

module.exports = { ensureAuthenticated, ensureGuest };
