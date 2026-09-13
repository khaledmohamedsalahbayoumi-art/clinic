import React, { useState } from 'react';

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
  onAddDoctor
}) {
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users', 'branches', 'doctors'
  const [editingUser, setEditingUser] = useState(null);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isNewBranchModalOpen, setIsNewBranchModalOpen] = useState(false);
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
    phone: ''
  });

  const [doctorForm, setDoctorForm] = useState({
    name: '',
    title: 'استشاري',
    clinicId: clinics[0]?.id || 'cl_internal',
    branchIds: ['br_maadi'],
    consultationFee: 400,
    phone: ''
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
      alert('الاسم واسم المستخدم حقول مطلوبة');
      return;
    }
    if (!editingUser && !userForm.password) {
      alert('كلمة المرور مطلوبة للمستخدم الجديد');
      return;
    }

    onSaveUser(editingUser ? editingUser.id : null, userForm);
    setEditingUser(null);
    setIsNewUserModalOpen(false);
  };

  // Submit Branch
  const handleBranchSubmit = (e) => {
    e.preventDefault();
    if (!branchForm.name.trim()) return;
    onAddBranch(branchForm);
    setIsNewBranchModalOpen(false);
    setBranchForm({ name: '', address: '', phone: '' });
  };

  // Submit Doctor
  const handleDoctorSubmit = (e) => {
    e.preventDefault();
    if (!doctorForm.name.trim()) return;
    onAddDoctor(doctorForm);
    setIsNewDoctorModalOpen(false);
    setDoctorForm({ name: '', title: 'استشاري', clinicId: clinics[0]?.id || 'cl_internal', branchIds: ['br_maadi'], consultationFee: 400, phone: '' });
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
            onClick={() => setIsNewBranchModalOpen(true)}
          >
            ➕ إضافة فرع جديد
          </button>
        )}

        {activeSubTab === 'doctors' && (
          <button
            id="btn-add-new-doctor"
            className="btn btn-primary"
            onClick={() => setIsNewDoctorModalOpen(true)}
          >
            ➕ إضافة طبيب جديد
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
        border: '1px solid var(--border-light)'
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
          className={`btn btn-sm ${activeSubTab === 'doctors' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
          onClick={() => setActiveSubTab('doctors')}
        >
          🩺 الأطباء والعيادات ({doctors.length})
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
                              if (confirm(`هل أنت متأكد من حذف المستخدم "${u.name}"؟`)) {
                                onDeleteUser(u.id);
                              }
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
                العنوان: {b.address}
              </p>
              <div style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                هاتف الفرع: {b.phone}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: DOCTORS */}
      {activeSubTab === 'doctors' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
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
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{doc.avatar || '👨‍⚕️'}</span>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{doc.name}</h3>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{doc.clinicName}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{doc.title}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                <span>قيمة الكشف: <strong>{doc.consultationFee} ج.م</strong></span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>⭐ {doc.rating}</span>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        {editingUser ? 'كلمة المرور الحالية أو الجديدة' : 'كلمة المرور *'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowUserPassword(!showUserPassword)}
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
                        {showUserPassword ? '🙈 إخفاء الباسورد' : '👁️ إظهار الباسورد'}
                      </button>
                    </div>
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

      {/* New Branch Modal */}
      {isNewBranchModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewBranchModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>➕ إضافة فرع جديد للمركز الطبي</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setIsNewBranchModalOpen(false)}>✕</button>
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
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">حفظ الفرع</button>
                <button type="button" className="btn btn-outline" onClick={() => setIsNewBranchModalOpen(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Doctor Modal */}
      {isNewDoctorModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewDoctorModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>➕ إضافة طبيب وعيادة جديدة</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setIsNewDoctorModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleDoctorSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                    <label className="form-label">قيمة الكشف (جنيه)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={doctorForm.consultationFee}
                      onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
                    />
                  </div>
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

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">حفظ الطبيب</button>
                <button type="button" className="btn btn-outline" onClick={() => setIsNewDoctorModalOpen(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
