import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated, isLoading, clearError } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
    return () => clearError();
  }, [isAuthenticated, navigate, clearError]);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = "Name must be at least 2 characters.";
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email))
      e.email = "Please enter a valid email.";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    return e;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    const result = await signup(form);
    setSubmitting(false);

    if (result.success) {
      navigate("/login", {
        state: { message: "Account created! Please log in." },
      });
    } else {
      setServerError(
        result.message || "Registration failed. Please try again.",
      );
    }
  };

  const css = styles();

  return (
    <div style={css.page}>
      <div style={css.bg} />
      <div style={css.glow} />

      <div style={css.wrapper}>
        <div style={css.logo}>
          <div style={css.logoIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={css.logoText}>Nexus</span>
        </div>

        <div style={css.card}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={css.cardTitle}>Create account</h1>
            <p style={css.cardSub}>Join Nexus and start managing your work</p>
          </div>

          {serverError && (
            <div style={css.alert}>
              <span>⚠</span> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Field label="Full Name" error={errors.name}>
              <input
                style={{ ...css.input, ...(errors.name ? css.inputError : {}) }}
                name="name"
                type="text"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </Field>

            <Field label="Email Address" error={errors.email}>
              <input
                style={{
                  ...css.input,
                  ...(errors.email ? css.inputError : {}),
                }}
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </Field>

            <Field
              label="Password"
              error={errors.password}
              hint="Minimum 6 characters"
            >
              <input
                style={{
                  ...css.input,
                  ...(errors.password ? css.inputError : {}),
                }}
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </Field>

            <Field label="Confirm Password" error={errors.confirmPassword}>
              <input
                style={{
                  ...css.input,
                  ...(errors.confirmPassword ? css.inputError : {}),
                }}
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </Field>

            <button
              type="submit"
              style={{ ...css.btn, opacity: submitting || isLoading ? 0.7 : 1 }}
              disabled={submitting || isLoading}
            >
              {submitting ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p style={css.terms}>
            By creating an account, you agree to our Terms of Service.
          </p>
          <hr style={css.divider} />
          <p style={css.link}>
            Already have an account?{" "}
            <Link to="/login" style={css.a}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, error, hint, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label
      style={{
        display: "block",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.8px",
        textTransform: "uppercase",
        color: "#6b7a99",
        marginBottom: 7,
      }}
    >
      {label}
    </label>
    {children}
    {error && (
      <p style={{ fontSize: 12, color: "#f04a5a", marginTop: 5 }}>{error}</p>
    )}
    {!error && hint && (
      <p style={{ fontSize: 12, color: "#3d4d6a", marginTop: 5 }}>{hint}</p>
    )}
  </div>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = () => ({
  page: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#080c14",
    color: "#e8edf5",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  bg: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(79,142,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,247,0.04) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  glow: {
    position: "fixed",
    top: "-20%",
    left: "50%",
    transform: "translateX(-50%)",
    width: 600,
    height: 600,
    background:
      "radial-gradient(ellipse, rgba(79,142,247,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  wrapper: {
    width: "100%",
    maxWidth: 440,
    padding: 24,
    position: "relative",
    zIndex: 1,
    animation: "fadeUp 0.5s ease both",
  },
  logo: {
    textAlign: "center",
    marginBottom: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    background: "linear-gradient(135deg, #4f8ef7, #7c5fe6)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.5px",
  },
  card: {
    background: "#0f1623",
    border: "1px solid rgba(99,160,255,0.12)",
    borderRadius: 16,
    padding: 40,
    boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
  },
  cardTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: "-0.5px",
    marginBottom: 6,
  },
  cardSub: { fontSize: 14, color: "#6b7a99", fontWeight: 300 },
  alert: {
    background: "rgba(240,74,90,0.1)",
    border: "1px solid rgba(240,74,90,0.25)",
    borderRadius: 8,
    padding: "12px 16px",
    color: "#f88",
    fontSize: 13.5,
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    background: "#161e2e",
    border: "1px solid rgba(99,160,255,0.12)",
    borderRadius: 8,
    color: "#e8edf5",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  inputError: { borderColor: "rgba(240,74,90,0.5)" },
  btn: {
    width: "100%",
    padding: "13px 24px",
    background: "#4f8ef7",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontFamily: "'Syne', sans-serif",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
    transition: "background 0.2s",
    letterSpacing: "0.2px",
  },
  terms: {
    fontSize: 12,
    color: "#3d4d6a",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 1.6,
  },
  divider: {
    border: "none",
    borderTop: "1px solid rgba(99,160,255,0.08)",
    margin: "24px 0",
  },
  link: { textAlign: "center", fontSize: 14, color: "#6b7a99" },
  a: { color: "#4f8ef7", textDecoration: "none", fontWeight: 500 },
});

export default Signup;
