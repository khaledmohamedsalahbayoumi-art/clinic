import React from 'react';

export default function Navbar({
  activePortal,
  setActivePortal,
  currentUser,
  onLogout,
  selectedBranch,
  setSelectedBranch,
  branches,
  onToggleSidebar
}) {
  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 95,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Top Banner with Brand & Portal Switcher */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activePortal === 'admin' && currentUser && (
            <button
              type="button"
              id="btn-toggle-sidebar"
              className="navbar-sidebar-toggle only-mobile"
              onClick={onToggleSidebar}
              title="فتح أو طي القائمة الجانبية"
            >
              ☰
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.png"
              alt="Clini-Tech كليني تك"
              style={{
                height: '44px',
                maxWidth: '220px',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            <span className="badge badge-primary no-mobile" style={{ fontSize: '0.75rem', alignSelf: 'center' }}>
              نظام إدارة المراكز الطبية
            </span>
          </div>
        </div>

        {/* Portal Switcher (Admin vs Client) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)'
        }}>
          <button
            id="btn-switch-admin"
            className={`btn btn-sm ${activePortal === 'admin' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              border: 'none',
              boxShadow: activePortal === 'admin' ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700
            }}
            onClick={() => setActivePortal('admin')}
          >
            ⚙️ قسم الإدارة والعيادات
          </button>
          <button
            id="btn-switch-client"
            className={`btn btn-sm ${activePortal === 'client' ? 'btn-teal' : 'btn-outline'}`}
            style={{
              border: 'none',
              boxShadow: activePortal === 'client' ? '0 2px 8px rgba(20, 184, 166, 0.25)' : 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700
            }}
            onClick={() => setActivePortal('client')}
          >
            🩺 بوابة المراجعين والكلينت
          </button>
        </div>

        {/* Admin User Info & Branch Selector */}
        {activePortal === 'admin' && currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* Branch Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>الفرع:</span>
              <select
                id="select-branch"
                className="form-control"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.88rem', fontWeight: 600 }}
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="all">🌐 كل الفروع (مجمع)</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>📍 {b.name}</option>
                ))}
              </select>
            </div>

            {/* Logged-in User Profile Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--primary-50)',
              border: '1px solid var(--primary-200)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)'
            }}>
              <span style={{ fontSize: '1.2rem' }}>
                {currentUser.role === 'owner' ? '👑' :
                 currentUser.role === 'doctor' ? '🩺' :
                 currentUser.role === 'manager' ? '🏢' :
                 currentUser.role === 'accountant' ? '💰' : '📋'}
              </span>
              <div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--primary-800)', display: 'block', lineHeight: 1.2 }}>
                  {currentUser.name}
                </strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary-600)' }}>
                  {currentUser.title || currentUser.role}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              id="btn-logout"
              className="btn btn-outline btn-sm"
              onClick={onLogout}
              style={{
                color: 'var(--rose-600)',
                borderColor: 'rgba(244, 63, 94, 0.3)',
                fontWeight: 600
              }}
              title="تسجيل الخروج من لوحة التحكم"
            >
              🚪 خروج
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
