import React, { useState } from 'react';
import { showAlert, showConfirm } from '../utils/dialog';

// All available system permissions
const ALL_PERMISSIONS = [
  { key: 'dashboard:view', label: 'لوحة المؤشرات', desc: 'مشاهدة إحصائيات الإيرادات والمرضى والأداء' },
  { key: 'queue:view', label: 'طابور الانتظار', desc: 'استعراض المرضى في صالة الانتظار اليوم' },
  { key: 'queue:manage', label: 'إدارة الطابور', desc: 'إدخال المريض للطبيب وإنهاء الكشوفات' },
  { key: 'patients:view', label: 'استعراض المرضى', desc: 'البحث واستعراض الملفات الأساسية للمرضى' },
  { key: 'patients:sensitive', label: 'الملفات الطبية الحساسة', desc: 'مشاهدة الأمراض المزمنة، الحساسيات، والأدوية (EMR)' },
  { key: 'patients:create', label: 'تسجيل مرضى جدد', desc: 'إضافة وفتح ملفات طبية جديدة' },
  { key: 'prescriptions:view', label: 'استعراض الروشتات', desc: 'مشاهدة وطباعة الروشتات الطبية' },
  { key: 'prescriptions:create', label: 'كتابة روشتات وفحوصات', desc: 'إصدار الروشتات العلاجية وطلبات التحاليل' },
  { key: 'finances:view', label: 'استعراض الخزينة', desc: 'مشاهدة الإيرادات والمصروفات والأرباح' },
  { key: 'finances:create', label: 'تسجيل مصروفات', desc: 'تسجيل سندات الصرف في الخزينة' },
  { key: 'settings:manage', label: 'إدارة النظام والمستخدمين', desc: 'إضافة وتعديل المستخدمين والصلاحيات والفروع' }
];

