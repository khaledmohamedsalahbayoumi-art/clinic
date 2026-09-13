import React, { useState } from 'react';

export default function PrescriptionsView({
  prescriptions,
  labRequests = [],
  patients,
  doctors,
  currentDoctorId,
  currentRole,
  activePrescriptionData,
  onClosePrescriptionModal,
  onCreatePrescription,
  onCreateLabRequest
}) {
  const [activeSubTab, setActiveSubTab] = useState('prescriptions'); // 'prescriptions' or 'labs'
  const [search, setSearch] = useState('');
  const [selectedRxToPrint, setSelectedRxToPrint] = useState(null);
  const [selectedLabToPrint, setSelectedLabToPrint] = useState(null);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);

  // New prescription form state
  const [patientId, setPatientId] = useState(activePrescriptionData?.patientId || '');
  const [doctorId, setDoctorId] = useState(currentDoctorId || 'doc_1');
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('تناول العلاج بانتظام والمتابعة في الموعد المحدد.');
  const [followUpDate, setFollowUpDate] = useState('بعد أسبوعين للمتابعة');
  const [medicines, setMedicines] = useState([
    { name: '', form: 'أقراص', dosage: '', duration: '', notes: '' }
  ]);

  // Lab Request form state
  const [labForm, setLabForm] = useState({
    patientId: activePrescriptionData?.patientId || patients[0]?.id || '',
    doctorId: currentDoctorId || 'doc_1',
    type: 'تحاليل مخبرية',
    tests: '',
    priority: 'عادي',
    notes: ''
  });

  const commonLabTests = [
    'صورة دم كاملة (CBC)',
    'تحليل سكر تراكمي (HbA1c)',
    'وظائف كبد (ALT, AST)',
    'وظائف كلى (Creatinine, Urea)',
    'دهون وكوليسترول كامل (Lipid Profile)',
    'تحليل بول كامل (Urine Analysis)',
    'أشعة عادية على الصدر (Chest X-Ray)',
    'موجات صوتية على البطن والحوض (Pelvi-Abdominal Ultrasound)',
    'رسم قلب كهربائي (ECG)'
  ];

  const handleAddMedicineRow = () => {
    setMedicines([...medicines, { name: '', form: 'أقراص', dosage: '', duration: '', notes: '' }]);
  };

  const handleRemoveMedicineRow = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patientId || !diagnosis) {
      alert('يرجى اختيار المريض وكتابة التشخيص الطبي');
      return;
    }
    const validMeds = medicines.filter(m => m.name.trim());
    if (validMeds.length === 0) {
      alert('يرجى إضافة دواء واحد على الأقل للروشتة');
      return;
    }

    onCreatePrescription({
      patientId,
      appointmentId: activePrescriptionData?.id || null,
      doctorId,
      diagnosis,
      medicines: validMeds,
      instructions,
      followUpDate
    });

    onClosePrescriptionModal();
  };

  const handleLabSubmit = (e) => {
    e.preventDefault();
    if (!labForm.patientId || !labForm.tests.trim()) {
      alert('يرجى اختيار المريض وتحديد الفحوصات المطلوبة');
      return;
    }

    onCreateLabRequest({
      ...labForm,
      tests: labForm.tests.split('،').map(t => t.trim()).filter(Boolean)
    });

    setIsLabModalOpen(false);
    setLabForm({
      patientId: patients[0]?.id || '',
      doctorId: currentDoctorId || 'doc_1',
      type: 'تحاليل مخبرية',
      tests: '',
      priority: 'عادي',
      notes: ''
    });
  };

  const filteredPrescriptions = prescriptions.filter(rx => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      rx.patientName.toLowerCase().includes(q) ||
      rx.code.toLowerCase().includes(q) ||
      rx.diagnosis.toLowerCase().includes(q) ||
      rx.doctorName.toLowerCase().includes(q)
    );
  });

  const filteredLabs = labRequests.filter(req => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      req.patientName.toLowerCase().includes(q) ||
      req.code.toLowerCase().includes(q) ||
      req.doctorName.toLowerCase().includes(q) ||
      (req.tests && req.tests.join(' ').toLowerCase().includes(q))
    );
  });

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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>📝 الروشتات والتحاليل الطبية</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            تحرير وتوثيق الروشتات العلاجية وطلبات الفحوصات والتحاليل المخبرية والأشعة.
          </p>
        </div>

        {currentRole !== 'reception' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              id="btn-new-lab-order"
              className="btn btn-outline"
              onClick={() => setIsLabModalOpen(true)}
              style={{ fontWeight: 600 }}
            >
              🔬 طلب تحاليل وأشعة
            </button>
            <button
              id="btn-new-prescription"
              className="btn btn-primary"
              onClick={() => {
                setPatientId(patients[0]?.id || '');
                onClosePrescriptionModal();
              }}
            >
              ➕ كتابة روشتة علاجية
            </button>
          </div>
        )}
      </div>

      {/* Sub-Tabs: Prescriptions vs Lab Orders */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#ffffff',
        padding: '10px 16px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${activeSubTab === 'prescriptions' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
            onClick={() => setActiveSubTab('prescriptions')}
          >
            💊 الروشتات العلاجية ({prescriptions.length})
          </button>
          <button
            className={`btn btn-sm ${activeSubTab === 'labs' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
            onClick={() => setActiveSubTab('labs')}
          >
            🔬 طلبات التحاليل والأشعة ({labRequests.length})
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '280px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="ابحث بالاسم، الكود، أو التشخيص..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {activeSubTab === 'prescriptions' ? (
        /* Prescriptions Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '18px'
        }}>
          {filteredPrescriptions.map(rx => (
            <div
              key={rx.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-light)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="num-display badge badge-primary">{rx.code}</span>
                  <span className="num-display" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    📅 {rx.date}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>
                  {rx.patientName}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: 600, marginBottom: '10px' }}>
                  {rx.doctorName} • {rx.clinicName}
                </div>

                <div style={{
                  backgroundColor: 'var(--bg-main)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>التشخيص:</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{rx.diagnosis}</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    الأدوية الموصوفة ({rx.medicines?.length || 0}):
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {rx.medicines?.slice(0, 3).map((med, i) => (
                      <div key={i} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--teal-600)' }}>💊</span>
                        <strong>{med.name}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>- {med.dosage}</span>
                      </div>
                    ))}
                    {rx.medicines?.length > 3 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary-600)' }}>
                        + {rx.medicines.length - 3} أدوية أخرى
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {rx.followUpDate || 'المتابعة محددة'}
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedRxToPrint(rx)}
                >
                  🖨️ عرض وطباعة الروشتة
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Lab & Radiology Requests Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '18px'
        }}>
          {filteredLabs.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: 'var(--radius-xl)' }}>
              <p style={{ color: 'var(--text-muted)' }}>لا توجد طلبات تحاليل مسجلة حالياً.</p>
            </div>
          ) : (
            filteredLabs.map(req => (
              <div
                key={req.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-light)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="num-display badge badge-purple">{req.code}</span>
                    <span className={`badge ${req.priority === 'عاجل' ? 'badge-rose' : 'badge-primary'}`}>
                      {req.priority}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>
                    {req.patientName}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    طلب بواسطة: <strong>{req.doctorName}</strong> ({req.clinicName})
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-700)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      🔬 الفحوصات المطلوبة:
                    </span>
                    <ul style={{ paddingRight: '20px', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {req.tests?.map((t, idx) => (
                        <li key={idx}><strong>{t}</strong></li>
                      ))}
                    </ul>
                  </div>

                  {req.notes && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                      ملاحظات: {req.notes}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    📅 {req.date}
                  </span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setSelectedLabToPrint(req)}
                  >
                    🖨️ طباعة إحالة الفحص
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* New Lab Order Modal */}
      {isLabModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLabModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>🔬 طلب تحاليل وأشعة طبية للمريض</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setIsLabModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleLabSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">المريض *</label>
                    <select
                      className="form-control"
                      value={labForm.patientId}
                      onChange={(e) => setLabForm({ ...labForm, patientId: e.target.value })}
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.code || p.phone})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الطبيب المعالج *</label>
                    <select
                      className="form-control"
                      value={labForm.doctorId}
                      onChange={(e) => setLabForm({ ...labForm, doctorId: e.target.value })}
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.clinicName})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">نوع الفحص</label>
                    <select
                      className="form-control"
                      value={labForm.type}
                      onChange={(e) => setLabForm({ ...labForm, type: e.target.value })}
                    >
                      <option value="تحاليل مخبرية">تحاليل مخبرية وعينات دم وبول</option>
                      <option value="أشعة وتصوير طبي">أشعة سينية وموجات صوتية وتصوير</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">درجة الأهمية</label>
                    <select
                      className="form-control"
                      value={labForm.priority}
                      onChange={(e) => setLabForm({ ...labForm, priority: e.target.value })}
                    >
                      <option value="عادي">عادي (Routine)</option>
                      <option value="عاجل">عاجل (Urgent / STAT)</option>
                    </select>
                  </div>
                </div>

                {/* Quick Add Common Tests */}
                <div>
                  <label className="form-label" style={{ marginBottom: '6px' }}>اختيارات شائعة سريعة (اضغط للإضافة):</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {commonLabTests.map((testName, i) => (
                      <button
                        key={i}
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.78rem', padding: '3px 8px' }}
                        onClick={() => {
                          const current = labForm.tests ? labForm.tests.split('،').map(s => s.trim()) : [];
                          if (!current.includes(testName)) {
                            current.push(testName);
                            setLabForm({ ...labForm, tests: current.join('، ') });
                          }
                        }}
                      >
                        + {testName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">قائمة الفحوصات والتحاليل المطلوبة (مفصولة بفاصلة ،) *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="مثال: صورة دم كاملة (CBC)، وظائف كبد وكلى، سكر صائم"
                    required
                    value={labForm.tests}
                    onChange={(e) => setLabForm({ ...labForm, tests: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">تعليمات للمعمل أو المريض (اختياري)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="مثال: صيام 8 ساعات قبل أخذ العينة"
                    value={labForm.notes}
                    onChange={(e) => setLabForm({ ...labForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  إصدار وتوثيق طلب الفحص
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setIsLabModalOpen(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Prescription Modal */}
      {activePrescriptionData && (
        <div className="modal-overlay" onClick={onClosePrescriptionModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>📝 تحرير روشتة إلكترونية جديدة</h3>
              <button className="btn btn-outline btn-sm" onClick={onClosePrescriptionModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">المريض *</label>
                    <select
                      className="form-control"
                      required
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                    >
                      <option value="">-- اختر المريض --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code || p.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الطبيب المعالج *</label>
                    <select
                      className="form-control"
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.clinicName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">التشخيص الطبي (Diagnosis) *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="مثال: التهاب حاد في الشعب الهوائية وارتفاع بدرجة الحرارة"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>

                {/* Medicines Repeater */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>💊 الأدوية والجرعات المقررة</label>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleAddMedicineRow}
                    >
                      ➕ إضافة دواء
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {medicines.map((med, index) => (
                      <div key={index} style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 2fr 1fr auto',
                        gap: '8px',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-main)',
                        padding: '10px',
                        borderRadius: 'var(--radius-md)'
                      }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="اسم الدواء والتركيز (مثال: أوجمنتين 1 جم)"
                          required
                          value={med.name}
                          onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                        />
                        <select
                          className="form-control"
                          value={med.form}
                          onChange={(e) => handleMedicineChange(index, 'form', e.target.value)}
                        >
                          <option value="أقراص">أقراص</option>
                          <option value="شراب">شراب</option>
                          <option value="كبسولات">كبسولات</option>
                          <option value="حقن">حقن</option>
                          <option value="نقط / بخاخ">نقط / بخاخ</option>
                          <option value="مرهم / كريم">مرهم / كريم</option>
                        </select>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="الجرعة (قرص كل 12 ساعة بعد الأكل)"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="المدة (7 أيام)"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                        />
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveMedicineRow(index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">إرشادات وتعليمات المريض</label>
                    <input
                      type="text"
                      className="form-control"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">موعد المتابعة / الاستشارة</label>
                    <input
                      type="text"
                      className="form-control"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  إصدار وحفظ الروشتة
                </button>
                <button type="button" className="btn btn-outline" onClick={onClosePrescriptionModal}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Prescription Modal */}
      {selectedRxToPrint && (
        <div className="modal-overlay" onClick={() => setSelectedRxToPrint(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', backgroundColor: '#ffffff' }}>
            <div className="modal-header no-print">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>معاينة وطباعة الروشتة</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  🖨️ طباعة الآن
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setSelectedRxToPrint(null)}>
                  ✕
                </button>
              </div>
            </div>

            <div className="printable-area" style={{
              padding: '36px',
              backgroundColor: '#ffffff',
              minHeight: '600px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-arabic)',
              border: '2px solid #0284c7',
              borderRadius: '8px',
              margin: '16px'
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '2px solid #0284c7',
                  paddingBottom: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <h2 style={{ color: '#0369a1', fontSize: '1.4rem', fontWeight: 800 }}>ميديكال هاب التخصصي</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>MedicalHub Polyclinics & Centers</p>
                    <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>{selectedRxToPrint.branchName}</span>
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{selectedRxToPrint.doctorName}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedRxToPrint.doctorTitle}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedRxToPrint.clinicName}</span>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#f0f9ff',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem',
                  marginBottom: '20px',
                  border: '1px solid #bae6fd'
                }}>
                  <div><strong>المريض:</strong> {selectedRxToPrint.patientName}</div>
                  <div><strong>كود:</strong> {selectedRxToPrint.patientCode || '-'}</div>
                  <div><strong>التاريخ:</strong> {selectedRxToPrint.date}</div>
                  <div><strong>رقم الروشتة:</strong> {selectedRxToPrint.code}</div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>التشخيص الطبي:</span>
                  <p style={{ fontSize: '1.05rem', fontWeight: 700 }}>{selectedRxToPrint.diagnosis}</p>
                </div>

                <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'serif', color: '#0284c7', marginBottom: '10px' }}>
                  ℞
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '12px' }}>
                  {selectedRxToPrint.medicines?.map((med, i) => (
                    <div key={i} style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <strong style={{ fontSize: '1.05rem' }}>{i + 1}. {med.name}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary-600)' }}>({med.form})</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#334155', marginTop: '2px', paddingRight: '20px' }}>
                        الجرعة: {med.dosage} {med.duration && `• المدة: ${med.duration}`}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedRxToPrint.instructions && (
                  <div style={{ marginTop: '24px', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '6px' }}>
                    <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>تعليمات الطبيب:</strong>
                    <p style={{ fontSize: '0.88rem', color: '#475569' }}>{selectedRxToPrint.instructions}</p>
                  </div>
                )}
              </div>

              <div style={{
                borderTop: '2px solid #0284c7',
                paddingTop: '16px',
                marginTop: '32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div>المتابعة: {selectedRxToPrint.followUpDate}</div>
                  <div>للحجز والاستفسار: 01012345671</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '30px' }}>توقيع وختم الطبيب المعالج</div>
                  <div style={{ fontWeight: 700, borderTop: '1px solid #94a3b8', paddingTop: '4px', minWidth: '150px' }}>
                    {selectedRxToPrint.doctorName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Lab Slip Modal */}
      {selectedLabToPrint && (
        <div className="modal-overlay" onClick={() => setSelectedLabToPrint(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', backgroundColor: '#ffffff' }}>
            <div className="modal-header no-print">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>معاينة وطباعة إحالة الفحص الطبي</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  🖨️ طباعة الآن
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setSelectedLabToPrint(null)}>
                  ✕
                </button>
              </div>
            </div>

            <div className="printable-area" style={{
              padding: '32px',
              backgroundColor: '#ffffff',
              border: '2px solid #8b5cf6',
              borderRadius: '8px',
              margin: '16px',
              fontFamily: 'var(--font-arabic)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '2px solid #8b5cf6',
                paddingBottom: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <h2 style={{ color: '#7c3aed', fontSize: '1.3rem', fontWeight: 800 }}>ميديكال هاب التخصصي</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>إحالة فحص مخبري وأشعة تشخيصية</p>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span className="badge badge-purple" style={{ fontSize: '0.9rem' }}>{selectedLabToPrint.code}</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{selectedLabToPrint.date}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#faf5ff', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem' }}>
                <div><strong>المريض:</strong> {selectedLabToPrint.patientName} ({selectedLabToPrint.patientPhone})</div>
                <div><strong>الطبيب المحيل:</strong> {selectedLabToPrint.doctorName} - {selectedLabToPrint.clinicName}</div>
                <div><strong>الأولوية:</strong> {selectedLabToPrint.priority}</div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '1.05rem', color: '#6d28d9', marginBottom: '12px' }}>
                  📋 الفحوصات والتحاليل المطلوبة:
                </h4>
                <ol style={{ paddingRight: '24px', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedLabToPrint.tests?.map((t, idx) => (
                    <li key={idx}><strong>{t}</strong></li>
                  ))}
                </ol>
              </div>

              {selectedLabToPrint.notes && (
                <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '20px' }}>
                  <strong>تعليمات:</strong> {selectedLabToPrint.notes}
                </div>
              )}

              <div style={{ borderTop: '2px solid #8b5cf6', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>قسم المختبرات والأشعة • للاستعلام: 01012345671</span>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px' }}>توقيع الطبيب المحيل</div>
                  <div style={{ fontWeight: 700 }}>{selectedLabToPrint.doctorName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
