import React, { useState, useEffect } from 'react';

export default function WaitingRoomScreen({ appointments, branches, onClose }) {
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter appointments for today
  const todayApts = appointments.filter(a => {
    if (selectedBranch !== 'all' && a.branchId !== selectedBranch) return false;
    return true;
  });

  // Current patient inside clinic
  const inProgressApts = todayApts.filter(a => a.status === 'in_progress');
  // Next in line waiting
  const waitingApts = todayApts.filter(a => a.status === 'waiting').slice(0, 4);

  // Play realistic hospital chime bell using Web Audio API
  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(587.33, now, 0.4); // D5
      playTone(880.00, now + 0.25, 0.8); // A5
    } catch (e) {
      console.log('Audio chime not allowed or supported:', e);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen().catch(err => console.log(err));
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#090d16',
      color: '#ffffff',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-arabic)',
      padding: '24px 36px',
      overflow: 'hidden'
    }}>
      {/* TV Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        paddingBottom: '18px',
        marginBottom: '24px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            boxShadow: '0 0 25px rgba(2, 132, 199, 0.5)'
          }}>
            🏥
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
              ميديكال هاب التخصصي
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              شاشة نداء المرضى وصالة الانتظار الذكية
            </p>
          </div>
        </div>

        {/* Branch filter & controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <select
            className="form-control"
            style={{
              backgroundColor: '#1e293b',
              color: '#ffffff',
              borderColor: '#334155',
              padding: '8px 16px',
              fontSize: '0.95rem',
              width: 'auto'
            }}
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="all">📍 كل الفروع</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>📍 {b.name}</option>
            ))}
          </select>

          <button
            className="btn btn-outline btn-sm"
            onClick={playChime}
            style={{ backgroundColor: '#1e293b', color: '#38bdf8', borderColor: '#334155' }}
            title="تجربة صوت النداء"
          >
            🔔 صوت النداء
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={handleToggleFullscreen}
            style={{ backgroundColor: '#1e293b', color: '#ffffff', borderColor: '#334155' }}
          >
            ⛶ ملء الشاشة
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={onClose}
          >
            ✕ خروج
          </button>
        </div>

        {/* Clock & Date */}
        <div style={{ textAlign: 'left' }}>
          <div className="num-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
            {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {currentTime.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Main Content: Current Call & Next In Line */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '28px', alignItems: 'stretch' }}>
        {/* Left / Center: Currently Called into Examination */}
        <div style={{
          backgroundColor: '#0f172a',
          borderRadius: '24px',
          border: '2px solid rgba(2, 132, 199, 0.4)',
          boxShadow: '0 0 40px rgba(2, 132, 199, 0.15)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 12px #10b981',
                  animation: 'pulse 1.5s infinite'
                }}></span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0' }}>
                  الآن داخل الكشف (النداء الحالي)
                </h2>
              </div>
              <span className="badge" style={{ backgroundColor: '#1e3a5f', color: '#38bdf8', fontSize: '0.9rem', padding: '6px 14px' }}>
                LIVE CALL
              </span>
            </div>

            {inProgressApts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🩺</div>
                <h3 style={{ fontSize: '1.5rem', color: '#94a3b8' }}>لا يوجد كشف جارٍ حالياً</h3>
                <p style={{ marginTop: '8px', fontSize: '1rem' }}>يرجى الانتظار لحين نداء الطبيب على الدور القادم.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {inProgressApts.map(apt => (
                  <div
                    key={apt.id}
                    style={{
                      background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)',
                      border: '2px solid #0284c7',
                      borderRadius: '20px',
                      padding: '24px 32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 10px 30px rgba(2, 132, 199, 0.25)'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '1rem', color: '#38bdf8', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                        كود الحجز: {apt.code}
                      </span>
                      <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', marginBottom: '8px' }}>
                        {apt.patientName}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '1.1rem', color: '#cbd5e1' }}>
                        <span>👨‍⚕️ {apt.doctorName}</span>
                        <span>•</span>
                        <span style={{ color: '#38bdf8' }}>{apt.clinicName}</span>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '6px', display: 'block' }}>
                        📍 {apt.branchName}
                      </span>
                    </div>

                    {/* Massive Queue Number Badge */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.95rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        رقم الدور
                      </span>
                      <div className="num-display" style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '24px',
                        background: 'var(--primary-gradient)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3.2rem',
                        fontWeight: 900,
                        boxShadow: '0 0 30px rgba(2, 132, 199, 0.6)'
                      }}>
                        #{apt.queueNumber}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips / Announcement Ticker */}
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #334155'
          }}>
            <span style={{ fontSize: '1.4rem' }}>📢</span>
            <div style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>
              <strong>تنبيه للمراجعين الكرام:</strong> يُرجى تجهيز رقم الحجز والتوجه مباشرة لباب العيادة فور ظهور رقم دوركم على الشاشة. نتمنى لكم وافر الصحة والعافية.
            </div>
          </div>
        </div>

        {/* Right: Next in Line / Upcoming Waiting Patients */}
        <div style={{
          backgroundColor: '#0f172a',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0' }}>
                ⏳ الأدوار التالية في صالة الانتظار
              </h3>
              <span className="badge" style={{ backgroundColor: '#2d1e40', color: '#d8b4fe', padding: '4px 12px' }}>
                {waitingApts.length} قادمون
              </span>
            </div>

            {waitingApts.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>
                لا يوجد مرضى آخرين في صالة الانتظار حالياً.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {waitingApts.map((apt, index) => (
                  <div
                    key={apt.id}
                    style={{
                      backgroundColor: '#1e293b',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid #334155'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div className="num-display" style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        backgroundColor: '#334155',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                        fontWeight: 800
                      }}>
                        #{apt.queueNumber}
                      </div>

                      <div>
                        <strong style={{ fontSize: '1.05rem', color: '#f8fafc', display: 'block' }}>
                          {apt.patientName}
                        </strong>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                          عيادة {apt.clinicName} • {apt.doctorName}
                        </span>
                      </div>
                    </div>

                    <span className="badge badge-amber" style={{ fontSize: '0.82rem' }}>
                      {index === 0 ? 'الدور القادم' : 'في الانتظار'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{
            borderTop: '1px solid #334155',
            paddingTop: '16px',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: '#64748b'
          }}>
            نظام شاشات الانتظار الذكي • ميديكال هاب للرعاية الطبية
          </div>
        </div>
      </div>
    </div>
  );
}
