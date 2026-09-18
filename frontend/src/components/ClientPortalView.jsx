import React, { useState } from 'react';

export default function ClientPortalView({
  doctors,
  clinics,
  branches,
  onBookAppointment,
  onFetchPatientData,
  onPrintPrescription
}) {
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchDoctor, setSearchDoctor] = useState('');
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' or 'my_portal'

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingBranchId, setBookingBranchId] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTimeSlot, setBookingTimeSlot] = useState('11:00 ص');
  const [bookingType, setBookingType] = useState('كشف جديد');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Patient Self-Service Portal State
  const [lookupPhone, setLookupPhone] = useState('');
  const [patientRecords, setPatientRecords] = useState(null);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Time slots for booking
  const availableTimeSlots = [
    '10:00 ص', '10:30 ص', '11:00 ص', '11:30 ص',
    '12:00 م', '12:30 م', '01:00 م', '01:30 م',
    '05:00 م', '05:30 م', '06:00 م', '06:30 م',
    '07:00 م', '07:30 م', '08:00 م'
  ];

  // Filter Doctors
  const filteredDoctors = doctors.filter(doc => {
    if (selectedClinic !== 'all' && doc.clinicId !== selectedClinic) return false;
    if (selectedBranch !== 'all' && !doc.branchIds.includes(selectedBranch)) return false;
    if (searchDoctor) {
      const q = searchDoctor.trim().toLowerCase();
      return doc.name.toLowerCase().includes(q) || doc.clinicName.toLowerCase().includes(q) || doc.title.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenBooking = (doc) => {
    setBookingDoctor(doc);
    setBookingBranchId(doc.branchIds[0] || 'br_maadi');
    setBookingSuccessData(null);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      alert('يرجى إدخال اسم المريض ورقم الهاتف');
      return;
    }

    const newApt = await onBookAppointment({
      patientName,
      patientPhone,
      doctorId: bookingDoctor.id,
      branchId: bookingBranchId,
      date: bookingDate,
      timeSlot: bookingTimeSlot,
      type: bookingType,
      notes: bookingNotes
    });

    setBookingSuccessData(newApt);
  };

  const handleLookupPatient = async (e) => {
    e.preventDefault();
    if (!lookupPhone.trim()) return;
    setIsLoadingRecords(true);
    const data = await onFetchPatientData(lookupPhone.trim());
    setPatientRecords(data);
    setIsLoadingRecords(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner & Hero */}
      <div className="client-hero-banner">
        <div className="client-hero-content">
          <span className="client-hero-badge">
            🌟 بوابتك الذكية للرعاية الطبية المتكاملة
          </span>
          <h2 className="client-hero-title">
            احجز موعد كشفك مع نخبة من كبار الاستشاريين والأطباء
          </h2>
          <p className="client-hero-desc">
            اختر التخصص والفرع الأقرب إليك، وتعرف على مواعيد الأطباء المتاحة، وتابع كشوفاتك وروشتاتك الإلكترونية في أي وقت.
          </p>
        </div>

        {/* Tabs to switch between Doctors Catalog & Patient Portal */}
        <div className="client-hero-tabs">
          <button
            id="tab-client-doctors"
            className={`client-hero-tab-btn ${activeTab === 'doctors' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('doctors')}
          >
            👨‍⚕️ استعراض الأطباء وحجز موعد
          </button>
          <button
            id="tab-client-records"
            className={`client-hero-tab-btn ${activeTab === 'my_portal' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('my_portal')}
          >
            📋 متابعة حجوزاتي وروشتاتي الطبية
          </button>
        </div>
      </div>

      {activeTab === 'doctors' ? (
        <>
          {/* Search and Filters */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '20px 24px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Search Input and Branch dropdown */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                <input
                  id="input-client-search-doctor"
                  type="text"
                  className="form-control"
                  placeholder="ابحث باسم الطبيب أو التخصص..."
                  value={searchDoctor}
                  onChange={(e) => setSearchDoctor(e.target.value)}
                  style={{ paddingRight: '36px' }}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                  🔍
                </span>
              </div>

              <div style={{ minWidth: '200px' }}>
                <select
                  id="select-client-branch"
                  className="form-control"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="all">📍 جميع الفروع</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>📍 {b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Specialties / Clinics Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              <button
                className={`btn btn-sm ${selectedClinic === 'all' ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
                onClick={() => setSelectedClinic('all')}
              >
                كل العيادات
              </button>
              {clinics.map(c => (
                <button
                  key={c.id}
                  className={`btn btn-sm ${selectedClinic === c.id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                  onClick={() => setSelectedClinic(c.id)}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="doctors-cards-grid">
            {filteredDoctors.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-light)'
              }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                  لم يتم العثور على أطباء مطابقين لبحثك في هذا الفرع والتخصص.
                </p>
              </div>
            ) : (
              filteredDoctors.map(doc => (
                <div
                  key={doc.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-light)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '20px',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  <div>
                    {/* Top Row: Avatar, Name, Rating */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        backgroundColor: 'var(--primary-50)',
                        border: '1px solid var(--primary-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        flexShrink: 0
                      }}>
                        {doc.avatar || '👨‍⚕️'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{doc.name}</h3>
                          <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700 }}>
                            ⭐ {doc.rating}
                          </span>
                        </div>
                        <span className="badge badge-primary" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                          {doc.clinicName}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                      {doc.title}
                    </p>

                    {/* Education & Experience */}
                    <div style={{
                      backgroundColor: 'var(--bg-main)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      marginBottom: '14px'
                    }}>
                      <div>🎓 {doc.education}</div>
                      <div style={{ marginTop: '4px' }}>⏳ خبرة {doc.experienceYears} عاماً</div>
                    </div>

                    {/* Working Schedule */}
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                        📅 المواعيد والعيادات المتاحة:
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {doc.schedule?.map((s, idx) => {
                          const branchName = branches.find(b => b.id === s.branchId)?.name || 'الفرع الرئيسي';
                          return (
                            <div key={idx} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.82rem',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#f1f5f9'
                            }}>
                              <strong>{s.day}: {s.time}</strong>
                              <span style={{ color: 'var(--primary-700)', fontSize: '0.78rem' }}>📍 {branchName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Fee & Booking Button */}
                  <div style={{
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>قيمة الكشف</span>
                      <strong className="num-display" style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
                        {doc.consultationFee} <span style={{ fontSize: '0.85rem' }}>ج.م</span>
                      </strong>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => handleOpenBooking(doc)}
                    >
                      📅 احجز كشف الآن
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Patient Self-Service Portal (متابعة الحجوزات والروشتات) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>
              🔍 استعراض ملفك وكشوفاتك الطبية برقم هاتفك
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              أدخل رقم الهاتف الذي سجلت به الحجز لعرض مواعيدك القادمة، رقم دورك في الطابور، وروشتاتك الإلكترونية.
            </p>

            <form onSubmit={handleLookupPatient} style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
              <input
                type="tel"
                className="form-control"
                placeholder="أدخل رقم هاتفك (مثال: 01011223344)"
                required
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                {isLoadingRecords ? 'جاري البحث...' : 'بحث وعرض الملف'}
              </button>
            </form>
          </div>

          {/* Results */}
          {patientRecords && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Patient Banner */}
              <div style={{
                backgroundColor: 'var(--primary-50)',
                border: '1px solid var(--primary-200)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                    {patientRecords.name}
                  </h3>
                  <span className="num-display" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    كود الملف الطبي: {patientRecords.code} • هاتف: {patientRecords.phone}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="badge badge-emerald">فصيلة: {patientRecords.bloodType || 'O+'}</span>
                  <span className="badge badge-primary">السن: {patientRecords.age || '-'} سنة</span>
                </div>
              </div>

              {/* Patient's Appointments */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                border: '1px solid var(--border-light)'
              }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
                  📅 حجوزاتك ومواعيدك بالعيادات
                </h4>

                {patientRecords.appointments?.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>لا توجد حجوزات مسجلة لهذا الرقم.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {patientRecords.appointments?.map(apt => (
                      <div key={apt.id} style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '1rem' }}>{apt.doctorName}</strong>
                            <span className="badge badge-primary">{apt.clinicName}</span>
                          </div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                            📍 {apt.branchName} • 📅 {apt.date} • ⏰ {apt.timeSlot}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>رقم الدور</span>
                            <span className="badge badge-primary" style={{ fontSize: '0.95rem' }}>#{apt.queueNumber || '-'}</span>
                          </div>

                          <div>
                            {apt.status === 'waiting' && <span className="badge badge-amber">في صالة الانتظار</span>}
                            {apt.status === 'in_progress' && <span className="badge badge-primary">داخل الكشف حالياً</span>}
                            {apt.status === 'completed' && <span className="badge badge-emerald">تم الكشف بنجاح</span>}
                            {apt.status === 'confirmed' && <span className="badge badge-purple">حجزك مؤكد</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Patient's Prescriptions */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                border: '1px solid var(--border-light)'
              }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
                  💊 روشتاتك الطبية الإلكترونية الصادرة
                </h4>

                {patientRecords.prescriptions?.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>لا توجد روشتات مسجلة حتى الآن.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                    {patientRecords.prescriptions?.map(rx => (
                      <div key={rx.id} style={{
                        padding: '18px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        backgroundColor: '#ffffff',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span className="badge badge-primary">{rx.code}</span>
                          <span className="num-display" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📅 {rx.date}</span>
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{rx.doctorName}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                          التشخيص: {rx.diagnosis}
                        </p>
                        <div style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                          <strong>الأدوية ({rx.medicines?.length || 0}):</strong>
                          <ul style={{ paddingRight: '20px', marginTop: '4px' }}>
                            {rx.medicines?.map((m, idx) => (
                              <li key={idx}>{m.name} ({m.dosage})</li>
                            ))}
                          </ul>
                        </div>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ width: '100%' }}
                          onClick={() => onPrintPrescription(rx)}
                        >
                          🖨️ فتح وطباعة الروشتة الرسمية
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Online Booking Modal */}
      {bookingDoctor && (
        <div className="modal-overlay" onClick={() => setBookingDoctor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>{bookingDoctor.avatar || '👨‍⚕️'}</span>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>حجز موعد كشف</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary-700)' }}>
                    {bookingDoctor.name} • {bookingDoctor.clinicName}
                  </span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setBookingDoctor(null)}>✕</button>
            </div>

            {bookingSuccessData ? (
              <div className="modal-body" style={{ textAlign: 'center', padding: '36px 24px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-600)', marginBottom: '8px' }}>
                  تم تأكيد حجزك بنجاح!
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  تم تسجيل موعدك في النظام وإرساله لعيادة الطبيب وصالة الاستقبال.
                </p>

                <div style={{
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  textAlign: 'right',
                  fontSize: '0.92rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '24px'
                }}>
                  <div><strong>كود الحجز:</strong> <span className="num-display badge badge-primary">{bookingSuccessData.code}</span></div>
                  <div><strong>رقم الدور في الطابور:</strong> <span className="num-display badge badge-amber">#{bookingSuccessData.queueNumber}</span></div>
                  <div><strong>اسم المريض:</strong> {bookingSuccessData.patientName}</div>
                  <div><strong>الفرع:</strong> {bookingSuccessData.branchName}</div>
                  <div><strong>الموعد:</strong> {bookingSuccessData.date} الساعة {bookingSuccessData.timeSlot}</div>
                  <div><strong>قيمة الكشف:</strong> {bookingSuccessData.fee} ج.م (تسدد بالاستقبال)</div>
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setBookingDoctor(null)}
                >
                  حسناً، فهمت ذلك
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Select Branch */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الفرع المتاح فيه الطبيب *</label>
                    <select
                      className="form-control"
                      value={bookingBranchId}
                      onChange={(e) => setBookingBranchId(e.target.value)}
                    >
                      {bookingDoctor.branchIds.map(bId => {
                        const bObj = branches.find(b => b.id === bId);
                        return (
                          <option key={bId} value={bId}>
                            📍 {bObj?.name || bId}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Date and Time */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">تاريخ الكشف *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">الوقت المفضل *</label>
                      <select
                        className="form-control"
                        value={bookingTimeSlot}
                        onChange={(e) => setBookingTimeSlot(e.target.value)}
                      >
                        {availableTimeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">نوع الزيارة</label>
                    <select
                      className="form-control"
                      value={bookingType}
                      onChange={(e) => setBookingType(e.target.value)}
                    >
                      <option value="كشف جديد">كشف جديد ({bookingDoctor.consultationFee} ج.م)</option>
                      <option value="استشارة ومتابعة">استشارة ومتابعة ({bookingDoctor.followUpFee || 100} ج.م)</option>
                    </select>
                  </div>

                  {/* Patient Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">اسم المريض ثلاثي *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="مثال: يوسف محمود علي"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">رقم الهاتف المحمول *</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="01012345678"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">سبب الزيارة أو الأعراض (اختياري)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="مثال: فحص دوري، ألم بالمعدة..."
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="submit"
                    id="btn-confirm-client-booking"
                    className="btn btn-primary"
                  >
                    تأكيد حجز الموعد
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setBookingDoctor(null)}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
