import React, { useState } from 'react';
import {
  printHtmlContent,
  formatPhoneForWhatsApp,
  buildPrescriptionWhatsAppText,
  buildLabWhatsAppText,
  captureElementAsImage,
  copyBlobToClipboard,
  downloadBlobAsFile,
  shareBlobFile
} from '../utils/printHelper';
import {
  formatDoctorName,
  formatDoctorTitle,
  formatClinicName,
  formatBranchName,
  formatPatientName,
  formatDiagnosis,
  formatMedicineName,
  formatMedicineForm,
  formatDosage,
  formatDuration,
  formatInstructions,
  formatFollowUp
} from '../utils/prescriptionTranslation';

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

  // Print language & WhatsApp modal state
  const [rxPrintLang, setRxPrintLang] = useState('ar'); // 'ar' or 'en'
  const [labPrintLang, setLabPrintLang] = useState('ar'); // 'ar' or 'en'
  const [whatsAppModalData, setWhatsAppModalData] = useState(null); // { type, item, phone, lang, isGeneratingImage, imageDataUrl, imageBlob, copied, downloaded, sent }

  // Handlers for printing and WhatsApp
  const handlePrintRx = () => {
    if (!selectedRxToPrint) return;
    const rxEl = document.getElementById('printable-prescription-document');
    if (rxEl) {
      printHtmlContent(rxEl.innerHTML, `Prescription_${selectedRxToPrint.code || 'RX'}`, rxPrintLang);
    } else {
      window.print();
    }
  };

  const handlePrintLab = () => {
    if (!selectedLabToPrint) return;
    const labEl = document.getElementById('printable-lab-document');
    if (labEl) {
      printHtmlContent(labEl.innerHTML, `Lab_Order_${selectedLabToPrint.code || 'LAB'}`, labPrintLang);
    } else {
      window.print();
    }
  };

  // Helper to generate the image of the prescription or lab slip
  const triggerImageGeneration = async (type) => {
    const elId = type === 'rx' ? 'printable-prescription-document' : 'printable-lab-document';
    const el = document.getElementById(elId);
    if (el) {
      const result = await captureElementAsImage(el);
      if (result) {
        setWhatsAppModalData(prev => prev ? ({
          ...prev,
          isGeneratingImage: false,
          imageDataUrl: result.dataUrl,
          imageBlob: result.blob
        }) : null);
        return;
      }
    }
    setWhatsAppModalData(prev => prev ? ({ ...prev, isGeneratingImage: false }) : null);
  };

  const handleOpenWhatsAppModal = (type, item) => {
    if (type === 'rx') {
      setSelectedRxToPrint(item);
    } else {
      setSelectedLabToPrint(item);
    }

    const patientObj = patients.find(p => p.id === item.patientId || p.phone === item.patientPhone);
    const patientPhone = patientObj?.phone || item.patientPhone || '';
    const currentLang = type === 'rx' ? rxPrintLang : labPrintLang;

    setWhatsAppModalData({
      type,
      item,
      phone: patientPhone,
      lang: currentLang,
      isGeneratingImage: true,
      imageDataUrl: null,
      imageBlob: null,
      copied: false,
      downloaded: false,
      sent: false
    });

    // Capture the rendered document element as a crisp PNG image
    setTimeout(() => {
      triggerImageGeneration(type);
    }, 250);
  };

  // When language is switched inside the WhatsApp modal
  const handleWhatsAppLangChange = (newLang) => {
    if (whatsAppModalData?.type === 'rx') {
      setRxPrintLang(newLang);
    } else {
      setLabPrintLang(newLang);
    }

    setWhatsAppModalData(prev => ({
      ...prev,
      lang: newLang,
      isGeneratingImage: true,
      imageDataUrl: null,
      imageBlob: null
    }));

    setTimeout(() => {
      triggerImageGeneration(whatsAppModalData?.type || 'rx');
    }, 250);
  };

  // Send WhatsApp with image (copies image to clipboard, downloads backup, and opens chat)
  const handleSendWhatsAppImage = async () => {
    if (!whatsAppModalData) return;
    const { type, item, phone, lang, imageBlob } = whatsAppModalData;
    const cleanPhone = formatPhoneForWhatsApp(phone);
    if (!cleanPhone) {
      alert('يرجى إدخال رقم هاتف صحيح للواتساب');
      return;
    }

    const filename = `${type === 'rx' ? 'الروشتة_الطبية' : 'إحالة_فحص'}_${item.code || 'DOC'}.png`;

    // 1. Copy image to clipboard for instant Ctrl + V paste
    if (imageBlob) {
      await copyBlobToClipboard(imageBlob);
    }

    // 2. Download backup image file
    if (imageBlob) {
      downloadBlobAsFile(imageBlob, filename);
    }

    // 3. If native share is supported, try direct mobile share
    if (imageBlob) {
      const shared = await shareBlobFile(
        imageBlob,
        filename,
        `روشتة ${item.patientName}`,
        lang === 'ar' ? `روشتة طبية معتمدة من Clini-Tech للمريض ${item.patientName}` : `Medical Prescription from Clini-Tech for ${item.patientName}`
      );
      if (shared) {
        setWhatsAppModalData(prev => prev ? ({ ...prev, copied: true, sent: true }) : null);
        return;
      }
    }

    // 4. Open WhatsApp Web / Mobile chat
    const caption = lang === 'ar'
      ? `🏥 *Clini-Tech | كليني تك*\n✨ إدارة أسهل.. رعاية أفضل\n📋 روشتة طبية معتمدة للمريض: *${item.patientName}*\n👨‍⚕️ الطبيب: ${item.doctorName} (${item.clinicName})\n📅 التاريخ: ${item.date}`
      : `🏥 *Clini-Tech Specialized Clinics*\n✨ Easier Management.. Better Care\n📋 Official Prescription for: *${item.patientName}*\n👨‍⚕️ Doctor: ${item.doctorName} (${item.clinicName})\n📅 Date: ${item.date}`;

    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(caption)}`;
    window.open(waUrl, '_blank');

    setWhatsAppModalData(prev => prev ? ({ ...prev, copied: true, sent: true }) : null);
  };

  // Copy Image to Clipboard
  const handleCopyImageOnly = async () => {
    if (!whatsAppModalData?.imageBlob) return;
    const success = await copyBlobToClipboard(whatsAppModalData.imageBlob);
    if (success) {
      setWhatsAppModalData(prev => ({ ...prev, copied: true }));
      setTimeout(() => {
        setWhatsAppModalData(prev => prev ? ({ ...prev, copied: false }) : null);
      }, 3000);
    } else {
      alert('تم تجهيز الصورة، يمكنك الضغط كليك يمين على المعاينة واختيار Copy Image');
    }
  };

  // Download image file
  const handleDownloadImageOnly = () => {
    if (!whatsAppModalData?.imageBlob) return;
    const filename = `${whatsAppModalData.type === 'rx' ? 'الروشتة_الطبية' : 'إحالة_فحص'}_${whatsAppModalData.item?.code || 'DOC'}.png`;
    downloadBlobAsFile(whatsAppModalData.imageBlob, filename);
    setWhatsAppModalData(prev => ({ ...prev, downloaded: true }));
    setTimeout(() => {
      setWhatsAppModalData(prev => prev ? ({ ...prev, downloaded: false }) : null);
    }, 2500);
  };

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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px', backgroundColor: '#ffffff' }}>
            {/* Action Bar / Modal Header */}
            <div className="modal-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  {rxPrintLang === 'ar' ? 'معاينة وطباعة الروشتة الطبية' : 'Prescription Preview & Print'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {rxPrintLang === 'ar' ? 'طباعة مباشرة على أي طابعة أو حفظ كملف PDF ومشاركتها عبر الواتساب' : 'Direct print to printer, save as PDF, or share via WhatsApp'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Language Toggle */}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    backgroundColor: rxPrintLang === 'en' ? 'var(--primary-50)' : '#ffffff',
                    borderColor: 'var(--primary-400)'
                  }}
                  onClick={() => setRxPrintLang(rxPrintLang === 'ar' ? 'en' : 'ar')}
                  title={rxPrintLang === 'ar' ? 'التحويل للغة الإنجليزية' : 'التحويل للغة العربية'}
                >
                  🌐 {rxPrintLang === 'ar' ? 'English' : 'عربي'}
                </button>

                {/* WhatsApp Share Button */}
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onClick={() => handleOpenWhatsAppModal('rx', selectedRxToPrint)}
                  title="إرسال الروشتة عبر الواتساب"
                >
                  <span>📲</span> {rxPrintLang === 'ar' ? 'إرسال واتساب' : 'WhatsApp'}
                </button>

                {/* Print to Printer or Save as PDF */}
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  onClick={handlePrintRx}
                  title="طباعة على طابعة أو حفظ كملف PDF"
                >
                  <span>🖨️</span> {rxPrintLang === 'ar' ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedRxToPrint(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Document Container */}
            <div
              id="printable-prescription-document"
              className="printable-area"
              dir={rxPrintLang === 'ar' ? 'rtl' : 'ltr'}
              style={{
                padding: '36px',
                backgroundColor: '#ffffff',
                minHeight: '620px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontFamily: rxPrintLang === 'ar' ? "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif" : "'Outfit', 'Inter', 'Segoe UI', Arial, sans-serif",
                direction: rxPrintLang === 'ar' ? 'rtl' : 'ltr',
                textAlign: rxPrintLang === 'ar' ? 'right' : 'left',
                border: '2px solid #0284c7',
                borderRadius: '10px',
                margin: '16px',
                boxSizing: 'border-box'
              }}
            >
              <div>
                {/* Header: Balanced, No Overlapping Text */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '2.5px solid #0284c7',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                  gap: '16px'
                }}>
                  {/* Brand & Branch */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: rxPrintLang === 'ar' ? 'flex-start' : 'flex-start',
                    gap: '6px'
                  }}>
                    <img
                      src="/logo.png"
                      alt="Clini-Tech"
                      crossOrigin="anonymous"
                      style={{ height: '52px', maxWidth: '220px', objectFit: 'contain', display: 'block' }}
                    />
                    <span style={{
                      fontSize: '0.82rem',
                      color: '#0284c7',
                      fontWeight: 700,
                      backgroundColor: '#f0f9ff',
                      padding: '3px 12px',
                      borderRadius: '6px',
                      border: '1px solid #bae6fd',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      📍 {formatBranchName(selectedRxToPrint.branchName, rxPrintLang)}
                    </span>
                  </div>

                  {/* Doctor Info */}
                  <div style={{
                    textAlign: rxPrintLang === 'ar' ? 'left' : 'right',
                    direction: rxPrintLang === 'ar' ? 'rtl' : 'ltr',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      margin: 0,
                      color: '#0f172a',
                      lineHeight: 1.3
                    }}>
                      {formatDoctorName(selectedRxToPrint.doctorName, rxPrintLang)}
                    </h3>
                    <p style={{
                      fontSize: '0.86rem',
                      color: '#475569',
                      margin: 0,
                      fontWeight: 600
                    }}>
                      {formatDoctorTitle(selectedRxToPrint.doctorTitle, rxPrintLang)}
                    </p>
                    <span style={{
                      fontSize: '0.84rem',
                      color: '#0284c7',
                      fontWeight: 700
                    }}>
                      {formatClinicName(selectedRxToPrint.clinicName, rxPrintLang)}
                    </span>
                  </div>
                </div>

                {/* Patient Information: 4-Column Clean Grid */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 18px',
                  marginBottom: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  textAlign: rxPrintLang === 'ar' ? 'right' : 'left',
                  direction: rxPrintLang === 'ar' ? 'rtl' : 'ltr'
                }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                      {rxPrintLang === 'ar' ? 'اسم المريض' : 'Patient Name'}
                    </span>
                    <strong style={{ color: '#0f172a', fontSize: '0.96rem', display: 'block' }}>
                      {formatPatientName(selectedRxToPrint.patientName, rxPrintLang)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                      {rxPrintLang === 'ar' ? 'كود المريض' : 'Patient ID'}
                    </span>
                    <span dir="ltr" style={{ color: '#0284c7', fontWeight: 700, fontSize: '0.92rem', display: 'block' }}>
                      {selectedRxToPrint.patientCode || '---'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                      {rxPrintLang === 'ar' ? 'رقم الروشتة' : 'Rx Number'}
                    </span>
                    <span dir="ltr" style={{ color: '#0284c7', fontWeight: 700, fontSize: '0.92rem', display: 'block' }}>
                      {selectedRxToPrint.code}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                      {rxPrintLang === 'ar' ? 'التاريخ' : 'Date'}
                    </span>
                    <span dir="ltr" style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.92rem', display: 'block' }}>
                      {selectedRxToPrint.date}
                    </span>
                  </div>
                </div>

                {/* Diagnosis */}
                {selectedRxToPrint.diagnosis && (
                  <div style={{
                    marginBottom: '20px',
                    backgroundColor: '#f8fafc',
                    borderInlineStart: '4px solid #0284c7',
                    padding: '10px 16px',
                    borderRadius: '4px',
                    textAlign: rxPrintLang === 'ar' ? 'right' : 'left'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '3px' }}>
                      {rxPrintLang === 'ar' ? 'التشخيص الطبي:' : 'Clinical Diagnosis:'}
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                      {formatDiagnosis(selectedRxToPrint.diagnosis, rxPrintLang)}
                    </strong>
                  </div>
                )}

                {/* Rx Symbol */}
                <div style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  fontFamily: 'serif',
                  color: '#0284c7',
                  marginBottom: '10px',
                  lineHeight: 1,
                  textAlign: rxPrintLang === 'ar' ? 'right' : 'left'
                }}>
                  ℞
                </div>

                {/* Medicines List: Structured Cards to prevent any text overlap */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {selectedRxToPrint.medicines?.map((med, i) => {
                    const medInfo = formatMedicineName(med.name, rxPrintLang);
                    const formDisplay = formatMedicineForm(med.form, rxPrintLang);
                    const dosageDisplay = formatDosage(med.dosage, rxPrintLang);
                    const durationDisplay = formatDuration(med.duration, rxPrintLang);

                    return (
                      <div
                        key={i}
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          textAlign: rxPrintLang === 'ar' ? 'right' : 'left'
                        }}
                      >
                        {/* Title & Form Row */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid #edf2f7',
                          paddingBottom: '8px',
                          gap: '10px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              backgroundColor: '#0284c7',
                              color: '#ffffff',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              flexShrink: 0
                            }}>
                              {i + 1}
                            </span>
                            <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                              {medInfo.main}
                            </strong>
                            {medInfo.sub && (
                              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                {medInfo.sub}
                              </span>
                            )}
                          </div>

                          {formDisplay && (
                            <span style={{
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              flexShrink: 0,
                              whiteSpace: 'nowrap'
                            }}>
                              {formDisplay}
                            </span>
                          )}
                        </div>

                        {/* Dosage & Duration Row */}
                        <div style={{
                          display: 'flex',
                          gap: '24px',
                          flexWrap: 'wrap',
                          fontSize: '0.88rem',
                          color: '#334155'
                        }}>
                          <div>
                            <strong style={{ color: '#0369a1' }}>
                              {rxPrintLang === 'ar' ? 'الجرعة:' : 'Dosage:'}
                            </strong>{' '}
                            <span>{dosageDisplay}</span>
                          </div>

                          {durationDisplay && (
                            <div>
                              <strong style={{ color: '#0369a1' }}>
                                {rxPrintLang === 'ar' ? 'المدة:' : 'Duration:'}
                              </strong>{' '}
                              <span>{durationDisplay}</span>
                            </div>
                          )}

                          {med.notes && (
                            <div style={{ color: '#64748b' }}>
                              <strong>{rxPrintLang === 'ar' ? 'ملاحظة:' : 'Note:'}</strong> {med.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Doctor's Advice / Instructions */}
                {selectedRxToPrint.instructions && (
                  <div style={{
                    marginTop: '16px',
                    backgroundColor: '#f8fafc',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    textAlign: rxPrintLang === 'ar' ? 'right' : 'left'
                  }}>
                    <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '4px', color: '#0284c7' }}>
                      💡 {rxPrintLang === 'ar' ? 'تعليمات وإرشادات الطبيب:' : "Doctor's Advice & Instructions:"}
                    </strong>
                    <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0, lineHeight: 1.55 }}>
                      {formatInstructions(selectedRxToPrint.instructions, rxPrintLang)}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                borderTop: '2px solid #0284c7',
                paddingTop: '16px',
                marginTop: '28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                fontSize: '0.84rem'
              }}>
                <div style={{
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  textAlign: rxPrintLang === 'ar' ? 'right' : 'left'
                }}>
                  {selectedRxToPrint.followUpDate && (
                    <div>
                      <strong style={{ color: '#0f172a' }}>{rxPrintLang === 'ar' ? 'المتابعة والاستشارة:' : 'Next Follow-up:'}</strong>{' '}
                      <span>{formatFollowUp(selectedRxToPrint.followUpDate, rxPrintLang)}</span>
                    </div>
                  )}
                  <div>
                    <strong>{rxPrintLang === 'ar' ? 'للحجز والاستفسار:' : 'For Inquiries & Booking:'}</strong> <span dir="ltr">01012345671</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', minWidth: '170px' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
                    {rxPrintLang === 'ar' ? 'توقيع وختم الطبيب المعالج' : "Doctor's Signature & Official Stamp"}
                  </div>
                  <div style={{
                    fontWeight: 800,
                    borderTop: '1px solid #94a3b8',
                    paddingTop: '5px',
                    fontSize: '0.95rem',
                    color: '#0f172a'
                  }}>
                    {formatDoctorName(selectedRxToPrint.doctorName, rxPrintLang)}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px', backgroundColor: '#ffffff' }}>
            <div className="modal-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  {labPrintLang === 'ar' ? 'معاينة وطباعة إحالة الفحص الطبي' : 'Medical Lab / Radiology Order'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {labPrintLang === 'ar' ? 'طباعة مباشرة أو إرسال التحاليل عبر الواتساب' : 'Direct print or share order via WhatsApp'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    backgroundColor: labPrintLang === 'en' ? 'var(--primary-50)' : '#ffffff',
                    borderColor: 'var(--primary-400)'
                  }}
                  onClick={() => setLabPrintLang(labPrintLang === 'ar' ? 'en' : 'ar')}
                >
                  🌐 {labPrintLang === 'ar' ? 'English' : 'عربي'}
                </button>

                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onClick={() => handleOpenWhatsAppModal('lab', selectedLabToPrint)}
                >
                  <span>📲</span> {labPrintLang === 'ar' ? 'إرسال واتساب' : 'WhatsApp'}
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 800, fontSize: '0.82rem' }}
                  onClick={handlePrintLab}
                >
                  🖨️ {labPrintLang === 'ar' ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedLabToPrint(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              id="printable-lab-document"
              className="printable-area"
              dir={labPrintLang === 'ar' ? 'rtl' : 'ltr'}
              style={{
                padding: '36px',
                backgroundColor: '#ffffff',
                border: '2px solid #8b5cf6',
                borderRadius: '10px',
                margin: '16px',
                fontFamily: labPrintLang === 'ar' ? "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif" : "'Outfit', 'Inter', 'Segoe UI', Arial, sans-serif",
                direction: labPrintLang === 'ar' ? 'rtl' : 'ltr',
                textAlign: labPrintLang === 'ar' ? 'right' : 'left',
                boxSizing: 'border-box'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2.5px solid #8b5cf6',
                paddingBottom: '16px',
                marginBottom: '20px',
                gap: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: labPrintLang === 'ar' ? 'flex-start' : 'flex-start',
                  gap: '6px'
                }}>
                  <img
                    src="/logo.png"
                    alt="Clini-Tech"
                    crossOrigin="anonymous"
                    style={{ height: '52px', maxWidth: '220px', objectFit: 'contain', display: 'block' }}
                  />
                  <span style={{
                    fontSize: '0.82rem',
                    color: '#7c3aed',
                    fontWeight: 700,
                    backgroundColor: '#faf5ff',
                    padding: '2px 10px',
                    borderRadius: '6px',
                    border: '1px solid #e9d5ff',
                    display: 'inline-block'
                  }}>
                    {labPrintLang === 'ar' ? '🔬 قسم المختبرات والأشعة التشخيصية' : '🔬 Laboratory & Diagnostic Radiology'}
                  </span>
                </div>
                <div style={{
                  textAlign: labPrintLang === 'ar' ? 'left' : 'right',
                  direction: labPrintLang === 'ar' ? 'rtl' : 'ltr'
                }}>
                  <span className="badge badge-purple" style={{ fontSize: '0.92rem', padding: '4px 12px' }}>
                    {selectedLabToPrint.code}
                  </span>
                  <div dir="ltr" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                    {selectedLabToPrint.date}
                  </div>
                </div>
              </div>

              {/* Patient and Referral Metadata: 3-Column Structured Grid */}
              <div style={{
                backgroundColor: '#faf5ff',
                border: '1.5px solid #e9d5ff',
                borderRadius: '8px',
                padding: '12px 18px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                textAlign: labPrintLang === 'ar' ? 'right' : 'left'
              }}>
                <div>
                  <span style={{ color: '#7c3aed', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                    {labPrintLang === 'ar' ? 'المريض' : 'Patient'}
                  </span>
                  <strong style={{ color: '#0f172a', fontSize: '0.96rem', display: 'block' }}>
                    {formatPatientName(selectedLabToPrint.patientName, labPrintLang)}
                  </strong>
                  {selectedLabToPrint.patientPhone && (
                    <span dir="ltr" style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                      {selectedLabToPrint.patientPhone}
                    </span>
                  )}
                </div>
                <div>
                  <span style={{ color: '#7c3aed', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                    {labPrintLang === 'ar' ? 'الطبيب المحيل' : 'Referring Physician'}
                  </span>
                  <strong style={{ color: '#0f172a', fontSize: '0.96rem', display: 'block' }}>
                    {formatDoctorName(selectedLabToPrint.doctorName, labPrintLang)}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                    {formatClinicName(selectedLabToPrint.clinicName, labPrintLang)}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#7c3aed', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                    {labPrintLang === 'ar' ? 'درجة الأولوية' : 'Priority'}
                  </span>
                  <span style={{
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: selectedLabToPrint.priority === 'عاجل' ? '#e11d48' : '#7c3aed'
                  }}>
                    {labPrintLang === 'ar' ? selectedLabToPrint.priority : (selectedLabToPrint.priority === 'عاجل' ? 'Urgent / Stat' : 'Normal / Routine')}
                  </span>
                </div>
              </div>

              {/* Tests list */}
              <div style={{ marginBottom: '24px', textAlign: labPrintLang === 'ar' ? 'right' : 'left' }}>
                <h4 style={{ fontSize: '1.05rem', color: '#6d28d9', marginBottom: '12px', fontWeight: 800 }}>
                  📋 {labPrintLang === 'ar' ? 'الفحوصات والتحاليل المطلوبة:' : 'Ordered Tests & Scans:'}
                </h4>
                <ol style={{
                  paddingInlineStart: '24px',
                  fontSize: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {selectedLabToPrint.tests?.map((t, idx) => (
                    <li key={idx}><strong style={{ color: '#1e293b' }}>{t}</strong></li>
                  ))}
                </ol>
              </div>

              {/* Notes */}
              {selectedLabToPrint.notes && (
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  marginBottom: '20px',
                  border: '1px solid #e2e8f0',
                  textAlign: labPrintLang === 'ar' ? 'right' : 'left'
                }}>
                  <strong style={{ color: '#7c3aed' }}>{labPrintLang === 'ar' ? 'تعليمات وملاحظات:' : 'Instructions & Notes:'}</strong> {selectedLabToPrint.notes}
                </div>
              )}

              {/* Footer */}
              <div style={{
                borderTop: '2px solid #8b5cf6',
                paddingTop: '16px',
                marginTop: '28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                fontSize: '0.84rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {labPrintLang === 'ar' ? 'قسم المختبرات والأشعة • للاستعلام: 01012345671' : 'Lab & Radiology Department • Hotline: 01012345671'}
                </span>
                <div style={{ textAlign: 'center', minWidth: '170px' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '30px' }}>
                    {labPrintLang === 'ar' ? 'توقيع الطبيب المحيل' : "Physician's Signature"}
                  </div>
                  <div style={{
                    fontWeight: 800,
                    borderTop: '1px solid #94a3b8',
                    paddingTop: '5px',
                    fontSize: '0.95rem',
                    color: '#0f172a'
                  }}>
                    {formatDoctorName(selectedLabToPrint.doctorName, labPrintLang)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Image Sharing Modal */}
      {whatsAppModalData && (
        <div className="modal-overlay" onClick={() => setWhatsAppModalData(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🖼️ 📲</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                    إرسال الروشتة كصورة عبر الواتساب
                  </h3>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  إرسال صورة الروشتة الأصلية المعتمدة بالكامل مباشرة إلى رقم المريض
                </span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setWhatsAppModalData(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '76vh', overflowY: 'auto' }}>
              {/* Summary Pill */}
              <div style={{
                backgroundColor: 'var(--bg-main)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>المريض: </span>
                  <strong>{whatsAppModalData.item?.patientName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>رقم الروشتة: </span>
                  <strong style={{ color: 'var(--primary-700)' }}>{whatsAppModalData.item?.code}</strong>
                </div>
              </div>

              {/* Phone Input */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 800 }}>
                  رقم هاتف الواتساب للمريض أو المرافق *
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="مثال: 01012345678 أو 201012345678"
                  value={whatsAppModalData.phone}
                  onChange={(e) => setWhatsAppModalData({ ...whatsAppModalData, phone: e.target.value })}
                  style={{ direction: 'ltr', textAlign: 'left', fontWeight: 700, fontSize: '1.05rem', paddingLeft: '14px' }}
                  autoFocus
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  سيتم فتح محادثة الواتساب لهذا الرقم فوراً لإرسال صورة الروشتة
                </span>
              </div>

              {/* Language Selector for Image */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 800 }}>لغة الروشتة في الصورة</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${whatsAppModalData.lang === 'ar' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, fontWeight: 700 }}
                    onClick={() => handleWhatsAppLangChange('ar')}
                  >
                    🇪🇬 لغة عربية (Arabic)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${whatsAppModalData.lang === 'en' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, fontWeight: 700 }}
                    onClick={() => handleWhatsAppLangChange('en')}
                  >
                    🇬🇧 إنجليزي (English)
                  </button>
                </div>
              </div>

              {/* Image Preview Area */}
              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontWeight: 800, margin: 0 }}>
                    معاينة صورة الروشتة (كما ستصل للمريض):
                  </label>
                  {whatsAppModalData.imageDataUrl && (
                    <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>
                      ✓ جاهزة كصورة عالية الدقة PNG
                    </span>
                  )}
                </div>

                {whatsAppModalData.isGeneratingImage ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '36px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px dashed var(--border-light)',
                    color: 'var(--primary-700)'
                  }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📸 ⏳</div>
                    <strong style={{ fontSize: '0.95rem', display: 'block' }}>جارٍ إنشاء صورة الروشتة بدقة فائقة...</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>يتم تحويل وتنسيق الروشتة إلى صورة مجهزة للإرسال</span>
                  </div>
                ) : whatsAppModalData.imageDataUrl ? (
                  <div style={{
                    border: '1.5px solid #0284c7',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    backgroundColor: '#f1f5f9',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative'
                  }}>
                    <img
                      src={whatsAppModalData.imageDataUrl}
                      alt="معاينة صورة الروشتة"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    تعذر تحميل المعاينة، اضغط على زر الإرسال بالأسفل.
                  </div>
                )}
              </div>

              {/* Instructions banner */}
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '0.83rem',
                color: '#1e40af',
                lineHeight: 1.45
              }}>
                💡 <strong>طريقة الإرسال السريعة:</strong> عند الضغط على <strong>"فتح الواتساب وإرسال الصورة"</strong>، يتم نسخ الصورة تلقائياً للحافظة وتنزيلها، وبمجرد فتح شات الواتساب اضغط فقط <strong>(Ctrl + V)</strong> أو <strong>(لصق)</strong> لإرسال صورة الروشتة فوراً!
              </div>

              {/* Success toasts */}
              {whatsAppModalData.copied && (
                <div style={{
                  backgroundColor: '#dcfce7',
                  border: '1px solid #86efac',
                  color: '#15803d',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textAlign: 'center'
                }}>
                  ✅ تم نسخ صورة الروشتة إلى الحافظة بنجاح! الصقها مباشرة في الواتساب (Ctrl + V).
                </div>
              )}

              {whatsAppModalData.downloaded && (
                <div style={{
                  backgroundColor: '#dbeafe',
                  border: '1px solid #93c5fd',
                  color: '#1e40af',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textAlign: 'center'
                }}>
                  ✓ تم تنزيل ملف صورة الروشتة على جهازك بنجاح!
                </div>
              )}
            </div>

            {/* Modal Footer Buttons */}
            <div className="modal-footer" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  flex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 16px'
                }}
                onClick={handleSendWhatsAppImage}
                disabled={whatsAppModalData.isGeneratingImage}
              >
                <span>📲</span> فتح الواتساب وإرسال الصورة (Ctrl + V)
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ flex: 1, fontWeight: 700 }}
                onClick={handleDownloadImageOnly}
                disabled={whatsAppModalData.isGeneratingImage || !whatsAppModalData.imageBlob}
                title="تنزيل الصورة وحفظها على الجهاز"
              >
                📥 تنزيل الصورة
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ flex: 1, fontWeight: 700 }}
                onClick={handleCopyImageOnly}
                disabled={whatsAppModalData.isGeneratingImage || !whatsAppModalData.imageBlob}
                title="نسخ الصورة للحافظة للصقها في أي مكان"
              >
                📋 نسخ الصورة
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setWhatsAppModalData(null)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
