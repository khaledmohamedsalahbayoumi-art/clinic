import React, { useState } from 'react';

export default function QueueView({
  appointments,
  currentRole,
  onUpdateStatus,
  onOpenPrescription,
  onNewBooking,
  onOpenVitals,
  onOpenWaitingScreen,
  branches
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');

  const filtered = appointments.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterBranch !== 'all' && a.branchId !== filterBranch) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'waiting':
        return <span className="badge badge-amber">⏳ في الانتظار</span>;
      case 'in_progress':
        return <span className="badge badge-primary">🩺 داخل الكشف</span>;
      case 'completed':
        return <span className="badge badge-emerald">✅ تم الكشف</span>;
      case 'confirmed':
        return <span className="badge badge-purple">📅 حجز مؤكد</span>;
      case 'cancelled':
        return <span className="badge badge-rose">❌ معتذر</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  // WhatsApp reminder generator
  const handleSendWhatsApp = (apt) => {
    const text = encodeURIComponent(
      `مرحباً بك أستاذ ${apt.patientName}، نود تذكيرك بموعد كشفك في المركز الطبي التخصصي (${apt.branchName}) لدى ${apt.doctorName} (${apt.clinicName}) اليوم في تمام الساعة ${apt.timeSlot}. رقم دورك في الطابور هو #${apt.queueNumber}. نتمنى لكم الشفاء العاجل.`
    );
    const url = `https://wa.me/2${apt.patientPhone.replace(/\D/g, '')}?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>📋 طابور الانتظار والكشوفات الحية</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            تنظيم حركة المراجعين بالعيادات، إدخال المريض للطبيب، ومتابعة حالة الكشف.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Button to launch TV Screen mode */}
          <button
            id="btn-open-tv-screen"
            className="btn btn-outline"
            style={{ backgroundColor: '#0f172a', color: '#38bdf8', borderColor: '#1e293b', fontWeight: 700 }}
            onClick={onOpenWaitingScreen}
          >
            📺 شاشة عرض صالة الانتظار
          </button>

          <button
            id="btn-add-booking-queue"
            className="btn btn-primary"
            onClick={onNewBooking}
          >
            ➕ تسجيل حجز / كشف جديد
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#ffffff',
        padding: '12px 18px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)'
      }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'الكل' },
            { key: 'waiting', label: '⏳ في الانتظار' },
            { key: 'in_progress', label: '🩺 داخل الكشف' },
            { key: 'completed', label: '✅ المكتملة' },
            { key: 'confirmed', label: '📅 المؤكدة' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`btn btn-sm ${filterStatus === tab.key ? 'btn-primary' : 'btn-outline'}`}
              style={{
                border: filterStatus === tab.key ? 'none' : '1px solid var(--border-light)',
                borderRadius: 'var(--radius-full)'
              }}
              onClick={() => setFilterStatus(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Branch Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>تصفية الفرع:</span>
          <select
            className="form-control"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
          >
            <option value="all">كل الفروع</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderBottom: '1px solid var(--border-light)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                <th style={{ padding: '14px 18px', width: '80px' }}>الدور</th>
                <th style={{ padding: '14px 18px' }}>المريض</th>
                <th style={{ padding: '14px 18px' }}>الطبيب والعيادة</th>
                <th style={{ padding: '14px 18px' }}>الفرع والموعد</th>
                <th style={{ padding: '14px 18px' }}>العلامات الحيوية</th>
                <th style={{ padding: '14px 18px' }}>الحالة</th>
                <th style={{ padding: '14px 18px' }}>التحصيل</th>
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    لا توجد حجوزات مطابقة للمعايير المحددة حالياً.
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => (
                  <tr
                    key={apt.id}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      transition: 'background-color 0.15s',
                      backgroundColor: apt.status === 'in_progress' ? 'var(--primary-50)' : '#ffffff'
                    }}
                  >
                    {/* Queue number badge */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: apt.status === 'in_progress' ? 'var(--primary-600)' : 'var(--bg-card-subtle)',
                        color: apt.status === 'in_progress' ? '#ffffff' : 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        fontFamily: 'var(--font-numeric)'
                      }}>
                        #{apt.queueNumber || '-'}
                      </div>
                    </td>

                    {/* Patient Name & Phone */}
                    <td style={{ padding: '14px 18px' }}>
                      <strong style={{ fontSize: '0.98rem', display: 'block' }}>{apt.patientName}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <span className="num-display" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          📞 {apt.patientPhone}
                        </span>
                        <button
                          onClick={() => handleSendWhatsApp(apt)}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            padding: 0
                          }}
                          title="إرسال تذكير بالواتساب للمريض"
                        >
                          💬
                        </button>
                      </div>
                    </td>

                    {/* Doctor & Clinic */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{apt.doctorAvatar || '👨‍⚕️'}</span>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.92rem', display: 'block' }}>
                            {apt.doctorName}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {apt.clinicName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Branch & Time */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ display: 'block', fontSize: '0.88rem' }}>{apt.branchName}</span>
                      <span className="num-display" style={{ fontSize: '0.82rem', color: 'var(--primary-600)', fontWeight: 600 }}>
                        ⏰ {apt.timeSlot}
                      </span>
                    </td>

                    {/* Vitals Summary */}
                    <td style={{ padding: '14px 18px' }}>
                      {apt.vitals ? (
                        <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                            ضغط: {apt.vitals.bp || '120/80'}
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            حرارة: {apt.vitals.temp}° • سكر: {apt.vitals.bloodSugar}
                          </span>
                        </div>
                      ) : (
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                          onClick={() => onOpenVitals(apt)}
                        >
                          ➕ قياس Vitals
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 18px' }}>
                      {getStatusBadge(apt.status)}
                    </td>

                    {/* Payment status */}
                    <td style={{ padding: '14px 18px' }}>
                      {apt.paymentStatus === 'paid' ? (
                        <span className="badge badge-emerald">مدفوع ({apt.fee} ج.م)</span>
                      ) : (
                        <span className="badge badge-rose">مطلوب ({apt.fee} ج.م)</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {/* If waiting -> Call into clinic */}
                        {apt.status === 'waiting' && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              title="إدخال المريض للكشف"
                              onClick={() => onUpdateStatus(apt.id, 'in_progress')}
                            >
                              🚪 دخول للكشف
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              title="قياس العلامات الحيوية"
                              onClick={() => onOpenVitals(apt)}
                            >
                              🩺 Vitals
                            </button>
                          </>
                        )}

                        {/* If in_progress -> Write prescription or complete */}
                        {apt.status === 'in_progress' && (
                          <>
                            <button
                              className="btn btn-teal btn-sm"
                              title="كتابة روشتة طبية"
                              onClick={() => onOpenPrescription(apt)}
                            >
                              📝 روشتة
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              title="قياس العلامات الحيوية"
                              onClick={() => onOpenVitals(apt)}
                            >
                              🩺 Vitals
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              title="إنهاء الكشف"
                              onClick={() => onUpdateStatus(apt.id, 'completed')}
                            >
                              ✅ إنهاء
                            </button>
                          </>
                        )}

                        {/* If confirmed -> Send to waiting queue */}
                        {apt.status === 'confirmed' && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => onUpdateStatus(apt.id, 'waiting')}
                          >
                            🛎️ تحويل للانتظار
                          </button>
                        )}

                        {/* Completed visit */}
                        {apt.status === 'completed' && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--emerald-600)', fontWeight: 600 }}>
                            مكتمل بنجاح
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
