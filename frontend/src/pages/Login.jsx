import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, clearError } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.message || '');

  // Redirect destination after login
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
    return () => clearError();
  }, [isAuthenticated, navigate, from, clearError]);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required.';
    if (!form.password) e.password = 'Password is required.';
    return e;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setServerError(result.message || 'Login failed. Please check your credentials.');
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={css.logoText}>Nexus</span>
        </div>

        <div style={css.card}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={css.cardTitle}>Welcome back</h1>
            <p style={css.cardSub}>Sign in to your account to continue</p>
          </div>

          {successMsg && (
            <div style={css.successAlert}>
              <span>✓</span> {successMsg}
            </div>
          )}

          {serverError && (
            <div style={css.errorAlert}>
              <span>⚠</span> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 18 }}>
              <label style={css.label}>Email Address</label>
              <input
                style={{ ...css.input, ...(errors.email ? { borderColor: 'rgba(240,74,90,0.5)' } : {}) }}
                name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <p style={css.fieldErr}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={css.label}>Password</label>
              <input
                style={{ ...css.input, ...(errors.password ? { borderColor: 'rgba(240,74,90,0.5)' } : {}) }}
                name="password" type="password" placeholder="Enter your password"
                value={form.password} onChange={handleChange}
                autoComplete="current-password"
              />
              {errors.password && <p style={css.fieldErr}>{errors.password}</p>}
            </div>

            <button
              type="submit"
              style={{ ...css.btn, opacity: submitting || isLoading ? 0.7 : 1 }}
              disabled={submitting || isLoading}
            >
              {submitting ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <hr style={css.divider} />
          <p style={css.linkText}>
            Don't have an account?{' '}
            <Link to="/signup" style={css.a}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = () => ({
  page: {
    fontFamily: "'DM Sans', sans-serif",
    background: '#080c14', color: '#e8edf5',
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  bg: {
    position: 'fixed', inset: 0,
    backgroundImage: 'linear-gradient(rgba(79,142,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,247,0.04) 1px, transparent 1px)',
    backgroundSize: '40px 40px', pointerEvents: 'none',
  },
  glow: {
    position: 'fixed', top: '-20%', left: '50%',
    transform: 'translateX(-50%)',
    width: 600, height: 600,
    background: 'radial-gradient(ellipse, rgba(79,142,247,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  wrapper: {
    width: '100%', maxWidth: 440, padding: 24,
    position: 'relative', zIndex: 1,
  },
  logo: {
    textAlign: 'center', marginBottom: 36,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  logoIcon: {
    width: 36, height: 36,
    background: 'linear-gradient(135deg, #4f8ef7, #7c5fe6)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px',
  },
  card: {
    background: '#0f1623',
    border: '1px solid rgba(99,160,255,0.12)',
    borderRadius: 16, padding: 40,
    boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
  },
  cardTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6,
  },
  cardSub: { fontSize: 14, color: '#6b7a99', fontWeight: 300 },
  label: {
    display: 'block', fontSize: 11, fontWeight: 600,
    letterSpacing: '0.8px', textTransform: 'uppercase',
    color: '#6b7a99', marginBottom: 7,
  },
  input: {
    width: '100%', padding: '12px 14px',
    background: '#161e2e',
    border: '1px solid rgba(99,160,255,0.12)',
    borderRadius: 8, color: '#e8edf5',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15, outline: 'none',
    boxSizing: 'border-box',
  },
  fieldErr: { fontSize: 12, color: '#f04a5a', marginTop: 5 },
  errorAlert: {
    background: 'rgba(240,74,90,0.1)',
    border: '1px solid rgba(240,74,90,0.25)',
    borderRadius: 8, padding: '12px 16px',
    color: '#f88', fontSize: 13.5,
    display: 'flex', gap: 8, marginBottom: 20,
  },
  successAlert: {
    background: 'rgba(16,208,120,0.1)',
    border: '1px solid rgba(16,208,120,0.25)',
    borderRadius: 8, padding: '12px 16px',
    color: '#5ef5b0', fontSize: 13.5,
    display: 'flex', gap: 8, marginBottom: 20,
  },
  btn: {
    width: '100%', padding: '13px 24px',
    background: '#4f8ef7', border: 'none',
    borderRadius: 8, color: '#fff',
    fontFamily: "'Syne', sans-serif",
    fontSize: 15, fontWeight: 600,
    cursor: 'pointer', marginTop: 8,
    letterSpacing: '0.2px',
  },
  divider: { border: 'none', borderTop: '1px solid rgba(99,160,255,0.08)', margin: '24px 0' },
  linkText: { textAlign: 'center', fontSize: 14, color: '#6b7a99' },
  a: { color: '#4f8ef7', textDecoration: 'none', fontWeight: 500 },
});

export default Login;
