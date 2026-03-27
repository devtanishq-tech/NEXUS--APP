import React, { useState, useEffect } from 'react';

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'task',
  status: 'active',
  priority: 'medium',
};

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease',
  },
  modal: {
    background: '#0f1623',
    border: '1px solid rgba(99,160,255,0.12)',
    borderRadius: 16,
    padding: 32,
    width: '90%', maxWidth: 480,
    animation: 'slideUp 0.2s ease',
    fontFamily: "'DM Sans', sans-serif",
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 20, fontWeight: 700,
    color: '#e8edf5',
    marginBottom: 24,
  },
  formGroup: { marginBottom: 18 },
  label: {
    display: 'block',
    fontSize: 11, fontWeight: 600,
    letterSpacing: '0.8px', textTransform: 'uppercase',
    color: '#6b7a99',
    marginBottom: 7,
  },
  input: {
    width: '100%', padding: '10px 14px',
    background: '#161e2e',
    border: '1px solid rgba(99,160,255,0.12)',
    borderRadius: 8,
    color: '#e8edf5',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  footer: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 },
  btnPrimary: {
    padding: '10px 22px',
    background: '#4f8ef7', border: 'none',
    borderRadius: 8, color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14, fontWeight: 500,
    cursor: 'pointer',
  },
  btnGhost: {
    padding: '10px 22px',
    background: 'transparent',
    border: '1px solid rgba(99,160,255,0.12)',
    borderRadius: 8, color: '#6b7a99',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14, fontWeight: 500,
    cursor: 'pointer',
  },
  error: {
    background: 'rgba(240,74,90,0.1)',
    border: '1px solid rgba(240,74,90,0.25)',
    borderRadius: 8, padding: '10px 14px',
    color: '#f88', fontSize: 13,
    marginBottom: 16,
  },
};

const ItemModal = ({ isOpen, onClose, onSubmit, editItem, defaultCategory, loading }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editItem) {
      setForm({
        title: editItem.title || '',
        description: editItem.description || '',
        category: editItem.category || 'task',
        status: editItem.status || 'active',
        priority: editItem.priority || 'medium',
      });
    } else {
      setForm({ ...EMPTY_FORM, category: defaultCategory || 'task' });
    }
    setError('');
  }, [editItem, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    const result = await onSubmit(form);
    if (result?.success === false) {
      setError(result.message || 'Something went wrong.');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const inputFocus = (e) => {
    e.target.style.borderColor = '#4f8ef7';
    e.target.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.15)';
  };
  const inputBlur = (e) => {
    e.target.style.borderColor = 'rgba(99,160,255,0.12)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      <div style={s.overlay} onClick={handleOverlayClick}>
        <div style={s.modal}>
          <h2 style={s.title}>{editItem ? 'Edit Item' : 'New Item'}</h2>

          {error && <div style={s.error}>⚠ {error}</div>}

          <div style={s.formGroup}>
            <label style={s.label}>Title *</label>
            <input
              style={s.input} name="title" value={form.title}
              placeholder="Enter title..."
              onChange={handleChange} onFocus={inputFocus} onBlur={inputBlur}
            />
          </div>

          <div style={s.formGroup}>
            <label style={s.label}>Description</label>
            <textarea
              style={{ ...s.input, resize: 'vertical', minHeight: 80 }}
              name="description" value={form.description}
              placeholder="Optional description..."
              onChange={handleChange} onFocus={inputFocus} onBlur={inputBlur}
            />
          </div>

          <div style={s.row}>
            <div style={s.formGroup}>
              <label style={s.label}>Category *</label>
              <select style={s.input} name="category" value={form.category} onChange={handleChange} onFocus={inputFocus} onBlur={inputBlur}>
                <option value="task">Task</option>
                <option value="lead">Lead</option>
                <option value="user">Team Member</option>
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Priority</label>
              <select style={s.input} name="priority" value={form.priority} onChange={handleChange} onFocus={inputFocus} onBlur={inputBlur}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div style={s.formGroup}>
            <label style={s.label}>Status</label>
            <select style={s.input} name="status" value={form.status} onChange={handleChange} onFocus={inputFocus} onBlur={inputBlur}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div style={s.footer}>
            <button style={s.btnGhost} onClick={onClose} disabled={loading}>Cancel</button>
            <button style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemModal;
