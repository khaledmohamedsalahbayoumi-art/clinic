import React, { useState, useEffect, useRef } from 'react';

// Web Audio API friendly notification beep (works without any external files)
const playNotificationChime = (isUrgent = false) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isUrgent ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isUrgent ? 880 : 587.33, ctx.currentTime); // D5 or A5
    if (isUrgent) {
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    } else {
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    }

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Non-fatal if audio context is blocked by browser policy
  }
};

export default function InternalChatModal({
  isOpen,
  onClose,
  currentUser,
  messages = [],
  onSendMessage,
  onMarkRead
}) {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const prevMessagesCount = useRef(messages.length);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (onMarkRead && currentUser) {
        onMarkRead(currentUser.role);
      }
    }
  }, [isOpen, messages]);

  // Audio notification when new incoming message arrives
  useEffect(() => {
    if (messages.length > prevMessagesCount.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.senderRole !== currentUser?.role) {
        playNotificationChime(lastMsg.type === 'urgent');
      }
    }
    prevMessagesCount.current = messages.length;
  }, [messages, currentUser]);

  if (!isOpen) return null;

  const currentRole = currentUser?.role || 'staff';
  const isDoctor = currentRole === 'doctor';
  const isReception = currentRole === 'reception';

  // Preset quick messages tailored for doctors & secretaries
  const quickActions = [
    { label: '🟢 المريض القادم يتفضل بالدخول', text: 'المريض القادم يتفضل بالدخول لغرفة الكشف 🩺', type: 'quick_action', forRole: 'doctor' },
    { label: '⏳ جاهز للحالة التالية', text: 'أنا جاهز للكشف التالي، يرجى توجيه المريض 🩺', type: 'quick_action', forRole: 'doctor' },
    { label: '📁 تحضير ملف وفحوصات المريض', text: 'برجاء إحضار ملف وفحوصات المريض لغرفة الكشف 📋', type: 'quick_action', forRole: 'doctor' },
    { label: '☕ استراحة 5 دقائق', text: 'استراحة قصيرة لمدة 5 دقائق وسنستأنف الكشف مباشرة ☕', type: 'quick_action', forRole: 'doctor' },
    { label: '🚨 كشف مستعجل / طارئ', text: 'يوجد مريض حالة طارئة ومستعجلة بالخارج، هل يمكن إدخاله الآن؟ 🚨', type: 'urgent', forRole: 'reception' },
    { label: '📋 المريض في صالة الانتظار', text: 'المريض القادم وصل وجاهز في صالة الانتظار 👥', type: 'quick_action', forRole: 'reception' },
    { label: '💉 تم قياس العلامات الحيوية', text: 'تم قياس الضغط والحرارة للمريض وتسجيلها في الملف 🩺', type: 'quick_action', forRole: 'reception' }
  ];

  // Filter actions based on role (or show all if owner)
  const availableActions = quickActions.filter(
    qa => currentRole === 'owner' || qa.forRole === currentRole || !qa.forRole
  );

  const handleSend = async (textToSend, msgType = 'text') => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage({
        text: text.trim(),
        senderName: currentUser?.name || 'مستخدم المنظومة',
        senderRole: currentUser?.role || 'staff',
        senderId: currentUser?.id || '',
        recipientRole: isDoctor ? 'reception' : isReception ? 'doctor' : 'all',
        type: msgType
      });
      setInputText('');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="custom-dialog-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
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
          maxWidth: '560px',
          height: '620px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(226, 232, 240, 0.9)',
          overflow: 'hidden',
          animation: 'dialogCardZoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          direction: 'rtl'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px',
            background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem'
              }}
            >
              💬
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'Cairo, sans-serif' }}>
                  جهاز الاتصال الداخلي (Intercom)
                </h3>
                <span
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'inline-block' }}></span>
                  مباشر
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9, marginTop: '2px' }}>
                محادثة فورية وسريعة بين غرفة الكشف ومكتب الاستقبال
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
          >
            ✕
          </button>
        </div>

        {/* Quick Action Chips (النداء السريع بنقرة واحدة) */}
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>⚡ رسائل سريعة بنقرة واحدة (بدون كتابة):</span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'thin'
            }}
          >
            {availableActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action.text, action.type)}
                disabled={isSending}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '12px',
                  border: action.type === 'urgent' ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                  backgroundColor: action.type === 'urgent' ? '#fef2f2' : '#ffffff',
                  color: action.type === 'urgent' ? '#dc2626' : '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            backgroundColor: '#ffffff'
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                margin: 'auto',
                textAlign: 'center',
                color: '#94a3b8',
                padding: '40px 20px'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🩺💬📋</div>
              <h4 style={{ color: '#475569', fontWeight: 800, margin: '0 0 6px' }}>
                قناة المحادثة الداخلية فارغة
              </h4>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                استخدم الأزرار السريعة بالأعلى لتوجيه المريض أو كتابة أي رسالة فورية للاستقبال.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderRole === currentRole;
              const isUrgent = msg.type === 'urgent';
              const isQuick = msg.type === 'quick_action';

              // Role badge visuals
              const roleBadge =
                msg.senderRole === 'doctor'
                  ? { label: 'الطبيب 🩺', bg: '#e0f2fe', color: '#0369a1' }
                  : msg.senderRole === 'reception'
                  ? { label: 'الاستقبال 📋', bg: '#ecfdf5', color: '#047857' }
                  : { label: 'الإدارة 👑', bg: '#fef3c7', color: '#b45309' };

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start'
                  }}
                >
                  {/* Sender title & badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '4px',
                      fontSize: '0.76rem'
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#334155' }}>
                      {isMine ? 'أنت' : msg.senderName}
                    </span>
                    <span
                      style={{
                        backgroundColor: roleBadge.bg,
                        color: roleBadge.color,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.68rem'
                      }}
                    >
                      {roleBadge.label}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                      {msg.timeFormatted}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: isMine ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                      backgroundColor: isUrgent
                        ? '#fff1f2'
                        : isMine
                        ? '#0284c7'
                        : isQuick
                        ? '#f0fdf4'
                        : '#f1f5f9',
                      color: isUrgent ? '#9f1239' : isMine ? '#ffffff' : '#0f172a',
                      border: isUrgent
                        ? '1.5px solid #fecdd3'
                        : isQuick && !isMine
                        ? '1px solid #bbf7d0'
                        : 'none',
                      boxShadow: isUrgent
                        ? '0 4px 14px rgba(225, 29, 72, 0.15)'
                        : '0 2px 5px rgba(0, 0, 0, 0.04)',
                      fontSize: '0.94rem',
                      lineHeight: 1.5,
                      fontWeight: isUrgent || isQuick ? 700 : 500
                    }}
                  >
                    {isUrgent && (
                      <span style={{ display: 'inline-block', marginLeft: '6px', fontSize: '1rem' }}>
                        🚨
                      </span>
                    )}
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <input
            type="text"
            className="input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالة سريعة واضغط Enter..."
            disabled={isSending}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '14px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.95rem',
              backgroundColor: '#ffffff',
              fontFamily: 'Cairo, sans-serif'
            }}
          />

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSend()}
            disabled={isSending || !inputText.trim()}
            style={{
              padding: '11px 20px',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minWidth: '95px',
              justifyContent: 'center'
            }}
          >
            {isSending ? '...' : 'إرسال 🚀'}
          </button>
        </div>
      </div>
    </div>
  );
}
