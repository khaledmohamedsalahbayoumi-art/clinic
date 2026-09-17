import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import QueueView from './components/QueueView';
import PatientsView from './components/PatientsView';
import PrescriptionsView from './components/PrescriptionsView';
import FinancesView from './components/FinancesView';
import SettingsView from './components/SettingsView';
import ClientPortalView from './components/ClientPortalView';
import WaitingRoomScreen from './components/WaitingRoomScreen';
import VitalsModal from './components/VitalsModal';
import LoginView from './components/LoginView';
import BottomNav from './components/BottomNav';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import MultiDeviceModal from './components/MultiDeviceModal';
import { api } from './services/api';

export default function App() {
  const [activePortal, setActivePortal] = useState('admin'); // 'admin' or 'client'
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('clinic_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedBranch, setSelectedBranch] = useState('all');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Master Data States
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labRequests, setLabRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Modals & Enhanced Features States
  const [isWaitingScreenOpen, setIsWaitingScreenOpen] = useState(false);
  const [isMultiDeviceModalOpen, setIsMultiDeviceModalOpen] = useState(false);
  const [activeVitalsApt, setActiveVitalsApt] = useState(null);
  const [activePrescriptionData, setActivePrescriptionData] = useState(null);
  const [isQuickBookingModalOpen, setIsQuickBookingModalOpen] = useState(false);
  const [quickBookingForm, setQuickBookingForm] = useState({
    patientName: '',
    patientPhone: '',
    doctorId: '',
    branchId: 'br_maadi',
    timeSlot: '11:00 ص',
    type: 'كشف جديد'
  });

  // Fetch initial data
  const loadAllData = async () => {
    try {
      const [usrs, brs, cls, docs, pts, apts, rxs, labs, txs, stats] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getBranches(),
        api.getClinics(),
        api.getDoctors(),
        api.getPatients(),
        api.getAppointments(),
        api.getPrescriptions(),
        api.getLabRequests().catch(() => []),
        api.getTransactions(),
        api.getDashboardStats(selectedBranch)
      ]);

      setUsers(usrs || []);
      setBranches(brs);
      setClinics(cls);
      setDoctors(docs);
      setPatients(pts);
      setAppointments(apts);
      setPrescriptions(rxs);
      setLabRequests(labs || []);
      setTransactions(txs);
      setDashboardStats(stats);

      if (docs.length > 0 && !quickBookingForm.doctorId) {
        setQuickBookingForm(prev => ({ ...prev, doctorId: docs[0].id }));
      }
    } catch (err) {
      console.error('Error fetching clinic data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Re-fetch dashboard stats when selected branch changes
  useEffect(() => {
    api.getDashboardStats(selectedBranch).then(stats => setDashboardStats(stats));
  }, [selectedBranch]);

  // Compute allowed tabs dynamically from currentUser permissions
  const computeAllowedTabs = () => {
    if (!currentUser) return [];
    const perms = currentUser.permissions || [];
    const tabs = [];

    if (perms.includes('dashboard:view') || currentUser.role === 'owner') tabs.push('dashboard');
    if (perms.includes('queue:view') || currentUser.role === 'owner') tabs.push('queue');
    if (perms.includes('patients:view') || currentUser.role === 'owner') tabs.push('patients');
    if (perms.includes('prescriptions:view') || currentUser.role === 'owner') tabs.push('prescriptions');
    if (perms.includes('finances:view') || currentUser.role === 'owner') tabs.push('finances');
    if (perms.includes('settings:manage') || currentUser.role === 'owner') tabs.push('settings');

    return tabs.length > 0 ? tabs : ['dashboard'];
  };

  const allowedTabs = computeAllowedTabs();

  // Adjust active tab if current tab is not allowed
  useEffect(() => {
    if (currentUser && allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
    }
  }, [currentUser, activeTab]);

  // Action: Logout
  const handleLogout = () => {
    localStorage.removeItem('clinic_user');
    localStorage.removeItem('clinic_token');
    setCurrentUser(null);
  };

  // Action: Save or update user
  const handleSaveUser = async (id, data) => {
    if (id) {
      await api.updateUser(id, data);
    } else {
      await api.createUser(data);
    }
    const updatedUsers = await api.getUsers();
    setUsers(updatedUsers);

    // If edited current user, update session
    if (id && currentUser && currentUser.id === id) {
      const refreshed = updatedUsers.find(u => u.id === id);
      if (refreshed) {
        setCurrentUser(refreshed);
        localStorage.setItem('clinic_user', JSON.stringify(refreshed));
      }
    }
  };

  // Action: Delete user
  const handleDeleteUser = async (id) => {
    await api.deleteUser(id);
    await loadAllData();
  };

  // Action: Delete Doctor
  const handleDeleteDoctor = async (id) => {
    await api.deleteDoctor(id);
    await loadAllData();
  };

  // Action: Add Branch
  const handleAddBranch = async (data) => {
    await api.createBranch(data);
    await loadAllData();
  };

  // Action: Update Branch
  const handleUpdateBranch = async (id, data) => {
    await api.updateBranch(id, data);
    await loadAllData();
  };

  // Action: Delete Branch
  const handleDeleteBranch = async (id) => {
    await api.deleteBranch(id);
    await loadAllData();
  };

  // Action: Add Doctor
  const handleAddDoctor = async (data) => {
    await api.createDoctor(data);
    await loadAllData();
  };

  // Action: Update Doctor
  const handleUpdateDoctor = async (id, data) => {
    await api.updateDoctor(id, data);
    await loadAllData();
  };

  // Action: Add Clinic
  const handleAddClinic = async (data) => {
    await api.createClinic(data);
    await loadAllData();
  };

  // Action: Update Clinic
  const handleUpdateClinic = async (id, data) => {
    await api.updateClinic(id, data);
    await loadAllData();
  };

  // Action: Delete Clinic
  const handleDeleteClinic = async (id) => {
    await api.deleteClinic(id);
    await loadAllData();
  };

  // Action: Update Appointment Status
  const handleUpdateStatus = async (id, status, paymentStatus) => {
    await api.updateAppointmentStatus(id, status, paymentStatus);
    loadAllData();
  };

  // Action: Create Appointment
  const handleCreateAppointment = async (data) => {
    const res = await api.createAppointment(data);
    await loadAllData();
    return res;
  };

  // Action: Save Patient
  const handleSavePatient = async (data) => {
    await api.createPatient(data);
    loadAllData();
  };

  // Action: Create Prescription
  const handleCreatePrescription = async (data) => {
    await api.createPrescription(data);
    loadAllData();
  };

  // Action: Create Lab Order
  const handleCreateLabRequest = async (data) => {
    await api.createLabRequest(data);
    loadAllData();
  };

  // Action: Save Vitals
  const handleSaveVitals = async (appointmentId, vitalsData) => {
    await api.saveVitals(appointmentId, vitalsData);
    loadAllData();
  };

  // Action: Add Transaction
  const handleAddTransaction = async (data) => {
    await api.createTransaction(data);
    loadAllData();
  };

  // Action: Lookup Patient by Phone for Client Portal
  const handleFetchPatientData = async (phone) => {
    try {
      return await api.getPatientById(phone);
    } catch {
      return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        currentUser={currentUser}
        onLogout={handleLogout}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        branches={branches}
        onOpenMultiDevice={() => setIsMultiDeviceModalOpen(true)}
        onToggleSidebar={() => {
          if (window.innerWidth <= 1024) {
            setIsMobileSidebarOpen(prev => !prev);
          } else {
            setIsSidebarCollapsed(prev => !prev);
          }
        }}
      />

      {/* Main Container */}
      {activePortal === 'admin' && currentUser ? (
        <div className="admin-layout-wrapper">
          {/* Modern Medical Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            allowedTabs={allowedTabs}
            waitingCount={dashboardStats?.waitingCount || 0}
            currentUser={currentUser}
            onLogout={handleLogout}
            selectedBranch={selectedBranch}
            branches={branches}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
            onNewBooking={() => setIsQuickBookingModalOpen(true)}
            onOpenWaitingScreen={() => setIsWaitingScreenOpen(true)}
            onOpenMultiDevice={() => setIsMultiDeviceModalOpen(true)}
          />

          {/* Admin Main Content Area */}
          <div className="admin-main-content">
            <div className="admin-page-container">
              {/* PWA Install Banner */}
              <PwaInstallPrompt onOpenMultiDevice={() => setIsMultiDeviceModalOpen(true)} />

              {/* Views Switching based on user's granted permissions */}
              {activeTab === 'dashboard' && allowedTabs.includes('dashboard') && (
                <DashboardView
                  stats={dashboardStats}
                  branches={branches}
                  selectedBranch={selectedBranch}
                  setSelectedBranch={setSelectedBranch}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onNewBooking={() => setIsQuickBookingModalOpen(true)}
                  onNewPatient={() => setActiveTab('patients')}
                  onNewExpense={() => setActiveTab('finances')}
                />
              )}

              {activeTab === 'queue' && allowedTabs.includes('queue') && (
                <QueueView
                  appointments={appointments}
                  currentRole={currentUser.role}
                  branches={branches}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenPrescription={(apt) => {
                    setActivePrescriptionData(apt);
                    setActiveTab('prescriptions');
                  }}
                  onNewBooking={() => setIsQuickBookingModalOpen(true)}
                  onOpenVitals={(apt) => setActiveVitalsApt(apt)}
                  onOpenWaitingScreen={() => setIsWaitingScreenOpen(true)}
                />
              )}

              {activeTab === 'patients' && allowedTabs.includes('patients') && (
                <PatientsView
                  patients={patients}
                  currentUser={currentUser}
                  currentRole={currentUser.role}
                  onSavePatient={handleSavePatient}
                  onOpenPrescription={(pData) => {
                    setActivePrescriptionData(pData);
                    setActiveTab('prescriptions');
                  }}
                />
              )}

              {activeTab === 'prescriptions' && allowedTabs.includes('prescriptions') && (
                <PrescriptionsView
                  prescriptions={prescriptions}
                  labRequests={labRequests}
                  patients={patients}
                  doctors={doctors}
                  currentDoctorId={currentUser.doctorId || doctors[0]?.id}
                  currentRole={currentUser.role}
                  activePrescriptionData={activePrescriptionData}
                  onClosePrescriptionModal={() => setActivePrescriptionData(null)}
                  onCreatePrescription={handleCreatePrescription}
                  onCreateLabRequest={handleCreateLabRequest}
                />
              )}

              {activeTab === 'finances' && allowedTabs.includes('finances') && (
                <FinancesView
                  transactions={transactions}
                  branches={branches}
                  selectedBranch={selectedBranch}
                  currentRole={currentUser.role}
                  onAddTransaction={handleAddTransaction}
                />
              )}

              {activeTab === 'settings' && allowedTabs.includes('settings') && (
                <SettingsView
                  users={users}
                  branches={branches}
                  doctors={doctors}
                  clinics={clinics}
                  currentUser={currentUser}
                  onSaveUser={handleSaveUser}
                  onDeleteUser={handleDeleteUser}
                  onAddBranch={handleAddBranch}
                  onUpdateBranch={handleUpdateBranch}
                  onDeleteBranch={handleDeleteBranch}
                  onAddClinic={handleAddClinic}
                  onUpdateClinic={handleUpdateClinic}
                  onDeleteClinic={handleDeleteClinic}
                  onAddDoctor={handleAddDoctor}
                  onUpdateDoctor={handleUpdateDoctor}
                  onDeleteDoctor={handleDeleteDoctor}
                />
              )}
            </div>
          </div>
        </div>
      ) : activePortal === 'admin' && !currentUser ? (
        <main style={{ flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '24px 20px' }}>
          <PwaInstallPrompt />
          <LoginView
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              loadAllData();
            }}
            onSwitchToClient={() => setActivePortal('client')}
          />
        </main>
      ) : (
        <main style={{ flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '24px 20px' }}>
          <PwaInstallPrompt />
          <ClientPortalView
            doctors={doctors}
            clinics={clinics}
            branches={branches}
            onBookAppointment={handleCreateAppointment}
            onFetchPatientData={handleFetchPatientData}
            onPrintPrescription={(rx) => {
              setActivePrescriptionData(rx);
              setActivePortal('admin');
              setActiveTab('prescriptions');
            }}
          />
        </main>
      )}

      {/* Waiting Room TV Fullscreen Component */}
      {isWaitingScreenOpen && (
        <WaitingRoomScreen
          appointments={appointments}
          branches={branches}
          onClose={() => setIsWaitingScreenOpen(false)}
        />
      )}

      {/* Vitals Examination Modal */}
      {activeVitalsApt && (
        <VitalsModal
          appointment={activeVitalsApt}
          onClose={() => setActiveVitalsApt(null)}
          onSaveVitals={handleSaveVitals}
        />
      )}

      {/* Quick Booking Modal */}
      {isQuickBookingModalOpen && (
        <div className="modal-overlay" onClick={() => setIsQuickBookingModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>➕ تسجيل موعد كشف جديد (الاستقبال)</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setIsQuickBookingModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleCreateAppointment(quickBookingForm);
              setIsQuickBookingModalOpen(false);
              setQuickBookingForm({
                patientName: '',
                patientPhone: '',
                doctorId: doctors[0]?.id || '',
                branchId: 'br_maadi',
                timeSlot: '11:00 ص',
                type: 'كشف جديد'
              });
            }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">اسم المريض *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="اسم المريض ثلاثي"
                      required
                      value={quickBookingForm.patientName}
                      onChange={(e) => setQuickBookingForm({ ...quickBookingForm, patientName: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">رقم الهاتف *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="01012345678"
                      required
                      value={quickBookingForm.patientPhone}
                      onChange={(e) => setQuickBookingForm({ ...quickBookingForm, patientPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الفرع *</label>
                    <select
                      className="form-control"
                      value={quickBookingForm.branchId}
                      onChange={(e) => setQuickBookingForm({ ...quickBookingForm, branchId: e.target.value })}
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>📍 {b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الطبيب والعيادة *</label>
                    <select
                      className="form-control"
                      value={quickBookingForm.doctorId}
                      onChange={(e) => setQuickBookingForm({ ...quickBookingForm, doctorId: e.target.value })}
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.clinicName})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">وقت الكشف</label>
                    <input
                      type="text"
                      className="form-control"
                      value={quickBookingForm.timeSlot}
                      onChange={(e) => setQuickBookingForm({ ...quickBookingForm, timeSlot: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">نوع الزيارة</label>
                    <select
                      className="form-control"
                      value={quickBookingForm.type}
                      onChange={(e) => setQuickBookingForm({ ...quickBookingForm, type: e.target.value })}
                    >
                      <option value="كشف جديد">كشف جديد</option>
                      <option value="استشارة ومتابعة">استشارة ومتابعة</option>
                      <option value="فحص وإجراء طبي">فحص وإجراء طبي</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  حفظ وتسجيل في الطابور
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setIsQuickBookingModalOpen(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-light)',
        backgroundColor: '#ffffff',
        padding: '24px 20px',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}>
        <img
          src="/logo.png"
          alt="Clini-Tech"
          style={{ height: '36px', maxWidth: '160px', objectFit: 'contain' }}
        />
        <div>
          Clini-Tech (كليني تك) © {new Date().getFullYear()} • إدارة أسهل.. رعاية أفضل • نظام إدارة المراكز الطبية والعيادات
        </div>
      </footer>

      {/* Multi-Device & WebApp Install Modal */}
      <MultiDeviceModal
        isOpen={isMultiDeviceModalOpen}
        onClose={() => setIsMultiDeviceModalOpen(false)}
      />

      {/* Mobile Native App Bottom Navigation Bar */}
      <BottomNav
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        allowedTabs={allowedTabs}
        waitingCount={dashboardStats?.waitingCount || 0}
        currentUser={currentUser}
      />
    </div>
  );
}
