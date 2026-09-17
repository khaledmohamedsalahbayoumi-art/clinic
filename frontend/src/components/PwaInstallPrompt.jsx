import React, { useState, useEffect } from 'react';

export default function PwaInstallPrompt({ onOpenMultiDevice }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('pwa_prompt_dismissed') === 'true';
  });

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isStandalone) {
      setIsIos(true);
    }

    // Capture standard PWA install event (Chrome, Edge, Android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect if successfully installed
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('🎉 Clini-Tech WebApp installed successfully!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIos) {
        setShowIosGuide(true);
      } else if (onOpenMultiDevice) {
        onOpenMultiDevice();
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isDismissed) return null;
  if (!isInstallable && !isIos) return null;

  return (
    <div className="pwa-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src="/logo.png"
          alt="Clini-Tech"
          style={{
            height: '38px',
            maxWidth: '120px',
            objectFit: 'contain',
            flexShrink: 0
          }}
        />
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
            تثبيت تطبيق Clini-Tech (WebApp)
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            إدارة أسهل.. رعاية أفضل • استخدم النظام كتطبيق مستقل على جهازك لسرعة أعلى وسهولة وصول
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className="btn btn-sm btn-primary"
          style={{ borderRadius: 'var(--radius-full)', fontWeight: 700, padding: '6px 16px' }}
          onClick={handleInstallClick}
        >
          ⬇️ تثبيت التطبيق الآن
        </button>
        {onOpenMultiDevice && (
          <button
            className="btn btn-sm btn-outline"
            style={{ borderRadius: 'var(--radius-full)', fontWeight: 700, padding: '6px 14px' }}
            onClick={onOpenMultiDevice}
          >
            📲 فتح على أجهزة أخرى
          </button>
        )}
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '4px'
          }}
          title="إغلاق"
        >
          ✕
        </button>
      </div>

      {/* iOS Instructions Modal */}
      {showIosGuide && (
        <div className="modal-overlay" onClick={() => setShowIosGuide(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🍎</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>تثبيت التطبيق على iPhone / iPad</h3>
            </div>
            <ol style={{ paddingRight: '20px', fontSize: '0.92rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
              <li>اضغط على زر <strong>المشاركة (Share ⎋)</strong> في أسفل متصفح Safari.</li>
              <li>مرر للأسفل واضغط على <strong>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen ➕)</strong>.</li>
              <li>اضغط على <strong>"إضافة" (Add)</strong> بالأعلى لتجد أيقونة التطبيق على شاشتك فوراً.</li>
            </ol>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowIosGuide(false)}>
                فهمت ذلك ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
