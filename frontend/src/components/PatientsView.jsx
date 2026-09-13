import React, { useState } from 'react';

export default function PatientsView({
  patients,
  currentUser,
  currentRole,
  onSavePatient,
  onOpenPrescription
}) {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  // New patient form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    nationalId: '',
    age: '',
    gender: 'ذكر',
    address: '',
    bloodType: 'O+',
    emergencyContact: '',
    chronicDiseases: '',
    allergies: '',
    currentMedications: '',
    notes: ''
  });

  const canViewSensitive = currentUser?.permissions
    ? currentUser.permissions.includes('patients:sensitive')
    : currentRole !== 'reception';
  const isMasked = !canViewSensitive;

  const filteredPatients = patients.filter(p => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.nationalId && p.nationalId.includes(q))
    );
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('يرجى كتابة اسم المريض ورقم الهاتف');
      return;
    }

    const chronicDiseases = formData.chronicDiseases
      ? formData.chronicDiseases.split('،').map(s => s.trim()).filter(Boolean)
      : [];
    const allergies = formData.allergies
      ? formData.allergies.split('،').map(s => s.trim()).filter(Boolean)
      : [];
    const currentMedications = formData.currentMedications
      ? formData.currentMedications.split('،').map(s => ({ name: s.trim(), frequency: 'يومياً' })).filter(Boolean)
      : [];

    onSavePatient({
      ...formData,
      chronicDiseases,
      allergies,
      currentMedications
    });

    setIsNewPatientModalOpen(false);
    setFormData({
      name: '',
      phone: '',
      nationalId: '',
      age: '',
      gender: 'ذكر',
      address: '',
      bloodType: 'O+',
      emergencyContact: '',
      chronicDiseases: '',
      allergies: '',
      currentMedications: '',
      notes: ''
    });
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>📂 سجلات وملفات المرضى (EMR)</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            إدارة بيانات المرضى، الأمراض المزمنة، الحساسيات، الأدوية المنتظمة، وسجل الزيارات.
          </p>
        </div>

        <button
          id="btn-add-patient"
          className="btn btn-primary"
          onClick={() => setIsNewPatientModalOpen(true)}
        >
          ➕ فتح ملف مريض جديد
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '16px 20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '1.2rem' }}>🔍</span>
        <input
          id="input-patient-search"
          type="text"
          className="form-control"
          placeholder="ابحث بالاسم، رقم الهاتف، كود المريض، أو الرقم القومي..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', padding: '6px 0', fontSize: '1rem' }}
        />
        {search && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setSearch('')}
          >
            مسح
          </button>
        )}
      </div>

      {/* Patients Grid / Table */}
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
                <th style={{ padding: '14px 18px' }}>كود المريض</th>
                <th style={{ padding: '14px 18px' }}>الاسم والبيانات</th>
                <th style={{ padding: '14px 18px' }}>رقم الهاتف</th>
                <th style={{ padding: '14px 18px' }}>العنوان</th>
                <th style={{ padding: '14px 18px' }}>الحالة الصحية (الأمراض المزمنة)</th>
                <th style={{ padding: '14px 18px' }}>الحساسية الدوائية</th>
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    لم يتم العثور على أي ملف مريض مطابق للبحث.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(patient => (
                  <tr
                    key={patient.id}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    {/* Code */}
                    <td style={{ padding: '14px 18px' }}>
                      <span className="num-display badge badge-primary" style={{ fontWeight: 700 }}>
                        {patient.code || 'MED-NEW'}
                      </span>
                    </td>

                    {/* Name & Demographics */}
                    <td style={{ padding: '14px 18px' }}>
                      <strong style={{ fontSize: '0.98rem', display: 'block' }}>{patient.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {patient.gender} • {patient.age ? `${patient.age} سنة` : 'العمر غير مسجل'} • فصيلة {patient.bloodType || 'O+'}
                      </span>
                    </td>

                    {/* Phone */}
                    <td style={{ padding: '14px 18px' }}>
                      <span className="num-display" style={{ fontSize: '0.9rem', direction: 'ltr', display: 'inline-block' }}>
                        {patient.phone}
                      </span>
                    </td>

                    {/* Address */}
                    <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {patient.address || 'العنوان غير مسجل'}
                    </td>

                    {/* Chronic diseases or masked */}
                    <td style={{ padding: '14px 18px' }}>
                      {isMasked ? (
                        <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                          🔒 مصرح للأطباء فقط
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {patient.chronicDiseases && patient.chronicDiseases.length > 0 ? (
                            patient.chronicDiseases.map((d, i) => (
                              <span key={i} className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                                {d}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>لا توجد أمراض مزمنة</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Allergies */}
                    <td style={{ padding: '14px 18px' }}>
                      {isMasked ? (
                        <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                          🔒 مصرح للأطباء فقط
                        </span>
                      ) : (
                        <div>
                          {patient.allergies && patient.allergies.length > 0 ? (
                            patient.allergies.map((a, i) => (
                              <span key={i} className="badge badge-rose" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                                ⚠️ {a}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--emerald-600)' }}>خالي من الحساسية</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        📂 فتح الملف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detailed Profile Modal / Drawer */}
      {selectedPatient && (
        <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            {/* Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '1.4rem'
                }}>
                  👤
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedPatient.name}</h3>
                  <span className="num-display" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    كود الملف: {selectedPatient.code}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedPatient(null)}
                style={{ border: 'none', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Basic Demographic Card */}
              <div style={{
                backgroundColor: 'var(--bg-main)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                border: '1px solid var(--border-light)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                fontSize: '0.88rem'
              }}>
                <div><strong>رقم الهاتف:</strong> <span className="num-display">{selectedPatient.phone}</span></div>
                <div><strong>الرقم القومي:</strong> <span className="num-display">{selectedPatient.nationalId || 'غير مسجل'}</span></div>
                <div><strong>العمر / النوع:</strong> {selectedPatient.age || '-'} سنة ({selectedPatient.gender})</div>
                <div><strong>فصيلة الدم:</strong> <span className="badge badge-primary">{selectedPatient.bloodType || 'O+'}</span></div>
                <div><strong>العنوان:</strong> {selectedPatient.address || 'غير محدد'}</div>
                <div><strong>طوارئ:</strong> {selectedPatient.emergencyContact || 'غير مسجل'}</div>
              </div>

              {/* Sensitive Medical Section - Masked if unauthorized */}
              {isMasked ? (
                <div style={{
                  backgroundColor: 'var(--amber-50)',
                  border: '1px dashed var(--amber-500)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔒</div>
                  <h4 style={{ color: 'var(--amber-600)', marginBottom: '6px' }}>
                    السجل الطبي السري محجوب عن موظف الاستقبال
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    وفقاً لسياسة الصلاحيات والخصوصية، التشخيصات الطبية والأمراض المزمنة وقوائم الأدوية مصرح بها فقط للأطباء وإدارة المركز الطبي.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Chronic Diseases */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px'
                  }}>
                    <h4 style={{ fontSize: '0.98rem', color: 'var(--primary-700)', marginBottom: '10px' }}>
                      🩺 الأمراض المزمنة والحالة الصحية الدائمة
                    </h4>
                    {selectedPatient.chronicDiseases && selectedPatient.chronicDiseases.length > 0 ? (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {selectedPatient.chronicDiseases.map((d, i) => (
                          <span key={i} className="badge badge-purple" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                            {d}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>لا توجد أمراض مزمنة مسجلة.</p>
                    )}
                  </div>

                  {/* Allergies Warning */}
                  <div style={{
                    backgroundColor: 'var(--rose-50)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px'
                  }}>
                    <h4 style={{ fontSize: '0.98rem', color: 'var(--rose-600)', marginBottom: '10px' }}>
                      ⚠️ الحساسية الدوائية والغذائية
                    </h4>
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {selectedPatient.allergies.map((a, i) => (
                          <span key={i} className="badge badge-rose" style={{ padding: '6px 12px', fontSize: '0.85rem', fontWeight: 700 }}>
                            🚫 {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--emerald-600)', fontWeight: 600 }}>
                        لا توجد حساسية معروفة مسجلة.
                      </p>
                    )}
                  </div>

                  {/* Current Regular Medications */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px'
                  }}>
                    <h4 style={{ fontSize: '0.98rem', color: 'var(--teal-600)', marginBottom: '10px' }}>
                      💊 الأدوية الحالية المنتظم عليها المريض
                    </h4>
                    {selectedPatient.currentMedications && selectedPatient.currentMedications.length > 0 ? (
                      <ul style={{ paddingRight: '20px', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {selectedPatient.currentMedications.map((m, i) => (
                          <li key={i}>
                            <strong>{m.name || m}</strong> {m.frequency && `(${m.frequency})`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>لا توجد أدوية منتظمة مسجلة.</p>
                    )}
                  </div>

                  {/* Doctor Notes */}
                  {selectedPatient.notes && (
                    <div style={{
                      backgroundColor: 'var(--bg-card-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)'
                    }}>
                      <strong>ملاحظات الملف:</strong> {selectedPatient.notes}
                    </div>
                  )}

                  {/* Vitals History */}
                  {selectedPatient.vitalsHistory && selectedPatient.vitalsHistory.length > 0 && (
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px'
                    }}>
                      <h4 style={{ fontSize: '0.98rem', color: 'var(--primary-700)', marginBottom: '10px' }}>
                        📊 سجل قياسات العلامات الحيوية السابقة (Vitals History)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedPatient.vitalsHistory.map((vh, vi) => (
                          <div key={vi} style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-main)',
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.85rem'
                          }}>
                            <div>
                              <strong>📅 {vh.date}</strong> <span style={{ color: 'var(--text-muted)' }}>({vh.doctorName})</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <span className="badge badge-emerald">ضغط: {vh.bp || '-'}</span>
                              <span className="badge badge-primary">نبض: {vh.pulse || '-'}</span>
                              <span className="badge badge-amber">حرارة: {vh.temp}°</span>
                              {vh.bloodSugar && <span className="badge badge-purple">سكر: {vh.bloodSugar}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              {!isMasked && (
                <button
                  className="btn btn-teal"
                  onClick={() => {
                    onOpenPrescription({
                      patientId: selectedPatient.id,
                      patientName: selectedPatient.name,
                      patientCode: selectedPatient.code
                    });
                    setSelectedPatient(null);
                  }}
                >
                  📝 إصدار روشتة إلكترونية لهذا المريض
                </button>
              )}
              <button
                className="btn btn-outline"
                onClick={() => setSelectedPatient(null)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Patient Modal */}
      {isNewPatientModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewPatientModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>➕ فتح وتوثيق ملف مريض جديد</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setIsNewPatientModalOpen(false)}
                style={{ border: 'none', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الاسم رباعي *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="مثال: يوسف إبراهيم العوضي"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">رقم الهاتف المحمول *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="01012345678"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الرقم القومي</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="14 رقم"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">العمر</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="35"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">النوع</label>
                    <select
                      className="form-control"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">العنوان بالتفصيل</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="الشارع، المنطقة، المدينة"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">فصيلة الدم</label>
                    <select
                      className="form-control"
                      value={formData.bloodType}
                      onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">رقم هاتف للطوارئ / صلة القرابة</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="مثال: الأخ: 01099887766"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                </div>

                {/* Medical Profile Inputs */}
                <div style={{
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-700)' }}>
                    🩺 التاريخ الصحي والأمراض (مخصص للأطباء)
                  </h4>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الأمراض المزمنة (افصل بينها بفاصلة ،)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="مثال: السكر النوع الثاني، ارتفاع ضغط الدم"
                      value={formData.chronicDiseases}
                      onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: 'var(--rose-600)' }}>
                      ⚠️ الحساسية الدوائية أو الغذائية (افصل بفاصلة ،)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="مثال: حساسية بنسلين، حساسية أسبرين"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الأدوية المنتظم عليها حالياً</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="مثال: كونكور 5 ملغ، جلوكوفاج 1000"
                      value={formData.currentMedications}
                      onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="submit"
                  id="btn-submit-new-patient"
                  className="btn btn-primary"
                >
                  حفظ وتسجيل الملف
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsNewPatientModalOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
