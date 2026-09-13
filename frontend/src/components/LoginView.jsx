import React, { useState } from 'react';

export default function LoginView({ onLoginSuccess, onSwitchToClient }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'فشل تسجيل الدخول، تأكد من صحة البيانات');
        setIsLoading(false);
        return;
      }

      // Successful login
      localStorage.setItem('clinic_user', JSON.stringify(data.user));
      localStorage.setItem('clinic_token', data.token);
      onLoginSuccess(data.user);
    } catch (err) {
      setErrorMsg('تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'var(--font-arabic)'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xl)',
        padding: '38px 32px',
        animation: 'fadeIn 0.25s ease'
      }}>
        {/* Header & Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'var(--primary-gradient)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 16px',
            boxShadow: '0 8px 20px rgba(2, 132, 199, 0.35)'
          }}>
            🏥
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '6px' }}>
            تسجيل الدخول لمنظومة الإدارة
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            أدخل اسم المستخدم وكلمة المرور للوصول إلى لوحة التحكم والعيادات
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'var(--rose-50)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--rose-600)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            marginBottom: '18px',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">اسم المستخدم (Username)</label>
            <input
              id="input-login-username"
              type="text"
              className="form-control"
              placeholder="أدخل اسم المستخدم"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ fontSize: '1rem', padding: '12px 14px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" style={{ margin: 0 }}>كلمة المرور (Password)</label>
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                  fontWeight: 600
                }}
              >
                {showLoginPassword ? '🙈 إخفاء' : '👁️ إظهار'}
              </button>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="input-login-password"
                type={showLoginPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ fontSize: '1rem', padding: '12px 14px', paddingLeft: '44px', direction: showLoginPassword ? 'ltr' : 'inherit', textAlign: showLoginPassword ? 'left' : 'right' }}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}
                title={showLoginPassword ? 'إخفاء كلمة المرور' : 'عرض كلمة المرور'}
              >
                {showLoginPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', fontWeight: 700 }}
            disabled={isLoading}
          >
            {isLoading ? 'جاري التحقق...' : '🔐 دخول إلى المنظومة'}
          </button>
        </form>

        {/* Back to Client Portal */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          borderTop: '1px solid var(--border-light)',
          paddingTop: '18px'
        }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onSwitchToClient}
            style={{ border: 'none', color: 'var(--text-muted)' }}
          >
            ← العودة لبوابة المراجعين والكلينت
          </button>
        </div>
      </div>
    </div>
  );
}