export default function SettingsView({
  users,
  branches,
  doctors,
  clinics,
  currentUser,
  onSaveUser,
  onDeleteUser,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onAddClinic,
  onUpdateClinic,
  onDeleteClinic,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor
}) {
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users', 'branches', 'clinics', 'doctors'
  const [editingUser, setEditingUser] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [editingClinic, setEditingClinic] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isNewBranchModalOpen, setIsNewBranchModalOpen] = useState(false);
  const [isNewClinicModalOpen, setIsNewClinicModalOpen] = useState(false);
  const [isNewDoctorModalOpen, setIsNewDoctorModalOpen] = useState(false);

  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'reception',
    title: '',
    branchId: 'br_maadi',
    doctorId: '',
    phone: '',
    permissions: ['dashboard:view', 'queue:view', 'patients:view']
  });

  const [branchForm, setBranchForm] = useState({
    name: '',
    address: '',
    phone: '',
    isMain: false
  });

  const [clinicForm, setClinicForm] = useState({
    name: '',
    icon: '🩺',
    workingHours: 'يومياً من 09:00 ص إلى 10:00 م',
    description: ''
  });

  const [doctorForm, setDoctorForm] = useState({
    name: '',
    title: 'استشاري',
    clinicId: clinics[0]?.id || 'cl_internal',
    branchIds: ['br_maadi'],
    consultationFee: 400,
    followUpFee: 150,
    phone: '',
    avatar: '👨‍⚕️',
    schedule: [
      { day: 'السبت', time: '10:00 ص - 02:00 م', branchId: branches[0]?.id || 'br_maadi' }
    ]
  });

  // Handle opening user for edit
  const handleEditUserClick = (u) => {
    setEditingUser(u);
    setShowUserPassword(false);
    setUserForm({
      name: u.name,
      username: u.username,
      password: u.password || '',
      role: u.role,
      title: u.title || '',
      branchId: u.branchId || 'all',
      doctorId: u.doctorId || '',
      phone: u.phone || '',
      permissions: u.permissions || []
    });
  };

  // Toggle permission in user form
  const handleTogglePermission = (permKey) => {
    const current = [...userForm.permissions];
    if (current.includes(permKey)) {
      setUserForm({ ...userForm, permissions: current.filter(k => k !== permKey) });
    } else {
      setUserForm({ ...userForm, permissions: [...current, permKey] });
    }
  };

  const handleSelectAllPermissions = () => {
    setUserForm({ ...userForm, permissions: ALL_PERMISSIONS.map(p => p.key) });
  };

  const handleClearAllPermissions = () => {
    setUserForm({ ...userForm, permissions: [] });
  };

  // Submit User (create or update)
  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.username) {
      showAlert('الاسم واسم المستخدم حقول مطلوبة لتسجيل الحساب.', 'بيانات ناقصة', 'warning');
      return;
    }
    if (!editingUser && !userForm.password) {
      showAlert('كلمة المرور مطلوبة للمستخدم الجديد.', 'بيانات ناقصة', 'warning');
      return;
    }

    onSaveUser(editingUser ? editingUser.id : null, userForm);
    setEditingUser(null);
    setIsNewUserModalOpen(false);
  };

  // Edit Branch Handler
  const handleEditBranchClick = (b) => {
    setEditingBranch(b);
    setBranchForm({
      name: b.name,
      address: b.address || '',
      phone: b.phone || '',
      isMain: Boolean(b.isMain)
    });
    setIsNewBranchModalOpen(true);
  };

  // Submit Branch
  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    if (!branchForm.name.trim()) return;
    if (editingBranch && onUpdateBranch) {
      await onUpdateBranch(editingBranch.id, branchForm);
    } else {
      await onAddBranch(branchForm);
    }
    setIsNewBranchModalOpen(false);
    setEditingBranch(null);
    setBranchForm({ name: '', address: '', phone: '', isMain: false });
  };

  // Edit Clinic Handler
  const handleEditClinicClick = (c) => {
    setEditingClinic(c);
    setClinicForm({
      name: c.name || '',
      icon: c.icon || '🩺',
      workingHours: c.workingHours || 'يومياً من 09:00 ص إلى 10:00 م',
      description: c.description || ''
    });
    setIsNewClinicModalOpen(true);
  };

  // Submit Clinic
  const handleClinicSubmit = async (e) => {
    e.preventDefault();
    if (!clinicForm.name.trim()) return;
    if (editingClinic && onUpdateClinic) {
      await onUpdateClinic(editingClinic.id, clinicForm);
    } else if (onAddClinic) {
      await onAddClinic(clinicForm);
    }
    setIsNewClinicModalOpen(false);
    setEditingClinic(null);
    setClinicForm({ name: '', icon: '🩺', workingHours: 'يومياً من 09:00 ص إلى 10:00 م', description: '' });
  };

  // Edit Doctor Handler
  const handleEditDoctorClick = (doc) => {
    setEditingDoctor(doc);
    setDoctorForm({
      name: doc.name || '',
      title: doc.title || '',
      clinicId: doc.clinicId || (clinics[0]?.id || 'cl_internal'),
      branchIds: Array.isArray(doc.branchIds) && doc.branchIds.length > 0 ? doc.branchIds : [branches[0]?.id || 'br_maadi'],
      consultationFee: doc.consultationFee !== undefined ? doc.consultationFee : 400,
      followUpFee: doc.followUpFee !== undefined ? doc.followUpFee : 150,
      phone: doc.phone || '',
      avatar: doc.avatar || '👨‍⚕️',
      schedule: Array.isArray(doc.schedule) && doc.schedule.length > 0
        ? doc.schedule.map(s => ({ ...s }))
        : [{ day: 'السبت', time: '10:00 ص - 02:00 م', branchId: branches[0]?.id || 'br_maadi' }]
    });
    setIsNewDoctorModalOpen(true);
  };

  // Schedule slot helpers
  const handleAddScheduleSlot = () => {
    setDoctorForm(prev => ({
      ...prev,
      schedule: [
        ...(prev.schedule || []),
        { day: 'السبت', time: '10:00 ص - 02:00 م', branchId: branches[0]?.id || 'br_maadi' }
      ]
    }));
  };

  const handleRemoveScheduleSlot = (index) => {
    setDoctorForm(prev => ({
      ...prev,
      schedule: (prev.schedule || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    setDoctorForm(prev => {
      const updated = [...(prev.schedule || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, schedule: updated };
    });
  };

  // Submit Doctor
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!doctorForm.name.trim()) return;

    // Gather branches from schedule as well
    const scheduledBranchIds = (doctorForm.schedule || []).map(s => s.branchId).filter(Boolean);
    const combinedBranches = Array.from(new Set([...(doctorForm.branchIds || []), ...scheduledBranchIds]));

    const payload = {
      ...doctorForm,
      branchIds: combinedBranches.length > 0 ? combinedBranches : [branches[0]?.id || 'br_maadi']
    };

    if (editingDoctor && onUpdateDoctor) {
      await onUpdateDoctor(editingDoctor.id, payload);
    } else if (onAddDoctor) {
      await onAddDoctor(payload);
    }

    setIsNewDoctorModalOpen(false);
    setEditingDoctor(null);
    setDoctorForm({
      name: '',
      title: 'استشاري',
      clinicId: clinics[0]?.id || 'cl_internal',
      branchIds: [branches[0]?.id || 'br_maadi'],
      consultationFee: 400,
      followUpFee: 150,
      phone: '',
      avatar: '👨‍⚕️',
      schedule: [
        { day: 'السبت', time: '10:00 ص - 02:00 م', branchId: branches[0]?.id || 'br_maadi' }
      ]
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem' }}>⚙️</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>
              لوحة تحكم المالك: إدارة المستخدمين والصلاحيات والمنظومة
            </h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            إضافة وتعديل حسابات الطاقم الطبي والإداري، وتحديد الصلاحيات الدقيقة لكل موظف، وإدارة الفروع والعيادات.
          </p>
        </div>

        {/* Action Button based on sub-tab */}
        {activeSubTab === 'users' && (
          <button
            id="btn-add-new-user"
            className="btn btn-primary"
            onClick={() => {
              setEditingUser(null);
              setUserForm({
                name: '',
                username: '',
                password: '',
                role: 'reception',
                title: '',
                branchId: 'br_maadi',
                doctorId: '',
                phone: '',
                permissions: ['dashboard:view', 'queue:view', 'patients:view']
              });
              setIsNewUserModalOpen(true);
            }}
          >
            ➕ إضافة مستخدم / موظف جديد
          </button>
        )}

        {activeSubTab === 'branches' && (
          <button
            id="btn-add-new-branch"
            className="btn btn-primary"
            onClick={() => {
              setEditingBranch(null);
              setBranchForm({ name: '', address: '', phone: '', isMain: false });
              setIsNewBranchModalOpen(true);
            }}
          >
            ➕ إضافة فرع جديد للمركز
          </button>
        )}

        {activeSubTab === 'clinics' && (
          <button
            id="btn-add-new-clinic"
            className="btn btn-primary"
            onClick={() => {
              setEditingClinic(null);
              setClinicForm({ name: '', icon: '🩺', workingHours: 'يومياً من 09:00 ص إلى 10:00 م', description: '' });
              setIsNewClinicModalOpen(true);
            }}
          >
            ➕ إضافة عيادة جديدة
          </button>
        )}

        {activeSubTab === 'doctors' && (
          <button
            id="btn-add-new-doctor"
            className="btn btn-primary"
            onClick={() => {
              setEditingDoctor(null);
              setDoctorForm({
                name: '',
                title: 'استشاري',
                clinicId: clinics[0]?.id || 'cl_internal',
                branchIds: [branches[0]?.id || 'br_maadi'],
                consultationFee: 400,
                followUpFee: 150,
                phone: '',
                avatar: '👨‍⚕️',
                schedule: [
                  { day: 'السبت', time: '10:00 ص - 02:00 م', branchId: branches[0]?.id || 'br_maadi' }
                ]
              });
              setIsNewDoctorModalOpen(true);
            }}
          >
            ➕ إضافة طبيب ومواعيد العمل
          </button>
        )}
      </div>

      {/* Sub Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        backgroundColor: '#ffffff',
        padding: '10px 16px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        flexWrap: 'wrap'
      }}>
        <button
          className={`btn btn-sm ${activeSubTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
          onClick={() => setActiveSubTab('users')}
        >
          👥 المستخدمين والصلاحيات ({users.length})
        </button>
        <button
          className={`btn btn-sm ${activeSubTab === 'branches' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
          onClick={() => setActiveSubTab('branches')}
        >
          📍 إدارة الفروع ({branches.length})
        </button>
        <button
          className={`btn btn-sm ${activeSubTab === 'clinics' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
          onClick={() => setActiveSubTab('clinics')}
        >
          🏥 العيادات والتخصصات ({clinics.length})
        </button>
        <button
          className={`btn btn-sm ${activeSubTab === 'doctors' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
          onClick={() => setActiveSubTab('doctors')}
        >
          🩺 الأطباء ومواعيد العمل ({doctors.length})
        </button>
      </div>

      {/* TAB 1: USERS & PERMISSIONS */}
      {activeSubTab === 'users' && (
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
                  <th style={{ padding: '14px 18px' }}>الموظف / الاسم</th>
                  <th style={{ padding: '14px 18px' }}>اسم المستخدم</th>
                  <th style={{ padding: '14px 18px' }}>الدور والوظيفة</th>
                  <th style={{ padding: '14px 18px' }}>الفرع المصرح</th>
                  <th style={{ padding: '14px 18px' }}>الصلاحيات الممنوحة</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    {/* Name */}
                    <td style={{ padding: '14px 18px' }}>
                      <strong style={{ fontSize: '0.95rem', display: 'block' }}>{u.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.title || '-'}</span>
                    </td>

                    {/* Username */}
                    <td style={{ padding: '14px 18px' }}>
                      <code style={{
                        backgroundColor: 'var(--bg-main)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--primary-700)'
                      }}>
                        {u.username}
                      </code>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge ${
                        u.role === 'owner' ? 'badge-primary' :
                        u.role === 'doctor' ? 'badge-teal' :
                        u.role === 'manager' ? 'badge-purple' :
                        u.role === 'accountant' ? 'badge-amber' : 'badge-emerald'
                      }`}>
                        {u.role === 'owner' ? '👑 المالك' :
                         u.role === 'manager' ? '🏢 مدير' :
                         u.role === 'doctor' ? '🩺 طبيب' :
                         u.role === 'accountant' ? '💰 محاسب' : '📋 استقبال'}
                      </span>
                    </td>

                    {/* Branch */}
                    <td style={{ padding: '14px 18px', fontSize: '0.85rem' }}>
                      {u.branchId === 'all'
                        ? '🌐 كل الفروع'
                        : (branches.find(b => b.id === u.branchId)?.name || u.branchId)}
                    </td>

                    {/* Permissions summary */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '380px' }}>
                        {u.permissions?.map(pKey => {
                          const pObj = ALL_PERMISSIONS.find(p => p.key === pKey);
                          return (
                            <span key={pKey} className="badge" style={{
                              backgroundColor: '#f1f5f9',
                              color: '#334155',
                              fontSize: '0.72rem',
                              padding: '2px 6px'
                            }}>
                              ✓ {pObj?.label || pKey}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleEditUserClick(u)}
                        >
                          ✏️ تعديل الصلاحيات
                        </button>
                        {u.username !== 'owner' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              showConfirm(
                                `هل أنت متأكد من حذف حساب المستخدم "${u.name}" (${u.username}) نهائياً من المنظومة؟`,
                                () => onDeleteUser(u.id),
                                'تأكيد حذف المستخدم',
                                'danger'
                              );
                            }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BRANCHES */}
      {activeSubTab === 'branches' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '18px'
        }}>
          {branches.map(b => (
            <div key={b.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              padding: '22px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>📍 {b.name}</h3>
                {b.isMain && <span className="badge badge-primary">المقر الرئيسي</span>}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                العنوان: {b.address || 'لم يحدد'}
              </p>
              <div style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: 600, marginBottom: '14px' }}>
                هاتف الفرع: {b.phone || 'غير مسجل'}
              </div>

              {/* Action Buttons for Branch */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, fontWeight: 700 }}
                  onClick={() => handleEditBranchClick(b)}
                >
                  ✏️ تعديل الفرع
                </button>
                {onDeleteBranch && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{
                      flex: 1,
                      color: 'var(--rose-600)',
                      borderColor: 'rgba(244, 63, 94, 0.3)',
                      fontWeight: 700
                    }}
                    onClick={() => {
                      if (branches.length <= 1) {
                        showAlert('لا يمكن حذف الفرع الوحيد، يجب الإبقاء على فرع واحد على الأقل في المركز الطبي.', 'تنبيه من المنظومة', 'warning');
                        return;
                      }
                      showConfirm(
                        `هل أنت متأكد من حذف فرع (${b.name}) نهائياً من المنظومة؟`,
                        () => onDeleteBranch(b.id),
                        'تأكيد حذف الفرع',
                        'danger'
                      );
                    }}
                  >
                    🗑️ حذف
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CLINICS */}
      {activeSubTab === 'clinics' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '18px'
        }}>
          {clinics.map(c => {
            const clinicDocs = doctors.filter(d => d.clinicId === c.id);
            return (
              <div key={c.id} style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-light)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '2.2rem' }}>{c.icon || '🩺'}</span>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{c.name}</h3>
                        <span className="badge badge-primary" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                          👨‍⚕️ {clinicDocs.length} أطباء متاحين
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🕒 مواعيد العمل:</span>
                      <span>{c.workingHours || 'يومياً من 09:00 ص إلى 10:00 م'}</span>
                    </div>
                    {c.description && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        {c.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, fontWeight: 700 }}
                    onClick={() => handleEditClinicClick(c)}
                  >
                    ✏️ تعديل ومواعيد العيادة
                  </button>
                  {onDeleteClinic && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{
                        flex: 1,
                        color: 'var(--rose-600)',
                        borderColor: 'rgba(244, 63, 94, 0.3)',
                        fontWeight: 700
                      }}
                      onClick={() => {
                        if (clinics.length <= 1) {
                          showAlert('لا يمكن حذف العيادة الوحيدة المتبقية في المنظومة. يجب الإبقاء على عيادة أو تخصص واحد على الأقل.', 'تنبيه من المنظومة', 'warning');
                          return;
                        }
                        if (clinicDocs.length > 0) {
                          showConfirm(
                            `هذه العيادة مرتبط بها (${clinicDocs.length}) أطباء مسجلين.\nهل أنت متأكد من حذفها بالكامل من النظام؟`,
                            () => onDeleteClinic(c.id),
                            'تأكيد حذف العيادة',
                            'danger'
                          );
                        } else {
                          showConfirm(
                            `هل أنت متأكد من حذف عيادة (${c.name}) نهائياً من المنظومة؟`,
                            () => onDeleteClinic(c.id),
                            'تأكيد حذف العيادة',
                            'danger'
                          );
                        }
                      }}
                    >
                      🗑️ حذف العيادة
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: DOCTORS */}
      {activeSubTab === 'doctors' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '18px'
        }}>
          {doctors.map(doc => (
            <div key={doc.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '2.2rem' }}>{doc.avatar || '👨‍⚕️'}</span>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{doc.name}</h3>
                      <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{doc.clinicName}</span>
                    </div>
                  </div>
                  <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.9rem' }}>⭐ {doc.rating || 5.0}</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{doc.title}</p>

                {/* Fees and Contact */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-main)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  marginBottom: '10px'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>الكشف: </span>
                    <strong style={{ color: 'var(--primary-700)' }}>{doc.consultationFee} ج.م</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>الإعادة: </span>
                    <strong>{doc.followUpFee || 150} ج.م</strong>
                  </div>
                  {doc.phone && (
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>📞 </span>
                      <strong>{doc.phone}</strong>
                    </div>
                  )}
                </div>

                {/* Schedule preview */}
                <div style={{
                  border: '1px dashed var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                    📅 مواعيد وجدول الكشف:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {Array.isArray(doc.schedule) && doc.schedule.length > 0 ? (
                      doc.schedule.map((slot, sIdx) => {
                        const br = branches.find(b => b.id === slot.branchId);
                        return (
                          <span
                            key={sIdx}
                            style={{
                              fontSize: '0.75rem',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: 'var(--bg-card-subtle)',
                              border: '1px solid var(--border-light)',
                              color: 'var(--text-main)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <strong>{slot.day}:</strong> {slot.time} {br ? `(${br.name})` : ''}
                          </span>
                        );
                      })
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        لم يتم تسجيل جدول مواعيد بعد
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Doctor Actions */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, fontWeight: 700 }}
                  onClick={() => handleEditDoctorClick(doc)}
                >
                  ✏️ تعديل الطبيب والمواعيد
                </button>
                {onDeleteDoctor && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{
                      color: 'var(--rose-600)',
                      borderColor: 'rgba(244, 63, 94, 0.3)',
                      fontSize: '0.78rem',
                      padding: '4px 10px',
                      fontWeight: 700
                    }}
                    onClick={() => {
                      showConfirm(
                        `هل أنت متأكد من حذف الطبيب (${doc.name}) وإزالته من كافة العيادات والمركز نهائياً؟`,
                        () => onDeleteDoctor(doc.id),
                        'تأكيد حذف الطبيب',
                        'danger'
                      );
                    }}
                    title="حذف الطبيب من المركز الطبي"
                  >
                    🗑️ حذف
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Modal (Create or Edit Permissions) */}
      {(isNewUserModalOpen || editingUser) && (
        <div className="modal-overlay" onClick={() => { setIsNewUserModalOpen(false); setEditingUser(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingUser ? `✏️ تعديل بيانات وصلاحيات: ${editingUser.name}` : '➕ إضافة مستخدم وموظف جديد'}
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => { setIsNewUserModalOpen(false); setEditingUser(null); }}>✕</button>
            </div>

            <form onSubmit={handleUserSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Basic info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الاسم الكامل *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="مثال: د. إبراهيم يوسف"
                      required
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">المسمى الوظيفي</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="مثال: مسؤول استقبال مسائي"
                      value={userForm.title}
                      onChange={(e) => setUserForm({ ...userForm, title: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">اسم المستخدم للدخول (Username) *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="dr_ibrahim"
                      required
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 700 }}>
                      {editingUser ? 'كلمة المرور الحالية أو الجديدة' : 'كلمة المرور *'}
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showUserPassword ? 'text' : 'password'}
                        className="form-control"
                        placeholder="••••••••"
                        required={!editingUser}
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        style={{ paddingLeft: '44px', direction: showUserPassword ? 'ltr' : 'inherit', textAlign: showUserPassword ? 'left' : 'right' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowUserPassword(!showUserPassword)}
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
                        title={showUserPassword ? 'إخفاء كلمة المرور' : 'عرض كلمة المرور'}
                      >
                        {showUserPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {editingUser && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        اتركها كما هي للإبقاء عليها، أو عدلها لتغيير كلمة المرور
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الدور العام (Role)</label>
                    <select
                      className="form-control"
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    >
                      <option value="owner">المالك (Owner)</option>
                      <option value="manager">مدير فرع (Manager)</option>
                      <option value="reception">موظف استقبال (Reception)</option>
                      <option value="doctor">طبيب معالج (Doctor)</option>
                      <option value="accountant">محاسب مالي (Accountant)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الفرع المخصص</label>
                    <select
                      className="form-control"
                      value={userForm.branchId}
                      onChange={(e) => setUserForm({ ...userForm, branchId: e.target.value })}
                    >
                      <option value="all">🌐 كل الفروع</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>📍 {b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* If role is doctor, assign to doctor profile */}
                {userForm.role === 'doctor' && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الملف الطبي المرتبط</label>
                    <select
                      className="form-control"
                      value={userForm.doctorId}
                      onChange={(e) => setUserForm({ ...userForm, doctorId: e.target.value })}
                    >
                      <option value="">-- اختر ملف الطبيب --</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.clinicName})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Granular Permissions Section */}
                <div style={{
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                        🔒 الصلاحيات المخصصة لهذا المستخدم (التحكم الدقيق)
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        حدد بدقة الأقسام والعمليات المصرح لهذا الموظف بفتحها والتعامل معها
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.78rem' }}
                        onClick={handleSelectAllPermissions}
                      >
                        تحديد الكل
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.78rem' }}
                        onClick={handleClearAllPermissions}
                      >
                        إلغاء الكل
                      </button>
                    </div>
                  </div>

                  {/* Permissions Checkboxes Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '10px'
                  }}>
                    {ALL_PERMISSIONS.map(p => {
                      const isChecked = userForm.permissions.includes(p.key);
                      return (
                        <div
                          key={p.key}
                          onClick={() => handleTogglePermission(p.key)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            border: `1.5px solid ${isChecked ? 'var(--primary-500)' : 'var(--border-light)'}`,
                            backgroundColor: isChecked ? 'var(--primary-50)' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ marginTop: '4px', cursor: 'pointer' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: isChecked ? 'var(--primary-700)' : 'var(--text-main)', display: 'block' }}>
                              {p.label}
                            </strong>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {p.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'حفظ الصلاحيات والتعديلات' : 'إنشاء المستخدم وتطبيق الصلاحيات'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setIsNewUserModalOpen(false); setEditingUser(null); }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Modal (Create or Edit) */}
      {isNewBranchModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsNewBranchModalOpen(false); setEditingBranch(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingBranch ? `✏️ تعديل بيانات: ${editingBranch.name}` : '➕ إضافة فرع جديد للمركز الطبي'}
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => { setIsNewBranchModalOpen(false); setEditingBranch(null); }}>✕</button>
            </div>

            <form onSubmit={handleBranchSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">اسم الفرع *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="مثال: فرع الشيخ زايد"
                    required
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">العنوان بالتفصيل</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="مثال: محور 26 يوليو، بجوار هايبر وان"
                    value={branchForm.address}
                    onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">رقم الهاتف</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="0238510001"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                  <input
                    type="checkbox"
                    id="checkbox-is-main"
                    checked={Boolean(branchForm.isMain)}
                    onChange={(e) => setBranchForm({ ...branchForm, isMain: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="checkbox-is-main" style={{ cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700 }}>
                    تعيين هذا الفرع كمقر رئيسي للمركز
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  {editingBranch ? 'حفظ التعديلات' : 'حفظ الفرع الجديد'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setIsNewBranchModalOpen(false); setEditingBranch(null); }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clinic Modal (Create or Edit) */}
      {isNewClinicModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsNewClinicModalOpen(false); setEditingClinic(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingClinic ? `✏️ تعديل عيادة ومواعيد: ${editingClinic.name}` : '➕ إضافة عيادة وتخصص جديد'}
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => { setIsNewClinicModalOpen(false); setEditingClinic(null); }}>✕</button>
            </div>

            <form onSubmit={handleClinicSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">اسم العيادة والتخصص الطبي *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="مثال: عيادة المخ والأعصاب والعمود الفقري"
                    required
                    value={clinicForm.name}
                    onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">أيقونة العيادة</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={clinicForm.icon}
                      onChange={(e) => setClinicForm({ ...clinicForm, icon: e.target.value })}
                      style={{ width: '80px', textAlign: 'center', fontSize: '1.3rem' }}
                    />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['🩺', '🦴', '👶', '❤️', '✨', '🦷', '👁️', '🧠', '👂', '🔬'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '1.1rem' }}
                          onClick={() => setClinicForm({ ...clinicForm, icon: emoji })}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">مواعيد عمل العيادة العامة</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="مثال: يومياً من 09:00 ص إلى 10:00 م (ما عدا الجمعة)"
                    value={clinicForm.workingHours}
                    onChange={(e) => setClinicForm({ ...clinicForm, workingHours: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">تفاصيل وخدمات العيادة</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="نبذة عن الفحوصات والخدمات المتاحة في هذه العيادة..."
                    value={clinicForm.description}
                    onChange={(e) => setClinicForm({ ...clinicForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  {editingClinic ? 'حفظ تعديلات العيادة' : 'إنشاء العيادة'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setIsNewClinicModalOpen(false); setEditingClinic(null); }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Modal (Create or Edit with Interactive Schedule Manager) */}
      {isNewDoctorModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsNewDoctorModalOpen(false); setEditingDoctor(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingDoctor ? `✏️ تعديل بيانات ومواعيد: ${editingDoctor.name}` : '➕ إضافة طبيب جديد وجدول مواعيده'}
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => { setIsNewDoctorModalOpen(false); setEditingDoctor(null); }}>✕</button>
            </div>

            <form onSubmit={handleDoctorSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '72vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">اسم الطبيب ثلاثي *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="مثال: د. حسام عبد الغفار"
                      required
                      value={doctorForm.name}
                      onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الدرجة العلمية واللقب</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="استشاري أول جراحة ومناظير"
                      value={doctorForm.title}
                      onChange={(e) => setDoctorForm({ ...doctorForm, title: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">التخصص / العيادة</label>
                    <select
                      className="form-control"
                      value={doctorForm.clinicId}
                      onChange={(e) => setDoctorForm({ ...doctorForm, clinicId: e.target.value })}
                    >
                      {clinics.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">رقم الهاتف للتواصل</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="01012345678"
                      value={doctorForm.phone}
                      onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">سعر الكشف (ج.م)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={doctorForm.consultationFee}
                      onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">سعر الاستشارة / الإعادة (ج.م)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={doctorForm.followUpFee}
                      onChange={(e) => setDoctorForm({ ...doctorForm, followUpFee: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الرمز التعبيري</label>
                    <select
                      className="form-control"
                      value={doctorForm.avatar}
                      onChange={(e) => setDoctorForm({ ...doctorForm, avatar: e.target.value })}
                    >
                      <option value="👨‍⚕️">👨‍⚕️ طبيب</option>
                      <option value="👩‍⚕️">👩‍⚕️ طبيبة</option>
                      <option value="🩺">🩺 سماعة</option>
                      <option value="✨">✨ مميز</option>
                    </select>
                  </div>
                </div>

                {/* Interactive Doctor Schedule Manager */}
                <div style={{
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--primary-700)', margin: 0 }}>
                        🕒 جدول مواعيد الكشف والعيادات
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        حدد الأيام ومواعيد الحضور والفرع لكل موعد للطبيب
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleAddScheduleSlot}
                      style={{ fontSize: '0.8rem', fontWeight: 700 }}
                    >
                      ➕ إضافة موعد آخر
                    </button>
                  </div>

                  {(!doctorForm.schedule || doctorForm.schedule.length === 0) ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '16px',
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem'
                    }}>
                      لا يوجد مواعيد محددة للطبيب حالياً. اضغط "إضافة موعد آخر" لإضافة أول موعد.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {doctorForm.schedule.map((slot, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '130px 1fr 150px 36px',
                            gap: '8px',
                            alignItems: 'center',
                            backgroundColor: '#ffffff',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-light)'
                          }}
                        >
                          {/* Day */}
                          <select
                            className="form-control"
                            style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                            value={slot.day}
                            onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                          >
                            <option value="السبت">السبت</option>
                            <option value="الأحد">الأحد</option>
                            <option value="الإثنين">الإثنين</option>
                            <option value="الثلاثاء">الثلاثاء</option>
                            <option value="الأربعاء">الأربعاء</option>
                            <option value="الخميس">الخميس</option>
                            <option value="الجمعة">الجمعة</option>
                          </select>

                          {/* Time */}
                          <input
                            type="text"
                            className="form-control"
                            style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                            placeholder="مثال: 10:00 ص - 02:00 م"
                            value={slot.time}
                            onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                          />

                          {/* Branch */}
                          <select
                            className="form-control"
                            style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                            value={slot.branchId || branches[0]?.id}
                            onChange={(e) => handleScheduleChange(index, 'branchId', e.target.value)}
                          >
                            {branches.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>

                          {/* Delete Slot Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveScheduleSlot(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--rose-600)',
                              cursor: 'pointer',
                              fontSize: '1.1rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '4px'
                            }}
                            title="حذف هذا الموعد"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  {editingDoctor ? 'حفظ تعديلات الطبيب والمواعيد' : 'حفظ الطبيب والجدول'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setIsNewDoctorModalOpen(false); setEditingDoctor(null); }}
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
