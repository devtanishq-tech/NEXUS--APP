import React from 'react';

const Spinner = ({ fullscreen = false, size = 32, color = '#4f8ef7' }) => {
  const spinnerStyle = {
    width: size,
    height: size,
    border: `3px solid rgba(79, 142, 247, 0.15)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.75s linear infinite',
  };

  const wrapperStyle = fullscreen
    ? {
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080c14',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={wrapperStyle}>
        <div style={spinnerStyle} />
      </div>
    </>
  );
};

export default Spinner;
