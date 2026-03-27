import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useData from '../hooks/useData';
import ItemModal from '../components/ItemModal';
import Spinner from '../components/Spinner';
import { showToast } from '../components/Toast';

const TABS = [
  { id: 'task',  label: 'Tasks',  icon: '✓' },
  { id: 'lead',  label: 'Leads',  icon: '◎' },
  { id: 'user',  label: 'Team',   icon: '⊙' },
];

const STATUS_COLORS = {
  active:    { bg: 'rgba(16,208,120,0.12)',  color: '#10d078' },
  pending:   { bg: 'rgba(245,165,36,0.12)',  color: '#f5a524' },
  completed: { bg: 'rgba(79,142,247,0.12)',  color: '#4f8ef7' },
  inactive:  { bg: 'rgba(107,122,153,0.12)', color: '#6b7a99' },
};

const PRIORITY_COLORS = {
  high:   { bg: 'rgba(240,74,90,0.1)',   color: '#f04a5a' },
  medium: { bg: 'rgba(245,165,36,0.1)',  color: '#f5a524' },
  low:    { bg: 'rgba(107,122,153,0.1)', color: '#6b7a99' },
};

// ── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { items, loading, fetchItems, createItem, updateItem, deleteItem } = useData();

  const [activeTab, setActiveTab] = useState('task');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch on mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ── Derived data ───────────────────────────────────────────────────────────
  const byCategory = useCallback(
    (cat) => items.filter((i) => i.category === cat),
    [items]
  );

  const stats = {
    totalTasks: byCategory('task').length,
    completedTasks: items.filter((i) => i.category === 'task' && i.status === 'completed').length,
    activeLeads: items.filter((i) => i.category === 'lead' && i.status === 'active').length,
    totalLeads: byCategory('lead').length,
    activeUsers: items.filter((i) => i.category === 'user' && i.status === 'active').length,
    totalUsers: byCategory('user').length,
    pendingTasks: items.filter((i) => i.category === 'task' && i.status === 'pending').length,
  };

  const visibleItems = byCategory(activeTab);

  // ── Modal handlers ─────────────────────────────────────────────────────────
  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleSubmit = async (formData) => {
    setModalLoading(true);
    const result = editItem
      ? await updateItem(editItem._id, formData)
      : await createItem(formData);
    setModalLoading(false);

    if (result.success) {
      showToast(editItem ? 'Item updated!' : 'Item created!', 'success');
      closeModal();
    } else {
      showToast(result.message || 'Something went wrong.', 'error');
    }
    return result;
  };

  const confirmDelete = (item) => setDeleteConfirm(item);
  const cancelDelete = () => setDeleteConfirm(null);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const result = await deleteItem(deleteConfirm._id);
    setDeleteConfirm(null);
    if (result.success) {
      showToast('Item deleted.', 'success');
    } else {
      showToast(result.message || 'Delete failed.', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const css = styles();

  return (
    <div style={css.root}>
      {/* ── Sidebar ── */}
      <aside style={css.sidebar}>
        <div style={css.sidebarLogo}>
          <div style={css.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={css.logoName}>Nexus</span>
        </div>

        <nav style={css.nav}>
          <span style={css.navLabel}>Workspace</span>
          <div style={{ ...css.navItem, ...css.navItemActive }}>
            <span>⊞</span> Dashboard
          </div>
          {TABS.map((tab) => (
            <div
              key={tab.id}
              style={{ ...css.navItem, ...(activeTab === tab.id ? css.navItemActive : {}) }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span> {tab.label}
            </div>
          ))}
        </nav>

        <div style={css.sidebarFooter}>
          <div style={css.userCard}>
            <div style={css.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div style={css.userInfo}>
              <div style={css.userName}>{user?.name}</div>
              <div style={css.userEmail}>{user?.email}</div>
            </div>
            <button style={css.logoutIconBtn} onClick={handleLogout} title="Sign out">⏻</button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={css.main}>
        {/* Topbar */}
        <header style={css.topbar}>
          <div>
            <h1 style={css.topbarTitle}>Good day, {user?.name?.split(' ')[0]} 👋</h1>
            <p style={css.topbarSub}>Here's what's happening in your workspace.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={css.btnPrimary} onClick={openCreate}>+ New Item</button>
            <button style={css.btnGhost} onClick={handleLogout}>Sign Out</button>
          </div>
        </header>

        <div style={css.content}>
          {/* Stats */}
          <div style={css.statsGrid}>
            {[
              { label: 'Total Tasks', value: stats.totalTasks, sub: `${stats.completedTasks} completed`, color: '#4f8ef7' },
              { label: 'Active Leads', value: stats.activeLeads, sub: `of ${stats.totalLeads} total`, color: '#10d078' },
              { label: 'Team Members', value: stats.activeUsers, sub: `${stats.totalUsers} total`, color: '#9c7dff' },
              { label: 'Pending Tasks', value: stats.pendingTasks, sub: 'need attention', color: '#f5a524' },
            ].map((stat, i) => (
              <div key={i} style={css.statCard}>
                <div style={css.statLabel}>{stat.label}</div>
                <div style={{ ...css.statValue, color: stat.color }}>{stat.value}</div>
                <div style={css.statSub}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={css.sectionTitle}>Data Management</h2>
          </div>

          <div style={css.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                style={{ ...css.tab, ...(activeTab === tab.id ? css.tabActive : {}) }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label} ({byCategory(tab.id).length})
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={css.tableWrapper}>
            {loading ? (
              <Spinner />
            ) : visibleItems.length === 0 ? (
              <div style={css.emptyState}>
                <div style={css.emptyIcon}>{TABS.find(t => t.id === activeTab)?.icon}</div>
                <div style={css.emptyTitle}>No {activeTab}s yet. Create one!</div>
                <button style={{ ...css.btnPrimary, marginTop: 16 }} onClick={openCreate}>+ Add {activeTab}</button>
              </div>
            ) : (
              <table style={css.table}>
                <thead>
                  <tr>
                    <th style={css.th}>Item</th>
                    <th style={css.th}>Status</th>
                    <th style={css.th}>Priority</th>
                    <th style={css.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item) => (
                    <tr key={item._id} style={css.tr}>
                      <td style={css.td}>
                        <div style={css.tdTitle}>{item.title}</div>
                        {item.description && <div style={css.tdDesc}>{item.description}</div>}
                      </td>
                      <td style={css.td}>
                        <StatusBadge status={item.status} />
                      </td>
                      <td style={css.td}>
                        <PriorityChip priority={item.priority} />
                      </td>
                      <td style={css.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <IconBtn onClick={() => openEdit(item)} title="Edit">✎</IconBtn>
                          <IconBtn onClick={() => confirmDelete(item)} title="Delete" danger>✕</IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      <ItemModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editItem={editItem}
        defaultCategory={activeTab}
        loading={modalLoading}
      />

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div style={css.confirmOverlay} onClick={cancelDelete}>
          <div style={css.confirmBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
              Delete Item
            </h3>
            <p style={{ color: '#6b7a99', fontSize: 14, marginBottom: 24 }}>
              Are you sure you want to delete "<strong style={{ color: '#e8edf5' }}>{deleteConfirm.title}</strong>"? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={css.btnGhost} onClick={cancelDelete}>Cancel</button>
              <button style={css.btnDanger} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.inactive;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: c.bg, color: c.color,
      fontSize: 11.5, fontWeight: 500,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
      {status}
    </span>
  );
};

const PriorityChip = ({ priority }) => {
  const c = PRIORITY_COLORS[priority] || PRIORITY_COLORS.low;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      background: c.bg, color: c.color,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase',
    }}>
      {priority}
    </span>
  );
};

const IconBtn = ({ children, onClick, title, danger }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 30, height: 30, borderRadius: 6,
        border: `1px solid ${hovered && danger ? 'rgba(240,74,90,0.25)' : 'rgba(99,160,255,0.1)'}`,
        background: hovered ? (danger ? 'rgba(240,74,90,0.1)' : '#1c2540') : 'transparent',
        color: hovered ? (danger ? '#f04a5a' : '#e8edf5') : '#6b7a99',
        cursor: 'pointer', fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = () => ({
  root: { display: 'flex', minHeight: '100vh', background: '#080c14', color: '#e8edf5', fontFamily: "'DM Sans', sans-serif" },
  sidebar: {
    width: 240, minHeight: '100vh',
    background: '#0f1623', borderRight: '1px solid rgba(99,160,255,0.1)',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
  },
  sidebarLogo: { padding: '22px 20px', borderBottom: '1px solid rgba(99,160,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 32, height: 32, background: 'linear-gradient(135deg, #4f8ef7, #7c5fe6)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoName: { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' },
  nav: { flex: 1, padding: '16px 12px', overflowY: 'auto' },
  navLabel: { fontSize: 10, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#3d4d6a', padding: '0 8px', display: 'block', margin: '16px 0 6px' },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#6b7a99', marginBottom: 2, transition: 'all 0.15s' },
  navItemActive: { background: 'rgba(79,142,247,0.12)', color: '#4f8ef7', fontWeight: 500 },
  sidebarFooter: { padding: '16px 12px', borderTop: '1px solid rgba(99,160,255,0.06)' },
  userCard: { display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, background: '#161e2e' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4f8ef7, #9c7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 13, fontWeight: 500, color: '#e8edf5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { fontSize: 11, color: '#3d4d6a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutIconBtn: { color: '#3d4d6a', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 2 },
  main: { marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' },
  topbar: { height: 64, background: '#0f1623', borderBottom: '1px solid rgba(99,160,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50 },
  topbarTitle: { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' },
  topbarSub: { fontSize: 13, color: '#6b7a99', marginTop: 2 },
  content: { padding: 32, flex: 1 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 },
  statCard: { background: '#0f1623', border: '1px solid rgba(99,160,255,0.1)', borderRadius: 12, padding: 20 },
  statLabel: { fontSize: 11, fontWeight: 500, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#6b7a99', marginBottom: 10 },
  statValue: { fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 },
  statSub: { fontSize: 12, color: '#3d4d6a', marginTop: 6 },
  sectionTitle: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' },
  tabs: { display: 'flex', gap: 4, background: '#0f1623', border: '1px solid rgba(99,160,255,0.1)', borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content' },
  tab: { padding: '8px 20px', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#6b7a99', border: 'none', background: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' },
  tabActive: { background: '#161e2e', color: '#e8edf5', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' },
  tableWrapper: { background: '#0f1623', border: '1px solid rgba(99,160,255,0.1)', borderRadius: 12, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '14px 20px', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#3d4d6a', borderBottom: '1px solid rgba(99,160,255,0.08)', background: '#161e2e' },
  tr: { borderBottom: '1px solid rgba(99,160,255,0.06)' },
  td: { padding: '14px 20px', fontSize: 14, verticalAlign: 'middle' },
  tdTitle: { fontWeight: 500, color: '#e8edf5' },
  tdDesc: { fontSize: 12, color: '#6b7a99', marginTop: 2 },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#6b7a99' },
  emptyIcon: { fontSize: 36, marginBottom: 12, opacity: 0.4 },
  emptyTitle: { fontSize: 15, fontWeight: 500 },
  btnPrimary: { padding: '8px 18px', background: '#4f8ef7', border: 'none', borderRadius: 7, color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 500, cursor: 'pointer' },
  btnGhost: { padding: '8px 16px', background: 'transparent', border: '1px solid rgba(99,160,255,0.12)', borderRadius: 7, color: '#6b7a99', fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 500, cursor: 'pointer' },
  btnDanger: { padding: '8px 18px', background: 'rgba(240,74,90,0.12)', border: '1px solid rgba(240,74,90,0.25)', borderRadius: 7, color: '#f04a5a', fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 500, cursor: 'pointer' },
  confirmOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  confirmBox: { background: '#0f1623', border: '1px solid rgba(99,160,255,0.12)', borderRadius: 14, padding: 28, maxWidth: 420, width: '90%' },
});

export default Dashboard;
