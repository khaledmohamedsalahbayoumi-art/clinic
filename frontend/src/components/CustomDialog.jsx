import React, { useState, useEffect } from 'react';

export default function CustomDialog() {
  const [dialogState, setDialogState] = useState(null);

  useEffect(() => {
    const handleDialogEvent = (event) => {
      setDialogState(event.detail);
    };

    window.addEventListener('clinitech-custom-dialog', handleDialogEvent);
    return () => {
      window.removeEventListener('clinitech-custom-dialog', handleDialogEvent);
    };
  }, []);

  // Keyboard shortcut listener (Escape to close, Enter to confirm)
  useEffect(() => {
    if (!dialogState) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'Enter') {
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogState]);

  if (!dialogState) return null;

  const {
    type = 'warning',
    title,
    message,
    confirmText,
    cancelText,
    isConfirm,
    onConfirm,
    onCancel
  } = dialogState;

  const handleClose = () => {
    if (onCancel) onCancel();
    setDialogState(null);
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    setDialogState(null);
  };

  // Type configuration: colors, icons, badge styles
  const typeConfig = {
    warning: {
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      bg: '#fffbeb',
      border: '#fef3c7',
      primaryBtnBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      primaryBtnHover: '#b45309',
      accentColor: '#d97706'
    },
    danger: {
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ),
      bg: '#fff1f2',
      border: '#ffe4e6',
      primaryBtnBg: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
      primaryBtnHover: '#be123c',
      accentColor: '#e11d48'
    },
    success: {
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      bg: '#ecfdf5',
      border: '#d1fae5',
      primaryBtnBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      primaryBtnHover: '#047857',
      accentColor: '#059669'
    },
    info: {
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      ),
      bg: '#f0f9ff',
      border: '#e0f2fe',
      primaryBtnBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      primaryBtnHover: '#075985',
      accentColor: '#0284c7'
    }
  };

  const currentConfig = typeConfig[type] || typeConfig.warning;

  return (
    <div
      className="custom-dialog-overlay"
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100000,
        padding: '16px',
        animation: 'dialogOverlayFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        className="custom-dialog-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '430px',
          padding: '28px 24px 22px',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          textAlign: 'center',
          position: 'relative',
          animation: 'dialogCardZoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          direction: 'rtl'
        }}
      >
        {/* Animated Icon Badge */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: currentConfig.bg,
            border: `2px solid ${currentConfig.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 8px 20px -6px ${currentConfig.bg}`
          }}
        >
          {currentConfig.icon}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '10px',
            fontFamily: 'Cairo, sans-serif'
          }}
        >
          {title}
        </h3>

        {/* Message body */}
        <p
          style={{
            fontSize: '0.96rem',
            color: '#475569',
            lineHeight: 1.65,
            marginBottom: '24px',
            fontWeight: 500,
            whiteSpace: 'pre-line',
            fontFamily: 'Cairo, sans-serif'
          }}
        >
          {message}
        </p>

        {/* Buttons Action Area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            justifyContent: 'center'
          }}
        >
          {isConfirm ? (
            <>
              <button
                type="button"
                className="btn"
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: '11px 18px',
                  borderRadius: '14px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#94a3b8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
              >
                {cancelText || 'إلغاء'}
              </button>

              <button
                type="button"
                className="btn"
                onClick={handleConfirm}
                style={{
                  flex: 1.2,
                  padding: '11px 18px',
                  borderRadius: '14px',
                  border: 'none',
                  background: currentConfig.primaryBtnBg,
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.94rem',
                  cursor: 'pointer',
                  boxShadow: `0 4px 14px -3px ${currentConfig.accentColor}80`,
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 6px 18px -3px ${currentConfig.accentColor}aa`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = `0 4px 14px -3px ${currentConfig.accentColor}80`;
                }}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn"
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: '14px',
                border: 'none',
                background: currentConfig.primaryBtnBg,
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.96rem',
                cursor: 'pointer',
                boxShadow: `0 4px 16px -3px ${currentConfig.accentColor}80`,
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 6px 20px -3px ${currentConfig.accentColor}aa`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = `0 4px 16px -3px ${currentConfig.accentColor}80`;
              }}
            >
              {confirmText || 'حسناً، فهمت'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
