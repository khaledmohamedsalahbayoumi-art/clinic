import React from 'react';

export default function BottomNav({
  activePortal,
  setActivePortal,
  activeTab,
  setActiveTab,
  allowedTabs = [],
  waitingCount = 0,
  currentUser
}) {
  if (activePortal === 'admin' && !currentUser) {
    return null; // Don't show bottom nav on login screen
  }

  return (
    <nav className="mobile-bottom-nav">
      {activePortal === 'admin' ? (
        /* Admin Navigation Items */
        <div className="bottom-nav-container">
          {allowedTabs.includes('dashboard') && (
            <button
              className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="bottom-nav-icon">📊</span>
              <span className="bottom-nav-label">الرئيسية</span>
            </button>
          )}

          {allowedTabs.includes('queue') && (
            <button
              className={`bottom-nav-item ${activeTab === 'queue' ? 'active' : ''}`}
              onClick={() => setActiveTab('queue')}
            >
              <span className="bottom-nav-icon" style={{ position: 'relative' }}>
                📋
                {waitingCount > 0 && (
                  <span className="bottom-nav-badge">{waitingCount}</span>
                )}
              </span>
              <span className="bottom-nav-label">الطابور</span>
            </button>
          )}

          {allowedTabs.includes('patients') && (
            <button
              className={`bottom-nav-item ${activeTab === 'patients' ? 'active' : ''}`}
              onClick={() => setActiveTab('patients')}
            >
              <span className="bottom-nav-icon">📂</span>
              <span className="bottom-nav-label">المرضى</span>
            </button>
          )}

          {allowedTabs.includes('prescriptions') && (
            <button
              className={`bottom-nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('prescriptions')}
            >
              <span className="bottom-nav-icon">📝</span>
              <span className="bottom-nav-label">الروشتات</span>
            </button>
          )}

          {allowedTabs.includes('finances') && (
            <button
              className={`bottom-nav-item ${activeTab === 'finances' ? 'active' : ''}`}
              onClick={() => setActiveTab('finances')}
            >
              <span className="bottom-nav-icon">💰</span>
              <span className="bottom-nav-label">الخزينة</span>
            </button>
          )}

          {allowedTabs.includes('settings') && (
            <button
              className={`bottom-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="bottom-nav-icon">⚙️</span>
              <span className="bottom-nav-label">الصلاحيات</span>
            </button>
          )}
        </div>
      ) : (
        /* Client Portal Navigation Items */
        <div className="bottom-nav-container">
          <button
            className={`bottom-nav-item ${activeTab === 'client-home' ? 'active' : ''}`}
            onClick={() => setActiveTab('client-home')}
          >
            <span className="bottom-nav-icon">🩺</span>
            <span className="bottom-nav-label">الأطباء</span>
          </button>
          <button
            className="bottom-nav-item"
            onClick={() => {
              const el = document.getElementById('booking-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="bottom-nav-icon">📅</span>
            <span className="bottom-nav-label">حجز موعد</span>
          </button>
          <button
            className="bottom-nav-item"
            onClick={() => {
              const el = document.getElementById('my-history-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="bottom-nav-icon">📁</span>
            <span className="bottom-nav-label">ملفي وسجلاتي</span>
          </button>
          <button
            className="bottom-nav-item"
            onClick={() => setActivePortal('admin')}
          >
            <span className="bottom-nav-icon">🔐</span>
            <span className="bottom-nav-label">دخول الإدارة</span>
          </button>
        </div>
      )}
    </nav>
  );
}
