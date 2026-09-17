import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { api } from '../services/api';

export default function MultiDeviceModal({ isOpen, onClose, deferredPrompt, isInstallable }) {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('main'); // 'main' | 'client' | 'waiting'
  const [copied, setCopied] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState('qr'); // 'qr' | 'install' | 'network'
  const [localPrompt, setLocalPrompt] = useState(() => window.__pwa_prompt || null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setLocalPrompt(e);
      window.__pwa_prompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Load network info
  useEffect(() => {
    if (!isOpen) return;

    const fetchInfo = async () => {
      try {
        const data = await api.getNetworkInfo();
        setNetworkInfo(data);
      } catch (err) {
        console.warn('Could not fetch network info:', err);
        // Fallback to window.location
        const host = window.location.hostname;
        const port = window.location.port || '5000';
        setNetworkInfo({
          localIp: host === 'localhost' ? '192.168.1.4' : host,
          localUrl: `http://${host === 'localhost' ? '192.168.1.4' : host}:${port}`,
          clientPortalUrl: `http://${host === 'localhost' ? '192.168.1.4' : host}:${port}/?portal=client`,
          waitingScreenUrl: `http://${host === 'localhost' ? '192.168.1.4' : host}:${port}/?screen=waiting`,
          interfaces: []
        });
      }
    };

    fetchInfo();
  }, [isOpen]);

  // Determine current active URL based on selected target
  const getCurrentUrl = () => {
    const base = networkInfo?.localUrl || `http://${window.location.hostname}:5000`;
    if (selectedTarget === 'client') return `${base}/?portal=client`;
    if (selectedTarget === 'waiting') return `${base}/?screen=waiting`;
    return base;
  };

  const currentUrl = getCurrentUrl();

  // Generate QR Code whenever currentUrl changes
  useEffect(() => {
    if (!currentUrl) return;

    QRCode.toDataURL(currentUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0b3b60',
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('Error generating QR code:', err));
  }, [currentUrl]);

  // Copy URL to clipboard
  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      const el = document.createElement('textarea');
      el.value = currentUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Trigger PWA install
  const handleInstallApp = async () => {
    const activePrompt = deferredPrompt || localPrompt || window.__pwa_prompt;
    if (activePrompt) {
      activePrompt.prompt();
      const { outcome } = await activePrompt.userChoice;
      console.log('PWA outcome:', outcome);
    } else {
      alert('لتثبيت التطبيق على هذا الجهاز:\n• اضغط على أيقونة التثبيت (⊕) في شريط العنوان أعلى المتصفح (Chrome/Edge).\n• أو من القائمة (⋮) اختر "تثبيت Clini-Tech".');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          borderRadius: '16px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '2rem', lineHeight: 1 }}>📲</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0b3b60' }}>
                فتح النظام على أجهزة متعددة وتثبيت WebApp
              </h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                شارك الرابط أو امسح الباركود لفتح النظام على أي جهاز متصل بنفس شبكة الواي فاي
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* Server Status Badge */}
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #10b981',
          borderRadius: '10px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#065f46' }}>
              السيرفر نشط ومتصل بشبكة العيادة (Wi-Fi)
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 600 }}>
            IP الجهاز الرئيسي: <code style={{ backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>{networkInfo?.localIp || '192.168.1.4'}</code>
          </div>
        </div>

        {/* Navigation Tabs Inside Modal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '8px',
          backgroundColor: '#f1f5f9',
          padding: '6px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-arabic)',
              fontSize: '0.86rem',
              fontWeight: 700,
              backgroundColor: activeGuideTab === 'qr' ? '#ffffff' : 'transparent',
              color: activeGuideTab === 'qr' ? '#0b3b60' : 'var(--text-muted)',
              boxShadow: activeGuideTab === 'qr' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              whiteSpace: 'normal',
              textAlign: 'center'
            }}
            onClick={() => setActiveGuideTab('qr')}
          >
            <span>📷</span>
            <span>المسح بالباركود (QR)</span>
          </button>
          <button
            type="button"
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-arabic)',
              fontSize: '0.86rem',
              fontWeight: 700,
              backgroundColor: activeGuideTab === 'install' ? '#ffffff' : 'transparent',
              color: activeGuideTab === 'install' ? '#0b3b60' : 'var(--text-muted)',
              boxShadow: activeGuideTab === 'install' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              whiteSpace: 'normal',
              textAlign: 'center'
            }}
            onClick={() => setActiveGuideTab('install')}
          >
            <span>⬇️</span>
            <span>تثبيت كـ WebApp مستقل</span>
          </button>
          <button
            type="button"
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-arabic)',
              fontSize: '0.86rem',
              fontWeight: 700,
              backgroundColor: activeGuideTab === 'network' ? '#ffffff' : 'transparent',
              color: activeGuideTab === 'network' ? '#0b3b60' : 'var(--text-muted)',
              boxShadow: activeGuideTab === 'network' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              whiteSpace: 'normal',
              textAlign: 'center'
            }}
            onClick={() => setActiveGuideTab('network')}
          >
            <span>🌐</span>
            <span>شروط وطريقة الربط</span>
          </button>
        </div>

        {/* Tab 1: QR Code & Link */}
        {activeGuideTab === 'qr' && (
          <div>
            {/* Target Selector */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px', display: 'block' }}>
                اختر الصفحة المراد مشاركتها مع الجهاز الآخر:
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                {[
                  {
                    id: 'main',
                    icon: '💻',
                    title: 'لوحة التحكم والإدارة',
                    desc: 'للأطباء، الاستقبال، والمديرين'
                  },
                  {
                    id: 'client',
                    icon: '🩺',
                    title: 'بوابة المراجعين',
                    desc: 'لحجز كشف واستعلام المرضى'
                  },
                  {
                    id: 'waiting',
                    icon: '📺',
                    title: 'شاشة صالة الانتظار',
                    desc: 'لعرض الدور على شاشة التلفاز'
                  }
                ].map((target) => {
                  const isSelected = selectedTarget === target.id;
                  return (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setSelectedTarget(target.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        padding: '14px 12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-arabic)',
                        border: isSelected ? '2px solid #0284c7' : '1px solid var(--border-light)',
                        backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                        boxShadow: isSelected ? '0 4px 14px rgba(2, 132, 199, 0.18)' : 'var(--shadow-sm)',
                        transition: 'all 0.2s ease',
                        width: '100%',
                        boxSizing: 'border-box',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        outline: 'none'
                      }}
                    >
                      <span style={{ fontSize: '1.6rem', marginBottom: '6px', lineHeight: 1 }}>{target.icon}</span>
                      <strong style={{
                        fontSize: '0.92rem',
                        color: isSelected ? '#0369a1' : 'var(--text-main)',
                        marginBottom: '4px',
                        display: 'block',
                        lineHeight: '1.3'
                      }}>
                        {target.title}
                      </strong>
                      <span style={{
                        fontSize: '0.74rem',
                        color: isSelected ? '#0284c7' : 'var(--text-muted)',
                        lineHeight: '1.4',
                        display: 'block'
                      }}>
                        {target.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QR Card */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-light)',
              marginBottom: '16px'
            }}>
              {qrCodeUrl ? (
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  marginBottom: '14px'
                }}>
                  <img src={qrCodeUrl} alt="QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
                </div>
              ) : (
                <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  جارٍ إنشاء الباركود...
                </div>
              )}

              <p style={{ margin: '0 0 12px 0', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'center' }}>
                📸 افتح كاميرا هاتفك أو التابلت ووجّهها نحو الباركود لفتح النظام فوراً
              </p>

              {/* Direct URL input with copy */}
              <div style={{ display: 'flex', width: '100%', maxWidth: '480px', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="form-control"
                  style={{
                    direction: 'ltr',
                    textAlign: 'center',
                    fontWeight: 700,
                    backgroundColor: '#ffffff',
                    fontFamily: 'monospace',
                    fontSize: '0.95rem'
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
                  style={{ flexShrink: 0, minWidth: '100px', fontWeight: 700 }}
                >
                  {copied ? 'تم النسخ ✓' : '📋 نسخ الرابط'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PWA WebApp Install Instructions */}
        {activeGuideTab === 'install' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#1e40af', display: 'block' }}>
                  تثبيت Clini-Tech على هذا الجهاز كبرنامج مستقل
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#3b82f6' }}>
                  يعمل بدون شريط المتصفح وبسرعة فائقة مع أيقونة على سطح المكتب
                </span>
              </div>
              <button
                type="button"
                onClick={handleInstallApp}
                className="btn btn-primary"
                style={{ flexShrink: 0, fontWeight: 700 }}
              >
                ⬇️ تثبيت الآن
              </button>
            </div>

            {/* Platform Guides */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {/* Desktop */}
              <div style={{ border: '1px solid var(--border-light)', borderRadius: '10px', padding: '14px', backgroundColor: '#ffffff' }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0b3b60', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  💻 على أجهزة الكمبيوتر واللابتوب (Windows / Mac)
                </div>
                <ol style={{ paddingRight: '18px', margin: 0, fontSize: '0.83rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
                  <li>افتح الرابط في متصفح <strong>Google Chrome</strong> أو <strong>Microsoft Edge</strong>.</li>
                  <li>اضغط على أيقونة التثبيت (<strong>⊕</strong>) الظاهرة في أقصى يمين شريط الرابط.</li>
                  <li>أو اضغط على القائمة (⋮) ثم اختر <strong>"تثبيت Clini-Tech..." (Install)</strong>.</li>
                  <li>سيفتح النظام كنافذة تطبيق مستقلة وتظهر أيقونته على سطح المكتب.</li>
                </ol>
              </div>

              {/* Android */}
              <div style={{ border: '1px solid var(--border-light)', borderRadius: '10px', padding: '14px', backgroundColor: '#ffffff' }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0b3b60', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📱 على جوالات وتابلت Android (سامسونج، شاومي، إلخ)
                </div>
                <ol style={{ paddingRight: '18px', margin: 0, fontSize: '0.83rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
                  <li>امسح الباركود أو افتح الرابط في متصفح <strong>Chrome</strong>.</li>
                  <li>اضغط على القائمة (<strong>الثلاث نقاط ⋮</strong>) أعلى المتصفح.</li>
                  <li>اختر <strong>"تثبيت التطبيق" (Install app)</strong> أو <strong>"الإضافة للشاشة الرئيسية"</strong>.</li>
                  <li>سيعمل كتطبيق كامل مع وصول فوري بدون الحاجة لفتح المتصفح في كل مرة.</li>
                </ol>
              </div>

              {/* iOS */}
              <div style={{ border: '1px solid var(--border-light)', borderRadius: '10px', padding: '14px', backgroundColor: '#ffffff', gridColumn: '1 / -1' }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0b3b60', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🍏 على هواتف iPhone وأجهزة iPad (Apple iOS)
                </div>
                <ol style={{ paddingRight: '18px', margin: 0, fontSize: '0.83rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
                  <li>افتح الرابط في متصفح <strong>Safari</strong> الأساسي.</li>
                  <li>اضغط على زر المشاركة (<strong>Share ⎋</strong>) في الشريط السفلي.</li>
                  <li>مرر للأسفل واضغط على <strong>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen ➕)</strong>.</li>
                  <li>اضغط على <strong>"إضافة" (Add)</strong> بالأعلى لتجد تطبيق Clini-Tech جاهزاً على شاشتك.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Network & Multi-Device Setup */}
        {activeGuideTab === 'network' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px' }}>
              <strong style={{ fontSize: '0.92rem', color: '#92400e', display: 'block', marginBottom: '4px' }}>
                💡 شرط أساسي لفتح النظام على أكثر من جهاز:
              </strong>
              <div style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: '1.6' }}>
                يجب أن تكون الأجهزة (لابتوب الطبيب، شاشة الاستقبال، جوال التمريض، شاشة الانتظار) متصلة بـ <strong>نفس راوتر الواي فاي (Wi-Fi)</strong> المتصل به هذا الجهاز الرئيسي.
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-light)', borderRadius: '10px', padding: '16px', backgroundColor: '#ffffff' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0b3b60' }}>
                📋 أمثلة وسيناريوهات الاستخدام في العيادة:
              </h4>
              <ul style={{ paddingRight: '18px', margin: 0, fontSize: '0.85rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
                <li><strong>جهاز موظف الاستقبال (Reception):</strong> يسجل المرضى، يدير الحجوزات وطابور الانتظار، ويحصل المبالغ ويسجل السندات.</li>
                <li><strong>لابتوب / تابلت الطبيب (Doctor PC/Tablet):</strong> يدخل الطبيب بحسابه ليظهر له طابور كشوفاته فوراً، يكتب الروشتة ويرسلها واتساب أو يطبعها.</li>
                <li><strong>شاشة صالة الانتظار (Smart TV):</strong> افتح رابط شاشة الانتظار واضغط F11 لملء الشاشة، فينطق أسماء المرضى آلياً.</li>
                <li><strong>جوال المريض (Client Portal):</strong> يمسح المريض الباركود عند مدخل العيادة لحجز كشف جديد أو الاستعلام عن دوره في الطابور.</li>
              </ul>
            </div>

            {/* Multi-Interface Info if multiple IPs exist */}
            {networkInfo?.interfaces && networkInfo.interfaces.length > 1 && (
              <div style={{ border: '1px solid var(--border-light)', borderRadius: '10px', padding: '12px', backgroundColor: '#f8fafc' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  عناوين الشبكة البديلة المتاحة على هذا الجهاز:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {networkInfo.interfaces.map((net, i) => (
                    <span key={i} style={{ fontSize: '0.78rem', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', padding: '4px 8px', borderRadius: '6px' }}>
                      <strong>{net.name}:</strong> <code style={{ color: '#0284c7' }}>{net.url}</code>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Clini-Tech • نظام متزامن وفوري عبر تقنية WebSocket & REST
          </div>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
}
