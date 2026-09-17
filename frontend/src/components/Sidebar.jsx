import React from 'react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  allowedTabs = [],
  waitingCount = 0,
  currentUser,
  onLogout,
  selectedBranch,
  branches = [],
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onNewBooking,
  onOpenWaitingScreen,
  onOpenMultiDevice
}) {
  // Navigation items grouped by category
  const menuGroups = [
    {
      title: 'الرئيسية والكشوفات',
      items: [
        {
          id: 'dashboard',
          label: 'لوحة المؤشرات',
          subLabel: 'نظرة عامة وإحصائيات',
          icon: '📊',
          badge: null
        },
        {
          id: 'queue',
          label: 'طابور الانتظار والكشوفات',
          subLabel: 'إدارة دور المرضى اليوم',
          icon: '📋',
          badge: waitingCount > 0 ? waitingCount : null,
          badgeColor: '#ef4444'
        },
        {
          id: 'patients',
          label: 'سجلات المرضى (EMR)',
          subLabel: 'الملفات والتاريخ الطبي',
          icon: '📂',
          badge: null
        }
      ]
    },
    {
      title: 'الخدمات الطبية والمالية',
      items: [
        {
          id: 'prescriptions',
          label: 'الروشتات والتحاليل',
          subLabel: 'الوصفات والطلبات المخبرية',
          icon: '📝',
          badge: null
        },
        {
          id: 'finances',
          label: 'الخزينة والمصروفات',
          subLabel: 'الإيرادات والسندات المالية',
          icon: '💰',
          badge: null
        }
      ]
    },
    {
      title: 'إدارة النظام',
      items: [
        {
          id: 'settings',
          label: 'المستخدمين والصلاحيات',
          subLabel: 'تهيئة الأطباء والفروع',
          icon: '⚙️',
          badge: null
        }
      ]
    }
  ];

  // Helper to find current branch name
  const currentBranchName = selectedBranch === 'all'
    ? 'كل الفروع (مجمع)'
    : (branches.find(b => b.id === selectedBranch)?.name || 'الفرع الرئيسي');

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
          title="إغلاق القائمة الجانبية"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        aria-label="القائمة الجانبية الرئيسية"
      >
        {/* Sleek Top Header - Without Duplicate Brand */}
        <div className="sidebar-header">
          {!isCollapsed ? (
            <div className="sidebar-branch-info">
              <span className="sidebar-branch-label">الفرع النشط</span>
              <span className="sidebar-branch-name" title={currentBranchName}>
                📍 {currentBranchName}
              </span>
            </div>
          ) : (
            <div className="sidebar-mini-icon" title={currentBranchName}>
              📍
            </div>
          )}

          {/* Desktop Toggle Collapse Button */}
          <button
            type="button"
            className="sidebar-collapse-btn no-mobile"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
          >
            ☰
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            className="sidebar-close-btn only-mobile"
            onClick={() => setIsMobileOpen(false)}
            title="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Quick Action Button - Single Prominent Button */}
        <div className="sidebar-quick-actions-container">
          {!isCollapsed ? (
            <button
              type="button"
              className="sidebar-btn-primary"
              onClick={() => {
                if (onNewBooking) onNewBooking();
                setIsMobileOpen(false);
              }}
            >
              <span className="sidebar-btn-icon">➕</span>
              <span>حجز كشف جديد</span>
            </button>
          ) : (
            <div className="sidebar-actions-collapsed">
              <button
                type="button"
                className="sidebar-btn-mini primary"
                onClick={() => {
                  if (onNewBooking) onNewBooking();
                  setIsMobileOpen(false);
                }}
                title="حجز كشف جديد"
              >
                ➕
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu Links */}
        <div className="sidebar-nav-container">
          {menuGroups.map((group, gIdx) => {
            // Filter items user has permissions for
            const visibleItems = group.items.filter(item => allowedTabs.includes(item.id));
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="sidebar-group">
                {!isCollapsed && (
                  <div className="sidebar-group-title">
                    {group.title}
                  </div>
                )}

                <ul className="sidebar-nav-list">
                  {visibleItems.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                      <li key={item.id} className="sidebar-nav-item">
                        <button
                          type="button"
                          className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileOpen(false);
                          }}
                          title={isCollapsed ? `${item.label} - ${item.subLabel}` : undefined}
                        >
                          {/* Modern Icon Tile */}
                          <span className={`sidebar-item-tile ${isActive ? 'active' : ''}`}>
                            {item.icon}
                          </span>
                          
                          {!isCollapsed && (
                            <div className="sidebar-item-content">
                              <span className="sidebar-item-label">{item.label}</span>
                              <span className="sidebar-item-desc">{item.subLabel}</span>
                            </div>
                          )}

                          {/* Item Badge (e.g. Waiting Count) */}
                          {item.badge !== null && item.badge !== undefined && (
                            <span
                              className={`sidebar-item-badge ${item.badge > 0 ? 'badge-pulse' : ''}`}
                              style={{ backgroundColor: item.badgeColor || '#0284c7' }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Multi-Device & PWA Connect Action */}
        <div style={{ padding: isCollapsed ? '8px 4px' : '8px 12px', borderTop: '1px solid var(--border-light)' }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              if (onOpenMultiDevice) onOpenMultiDevice();
              setIsMobileOpen(false);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '10px',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-700)',
              border: '1px solid var(--primary-200)',
              borderRadius: 'var(--radius-md)',
              padding: isCollapsed ? '8px' : '8px 12px',
              fontWeight: 700,
              fontSize: '0.84rem'
            }}
            title="فتح النظام على أجهزة متعددة وتثبيت WebApp"
          >
            <span style={{ fontSize: '1.1rem' }}>📲</span>
            {!isCollapsed && <span>ربط الأجهزة والتطبيق</span>}
          </button>
        </div>

        {/* Sidebar Footer / User Profile Card */}
        {currentUser && (
          <div className="sidebar-footer">
            <div className="sidebar-user-card">
              <div className="sidebar-user-avatar">
                {currentUser.role === 'owner' ? '👑' :
                 currentUser.role === 'doctor' ? '🩺' :
                 currentUser.role === 'manager' ? '🏢' :
                 currentUser.role === 'accountant' ? '💰' : '📋'}
              </div>

              {!isCollapsed && (
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name" title={currentUser.name}>
                    {currentUser.name}
                  </span>
                  <span className="sidebar-user-role">
                    {currentUser.title || currentUser.role}
                  </span>
                </div>
              )}

              <button
                type="button"
                className="sidebar-logout-btn"
                onClick={onLogout}
                title="تسجيل الخروج"
              >
                🚪
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
