import React, { useState } from 'react';

export default function VitalsModal({ appointment, onClose, onSaveVitals }) {
  const existing = appointment.vitals || {};

  const [systolic, setSystolic] = useState(existing.bp ? existing.bp.split('/')[0] || '120' : '120');
  const [diastolic, setDiastolic] = useState(existing.bp ? existing.bp.split('/')[1] || '80' : '80');
  const [pulse, setPulse] = useState(existing.pulse || '75');
  const [temp, setTemp] = useState(existing.temp || '37.0');
  const [bloodSugar, setBloodSugar] = useState(existing.bloodSugar || '110');
  const [weight, setWeight] = useState(existing.weight || '75');
  const [height, setHeight] = useState(existing.height || '170');
  const [notes, setNotes] = useState(existing.notes || '');

  // Calculate BMI dynamically
  const weightNum = parseFloat(weight);
  const heightM = parseFloat(height) / 100;
  const bmi = (weightNum > 0 && heightM > 0) ? (weightNum / (heightM * heightM)).toFixed(1) : null;

  const getBmiCategory = (val) => {
    if (!val) return null;
    if (val < 18.5) return { label: 'نقص وزن', color: 'var(--amber-600)' };
    if (val < 25) return { label: 'وزن مثالي وطبيعي', color: 'var(--emerald-600)' };
    if (val < 30) return { label: 'زيادة في الوزن', color: 'var(--amber-600)' };
    return { label: 'سمنة مفرطة', color: 'var(--rose-600)' };
  };

  const bmiCat = getBmiCategory(bmi);

  // Blood Pressure status analysis
  const sysNum = parseInt(systolic);
  const diaNum = parseInt(diastolic);
  let bpStatus = { label: 'طبيعي ومثالي', color: 'var(--emerald-600)' };
  if (sysNum >= 140 || diaNum >= 90) {
    bpStatus = { label: 'مرتفع (مرحلة 2)', color: 'var(--rose-600)' };
  } else if (sysNum >= 130 || diaNum >= 80) {
    bpStatus = { label: 'مرتفع طفيفاً (مرحلة 1)', color: 'var(--amber-600)' };
  } else if (sysNum >= 120 && diaNum < 80) {
    bpStatus = { label: 'فوق المثالي', color: 'var(--teal-600)' };
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveVitals(appointment.id, {
      bp: `${systolic}/${diastolic}`,
      pulse,
      temp,
      bloodSugar,
      weight,
      height,
      notes
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🩺</span>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                تسجيل وفحص العلامات الحيوية (Vital Signs)
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                المريض: {appointment.patientName} • عيادة {appointment.clinicName}
              </span>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Blood Pressure (BP) */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>💓 ضغط الدم (Blood Pressure mmHg)</label>
                <span className="badge" style={{ color: bpStatus.color, backgroundColor: '#ffffff', border: '1px solid var(--border-light)' }}>
                  {bpStatus.label}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>الانقباضي (Systolic):</span>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="120"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>الانبساطي (Diastolic):</span>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="80"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Pulse & Temperature & Blood Sugar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">🫀 نبض القلب (bpm)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="75"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">🌡️ درجة الحرارة (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  placeholder="37.0"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">🩸 السكر العشوائي (mg/dL)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="110"
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(e.target.value)}
                />
              </div>
            </div>

            {/* Weight, Height & BMI calculation */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              border: '1px solid var(--border-light)'
            }}>
              <label className="form-label" style={{ marginBottom: '8px' }}>⚖️ القياسات البدنية وكتلة الجسم (BMI)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>الوزن (كجم):</span>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control"
                    placeholder="75"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>الطول (سم):</span>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="170"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>

                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>مؤشر كتلة الجسم</span>
                  <strong className="num-display" style={{ fontSize: '1.2rem', color: 'var(--primary-700)' }}>
                    {bmi || '-'}
                  </strong>
                  {bmiCat && (
                    <span style={{ fontSize: '0.78rem', color: bmiCat.color, display: 'block', fontWeight: 700 }}>
                      {bmiCat.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">ملاحظات الفحص السريري</label>
              <input
                type="text"
                className="form-control"
                placeholder="أي ملاحظات إضافية على حالة المريض..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              حفظ وتوثيق العلامات الحيوية
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
