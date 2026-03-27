import React, { useState, useEffect, useCallback } from 'react';

let toastTimeout = null;

// ── Singleton event bus ──────────────────────────────────────────────────────
const listeners = new Set();
export const showToast = (message, type = 'success') => {
  listeners.forEach((cb) => cb({ message, type }));
};

// ── Toast Component ──────────────────────────────────────────────────────────
const Toast = () => {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);

  const trigger = useCallback(({ message, type }) => {
    clearTimeout(toastTimeout);
    setToast({ message, type });
    setVisible(true);
    toastTimeout = setTimeout(() => setVisible(false), 3000);
  }, []);

  useEffect(() => {
    listeners.add(trigger);
    return () => listeners.delete(trigger);
  }, [trigger]);

  if (!toast) return null;

  const styles = {
    wrapper: {
      position: 'fixed',
      bottom: 28,
      right: 28,
      zIndex: 9999,
      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'all' : 'none',
    },
    toast: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '13px 18px',
      background: '#0f1623',
      border: `1px solid ${toast.type === 'success' ? 'rgba(16,208,120,0.3)' : 'rgba(240,74,90,0.3)'}`,
      borderRadius: 10,
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
      color: '#e8edf5',
      fontSize: 14,
      maxWidth: 320,
      fontFamily: "'DM Sans', sans-serif",
    },
    icon: {
      fontSize: 16,
      color: toast.type === 'success' ? '#10d078' : '#f04a5a',
      flexShrink: 0,
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.toast}>
        <span style={styles.icon}>{toast.type === 'success' ? '✓' : '⚠'}</span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

export default Toast;
