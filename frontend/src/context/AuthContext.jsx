import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

// ── State shape ──────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,   // True on mount while we check session
  error: null,
};

// ── Reducer ──────────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return { user: action.payload, isAuthenticated: true, isLoading: false, error: null };
    case 'AUTH_FAILURE':
      return { user: null, isAuthenticated: false, isLoading: false, error: action.payload };
    case 'AUTH_LOGOUT':
      return { user: null, isAuthenticated: false, isLoading: false, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// ── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Check existing session on mount ────────────────────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await authAPI.getCurrentUser();
        if (data.success) {
          dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
        } else {
          dispatch({ type: 'AUTH_FAILURE', payload: null });
        }
      } catch {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    checkSession();
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      // This will hit POST /login, which returns a redirect via Passport.
      // We check the session right after to get user data.
      await authAPI.login(credentials);
      const { data } = await authAPI.getCurrentUser();
      if (data.success) {
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
        return { success: true };
      }
      throw new Error('Session not established.');
    } catch (error) {
      const message = error.message || 'Login failed.';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      return { success: false, message };
    }
  }, []);

  // ── Signup ──────────────────────────────────────────────────────────────────
  const signup = useCallback(async (formData) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      await authAPI.signup(formData);
      dispatch({ type: 'AUTH_FAILURE', payload: null }); // Not logged in yet
      return { success: true };
    } catch (error) {
      const message = error.message || 'Signup failed.';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      return { success: false, message };
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore errors — session may already be invalid
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
