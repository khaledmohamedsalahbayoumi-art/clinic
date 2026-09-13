const express = require('express');
const cors = require('cors');
const { getStore, saveData } = require('./data/store');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ------------------- AUTHENTICATION (تسجيل الدخول) -------------------
app.post('/api/auth/login', (req, res) => {
  const store = getStore();
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
  }

  const user = store.users.find(
    u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  // Return safe user profile with permissions
  const safeUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    title: user.title,
    branchId: user.branchId,
    doctorId: user.doctorId || null,
    phone: user.phone || '',
    permissions: user.permissions || []
  };

  res.json({
    message: 'تم تسجيل الدخول بنجاح',
    user: safeUser,
    token: 'mock-jwt-token-' + user.id + '-' + Date.now()
  });
});

// ------------------- USERS MANAGEMENT (إدارة المستخدمين والصلاحيات) -------------------
app.get('/api/users', (req, res) => {
  const store = getStore();
  const safeUsers = (store.users || []).map(u => ({
    id: u.id,
    username: u.username,
    password: u.password || '',
    name: u.name,
    role: u.role,
    title: u.title,
    branchId: u.branchId,
    doctorId: u.doctorId || null,
    phone: u.phone || '',
    permissions: u.permissions || [],
    createdAt: u.createdAt
  }));
  res.json(safeUsers);
});

app.post('/api/users', (req, res) => {
  const store = getStore();
  const { username, password, name, role, title, branchId, doctorId, phone, permissions } = req.body;

  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: 'الاسم واسم المستخدم وكلمة المرور والدور حقول مطلوبة' });
  }

  const existing = store.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر' });
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    username: username.trim(),
    password: password.trim(),
    name: name.trim(),
    role,
    title: title || '',
    branchId: branchId || 'all',
    doctorId: doctorId || null,
    phone: phone || '',
    permissions: Array.isArray(permissions) ? permissions : [],
    createdAt: new Date().toISOString().split('T')[0]
  };

  store.users.push(newUser);
  saveData();

  const { password: _, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

app.put('/api/users/:id', (req, res) => {
  const store = getStore();
  const index = store.users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'المستخدم غير موجود' });

  const { name, role, title, branchId, doctorId, phone, permissions, password } = req.body;
  const targetUser = store.users[index];

  if (name) targetUser.name = name.trim();
  if (role) targetUser.role = role;
  if (title !== undefined) targetUser.title = title;
  if (branchId !== undefined) targetUser.branchId = branchId;
  if (doctorId !== undefined) targetUser.doctorId = doctorId;
  if (phone !== undefined) targetUser.phone = phone;
  if (Array.isArray(permissions)) targetUser.permissions = permissions;
  if (password && password.trim()) targetUser.password = password.trim();

  saveData();

  const { password: _, ...safeUser } = targetUser;
  res.json(safeUser);
});

app.delete('/api/users/:id', (req, res) => {
  const store = getStore();
  const user = store.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
  if (user.role === 'owner' && user.username === 'owner') {
    return res.status(400).json({ error: 'لا يمكن حذف الحساب الرئيسي للمالك' });
  }

  store.users = store.users.filter(u => u.id !== req.params.id);
  saveData();
  res.json({ message: 'تم حذف المستخدم بنجاح' });
});

// ------------------- BRANCHES -------------------
app.get('/api/branches', (req, res) => {
  const store = getStore();
  res.json(store.branches);
});

// ------------------- CLINICS / SPECIALTIES -------------------
app.get('/api/clinics', (req, res) => {
  const store = getStore();
  res.json(store.clinics);
});

// ------------------- DOCTORS -------------------
app.get('/api/doctors', (req, res) => {
  const store = getStore();
  const { branchId, clinicId, search } = req.query;
  let docs = store.doctors;

  if (branchId && branchId !== 'all') {
    docs = docs.filter(d => d.branchIds.includes(branchId));
  }
  if (clinicId && clinicId !== 'all') {
    docs = docs.filter(d => d.clinicId === clinicId);
  }
  if (search) {
    const q = search.trim().toLowerCase();
    docs = docs.filter(d => d.name.toLowerCase().includes(q) || d.clinicName.toLowerCase().includes(q));
  }

  res.json(docs);
});

app.get('/api/doctors/:id', (req, res) => {
  const store = getStore();
  const doc = store.doctors.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'الطبيب غير موجود' });
  res.json(doc);
});

// ------------------- PATIENTS -------------------
app.get('/api/patients', (req, res) => {
  const store = getStore();
  const { search } = req.query;
  let patients = store.patients;

  if (search) {
    const q = search.trim().toLowerCase();
    patients = patients.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.phone.includes(q) || 
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.nationalId && p.nationalId.includes(q))
    );
  }

  res.json(patients);
});

app.get('/api/patients/:id', (req, res) => {
  const store = getStore();
  const patient = store.patients.find(p => p.id === req.params.id || p.phone === req.params.id);
  if (!patient) return res.status(404).json({ error: 'المريض غير موجود' });

  // Attach patient's appointments and prescriptions
  const appointments = store.appointments.filter(a => a.patientId === patient.id);
  const prescriptions = store.prescriptions.filter(rx => rx.patientId === patient.id);

  res.json({
    ...patient,
    appointments,
    prescriptions
  });
});

app.post('/api/patients', (req, res) => {
  const store = getStore();
  const { name, phone, nationalId, age, gender, address, bloodType, emergencyContact, chronicDiseases, allergies, currentMedications, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'اسم المريض ورقم الهاتف مطلوبان' });
  }

  // Check if patient already exists by phone
  let existing = store.patients.find(p => p.phone === phone.trim());
  if (existing) {
    return res.json(existing);
  }

  const newPatient = {
    id: 'pat_' + Date.now(),
    code: 'MED-' + (1000 + store.patients.length + 1),
    name: name.trim(),
    phone: phone.trim(),
    nationalId: nationalId || '',
    age: age ? Number(age) : null,
    gender: gender || 'ذكر',
    address: address || '',
    bloodType: bloodType || 'O+',
    emergencyContact: emergencyContact || '',
    chronicDiseases: Array.isArray(chronicDiseases) ? chronicDiseases : (chronicDiseases ? [chronicDiseases] : []),
    allergies: Array.isArray(allergies) ? allergies : (allergies ? [allergies] : []),
    currentMedications: Array.isArray(currentMedications) ? currentMedications : [],
    notes: notes || '',
    createdAt: new Date().toISOString().split('T')[0]
  };

  store.patients.unshift(newPatient);
  saveData();
  res.status(201).json(newPatient);
});

app.put('/api/patients/:id', (req, res) => {
  const store = getStore();
  const index = store.patients.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'المريض غير موجود' });

  store.patients[index] = {
    ...store.patients[index],
    ...req.body,
    id: store.patients[index].id,
    code: store.patients[index].code
  };

  saveData();
  res.json(store.patients[index]);
});

// ------------------- APPOINTMENTS / QUEUE -------------------
app.get('/api/appointments', (req, res) => {
  const store = getStore();
  const { branchId, doctorId, date, status, patientPhone } = req.query;
  let apts = [...store.appointments];

  if (branchId && branchId !== 'all') {
    apts = apts.filter(a => a.branchId === branchId);
  }
  if (doctorId && doctorId !== 'all') {
    apts = apts.filter(a => a.doctorId === doctorId);
  }
  if (date) {
    apts = apts.filter(a => a.date === date);
  }
  if (status && status !== 'all') {
    apts = apts.filter(a => a.status === status);
  }
  if (patientPhone) {
    apts = apts.filter(a => a.patientPhone === patientPhone.trim());
  }

  // Sort: today first, then by queueNumber or time
  apts.sort((a, b) => (a.queueNumber || 99) - (b.queueNumber || 99));

  res.json(apts);
});

app.post('/api/appointments', (req, res) => {
  const store = getStore();
  const {
    patientName,
    patientPhone,
    patientId: existingPatientId,
    doctorId,
    branchId,
    date,
    timeSlot,
    type,
    notes
  } = req.body;

  if (!patientName || !patientPhone || !doctorId || !branchId) {
    return res.status(400).json({ error: 'جميع الحقول الأساسية مطلوبة (الاسم، الهاتف، الطبيب، الفرع)' });
  }

  // Find or register patient
  let patient = null;
  if (existingPatientId) {
    patient = store.patients.find(p => p.id === existingPatientId);
  }
  if (!patient) {
    patient = store.patients.find(p => p.phone === patientPhone.trim());
  }
  if (!patient) {
    patient = {
      id: 'pat_' + Date.now(),
      code: 'MED-' + (1000 + store.patients.length + 1),
      name: patientName.trim(),
      phone: patientPhone.trim(),
      chronicDiseases: [],
      allergies: [],
      currentMedications: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    store.patients.unshift(patient);
  }

  const doctor = store.doctors.find(d => d.id === doctorId);
  const branch = store.branches.find(b => b.id === branchId);

  const appointmentDate = date || new Date().toISOString().split('T')[0];

  // Calculate next queue number for this doctor on this day
  const existingSameDay = store.appointments.filter(
    a => a.doctorId === doctorId && a.date === appointmentDate
  );
  const queueNumber = existingSameDay.length + 1;

  const newAppointment = {
    id: 'apt_' + Date.now(),
    code: `APT-${new Date().getFullYear()}-${String(store.appointments.length + 1).padStart(3, '0')}`,
    patientId: patient.id,
    patientName: patient.name,
    patientPhone: patient.phone,
    doctorId: doctor ? doctor.id : doctorId,
    doctorName: doctor ? doctor.name : 'طبيب متخصص',
    doctorAvatar: doctor ? doctor.avatar : '👨‍⚕️',
    clinicId: doctor ? doctor.clinicId : 'cl_internal',
    clinicName: doctor ? doctor.clinicName : 'عيادة متخصصة',
    branchId: branch ? branch.id : branchId,
    branchName: branch ? branch.name : 'الفرع الرئيسي',
    date: appointmentDate,
    timeSlot: timeSlot || '11:00 ص',
    type: type || 'كشف جديد',
    status: 'waiting',
    queueNumber,
    fee: doctor ? doctor.consultationFee : 400,
    paymentStatus: 'paid',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  store.appointments.unshift(newAppointment);

  // Register income transaction
  store.transactions.unshift({
    id: 'tx_' + Date.now(),
    branchId: branch ? branch.id : branchId,
    type: 'income',
    category: `كشف ${doctor ? doctor.clinicName : 'طبي'}`,
    amount: newAppointment.fee,
    patientName: newAppointment.patientName,
    date: appointmentDate,
    recordedBy: 'الاستقبال'
  });

  saveData();
  res.status(201).json(newAppointment);
});

app.patch('/api/appointments/:id/status', (req, res) => {
  const store = getStore();
  const { status, paymentStatus } = req.body;
  const apt = store.appointments.find(a => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'الموعد غير موجود' });

  if (status) apt.status = status;
  if (paymentStatus) apt.paymentStatus = paymentStatus;

  saveData();
  res.json(apt);
});

// ------------------- PRESCRIPTIONS (الروشتات الطبية) -------------------
app.get('/api/prescriptions', (req, res) => {
  const store = getStore();
  const { patientId, doctorId, search } = req.query;
  let rxs = [...store.prescriptions];

  if (patientId) {
    rxs = rxs.filter(rx => rx.patientId === patientId);
  }
  if (doctorId && doctorId !== 'all') {
    rxs = rxs.filter(rx => rx.doctorId === doctorId);
  }
  if (search) {
    const q = search.trim().toLowerCase();
    rxs = rxs.filter(rx => 
      rx.patientName.toLowerCase().includes(q) ||
      rx.code.toLowerCase().includes(q) ||
      rx.diagnosis.toLowerCase().includes(q)
    );
  }

  res.json(rxs);
});

app.post('/api/prescriptions', (req, res) => {
  const store = getStore();
  const { patientId, appointmentId, doctorId, diagnosis, medicines, instructions, followUpDate } = req.body;

  const patient = store.patients.find(p => p.id === patientId);
  const doctor = store.doctors.find(d => d.id === doctorId);

  if (!patient || !doctor || !diagnosis) {
    return res.status(400).json({ error: 'بيانات المريض والطبيب والتشخيص مطلوبة' });
  }

  const newRx = {
    id: 'rx_' + Date.now(),
    code: 'RX-' + Math.floor(1000 + Math.random() * 9000),
    appointmentId: appointmentId || null,
    patientId: patient.id,
    patientName: patient.name,
    patientCode: patient.code,
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorTitle: doctor.title,
    clinicName: doctor.clinicName,
    branchId: doctor.branchIds[0] || 'br_maadi',
    branchName: 'المركز الطبي التخصصي',
    date: new Date().toISOString().split('T')[0],
    diagnosis: diagnosis.trim(),
    medicines: Array.isArray(medicines) ? medicines : [],
    instructions: instructions || 'تناول العلاج بانتظام والمتابعة في الموعد المحدد.',
    followUpDate: followUpDate || 'بعد أسبوعين'
  };

  store.prescriptions.unshift(newRx);

  // If appointment exists, mark it completed
  if (appointmentId) {
    const apt = store.appointments.find(a => a.id === appointmentId);
    if (apt) apt.status = 'completed';
  }

  saveData();
  res.status(201).json(newRx);
});

// ------------------- TRANSACTIONS & EXPENSES (المالية والخزينة) -------------------
app.get('/api/transactions', (req, res) => {
  const store = getStore();
  const { branchId, type, date } = req.query;
  let txs = [...store.transactions];

  if (branchId && branchId !== 'all') {
    txs = txs.filter(t => t.branchId === branchId);
  }
  if (type && type !== 'all') {
    txs = txs.filter(t => t.type === type);
  }
  if (date) {
    txs = txs.filter(t => t.date === date);
  }

  res.json(txs);
});

app.post('/api/transactions', (req, res) => {
  const store = getStore();
  const { branchId, type, category, amount, description, patientName, recordedBy } = req.body;

  if (!branchId || !type || !amount || !category) {
    return res.status(400).json({ error: 'الفرع والنوع والمبلغ والتصنيف حقول مطلوبة' });
  }

  const newTx = {
    id: 'tx_' + Date.now(),
    branchId,
    type, // 'income' or 'expense'
    category,
    amount: Number(amount),
    description: description || '',
    patientName: patientName || '-',
    date: new Date().toISOString().split('T')[0],
    recordedBy: recordedBy || 'المحاسب المالي'
  };

  store.transactions.unshift(newTx);
  saveData();
  res.status(201).json(newTx);
});

// ------------------- DASHBOARD STATS -------------------
app.get('/api/dashboard/stats', (req, res) => {
  const store = getStore();
  const { branchId } = req.query;
  const today = new Date().toISOString().split('T')[0];

  let apts = store.appointments;
  let txs = store.transactions;
  let docs = store.doctors;

  if (branchId && branchId !== 'all') {
    apts = apts.filter(a => a.branchId === branchId);
    txs = txs.filter(t => t.branchId === branchId);
    docs = docs.filter(d => d.branchIds.includes(branchId));
  }

  // Today's appointments
  const todayApts = apts.filter(a => a.date === today);
  const waitingCount = todayApts.filter(a => a.status === 'waiting' || a.status === 'in_progress').length;
  const completedCount = todayApts.filter(a => a.status === 'completed').length;

  // Today's financials
  const todayTxs = txs.filter(t => t.date === today);
  const todayRevenue = todayTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const todayExpenses = todayTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const netProfit = todayRevenue - todayExpenses;

  // Active doctors
  const activeDoctorsCount = docs.filter(d => d.status === 'available' || d.status === 'busy').length;

  // Doctor performance
  const doctorPerformance = docs.map(doc => {
    const docApts = apts.filter(a => a.doctorId === doc.id);
    const docIncome = docApts.reduce((sum, a) => sum + (a.fee || 0), 0);
    return {
      id: doc.id,
      name: doc.name,
      clinic: doc.clinicName,
      avatar: doc.avatar,
      totalVisits: docApts.length,
      revenue: docIncome,
      rating: doc.rating
    };
  });

  // Branch breakdown
  const branchBreakdown = store.branches.map(branch => {
    const bApts = store.appointments.filter(a => a.branchId === branch.id);
    const bTxs = store.transactions.filter(t => t.branchId === branch.id);
    const bRevenue = bTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const bExpenses = bTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      id: branch.id,
      name: branch.name,
      patientCount: bApts.length,
      revenue: bRevenue,
      expenses: bExpenses,
      profit: bRevenue - bExpenses
    };
  });

  res.json({
    todayRevenue,
    todayExpenses,
    netProfit,
    waitingCount,
    completedCount,
    totalTodayAppointments: todayApts.length,
    activeDoctorsCount,
    totalPatients: store.patients.length,
    doctorPerformance,
    branchBreakdown,
    recentAppointments: todayApts.slice(0, 5)
  });
});

// ------------------- VITALS & EXAMINATION (العلامات الحيوية) -------------------
app.patch('/api/appointments/:id/vitals', (req, res) => {
  const store = getStore();
  const apt = store.appointments.find(a => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'الموعد غير موجود' });

  const { bp, pulse, temp, weight, height, bloodSugar, notes } = req.body;
  const vitalsRecord = {
    bp: bp || '',
    pulse: pulse || '',
    temp: temp || '',
    weight: weight || '',
    height: height || '',
    bloodSugar: bloodSugar || '',
    notes: notes || '',
    recordedAt: new Date().toISOString()
  };

  apt.vitals = vitalsRecord;

  // Also record in patient's vitals history
  const patient = store.patients.find(p => p.id === apt.patientId);
  if (patient) {
    if (!patient.vitalsHistory) patient.vitalsHistory = [];
    patient.vitalsHistory.unshift({
      date: apt.date,
      appointmentId: apt.id,
      doctorName: apt.doctorName,
      ...vitalsRecord
    });
  }

  saveData();
  res.json({ message: 'تم حفظ العلامات الحيوية بنجاح', vitals: vitalsRecord });
});

// ------------------- LAB & RADIOLOGY REQUESTS (الفحوصات والتحاليل والأشعة) -------------------
app.get('/api/lab-requests', (req, res) => {
  const store = getStore();
  if (!store.labRequests) store.labRequests = [];
  const { patientId, doctorId } = req.query;
  let requests = store.labRequests;

  if (patientId) requests = requests.filter(r => r.patientId === patientId);
  if (doctorId && doctorId !== 'all') requests = requests.filter(r => r.doctorId === doctorId);

  res.json(requests);
});

app.post('/api/lab-requests', (req, res) => {
  const store = getStore();
  if (!store.labRequests) store.labRequests = [];

  const { patientId, doctorId, appointmentId, type, tests, priority, notes } = req.body;
  const patient = store.patients.find(p => p.id === patientId);
  const doctor = store.doctors.find(d => d.id === doctorId);

  if (!patient || !doctor || !tests) {
    return res.status(400).json({ error: 'المريض والطبيب والفحوصات حقول مطلوبة' });
  }

  const newRequest = {
    id: 'lab_' + Date.now(),
    code: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
    patientId: patient.id,
    patientName: patient.name,
    patientPhone: patient.phone,
    patientCode: patient.code,
    doctorId: doctor.id,
    doctorName: doctor.name,
    clinicName: doctor.clinicName,
    appointmentId: appointmentId || null,
    type: type || 'تحاليل مخبرية', // 'تحاليل مخبرية' or 'أشعة وفحوصات تصويرية'
    tests: Array.isArray(tests) ? tests : [tests],
    priority: priority || 'عادي', // 'عادي' or 'عاجل'
    status: 'pending', // 'pending', 'sample_collected', 'completed'
    notes: notes || '',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  store.labRequests.unshift(newRequest);
  saveData();
  res.status(201).json(newRequest);
});

// ------------------- MANAGEMENT (إضافة فروع وأطباء) -------------------
app.post('/api/branches', (req, res) => {
  const store = getStore();
  const { name, address, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم الفرع مطلوب' });

  const newBranch = {
    id: 'br_' + Date.now(),
    name: name.trim(),
    address: address || '',
    phone: phone || '',
    isMain: false
  };

  store.branches.push(newBranch);
  saveData();
  res.status(201).json(newBranch);
});

app.post('/api/doctors', (req, res) => {
  const store = getStore();
  const { name, title, clinicId, branchIds, consultationFee, phone, avatar } = req.body;
  if (!name || !clinicId) return res.status(400).json({ error: 'اسم الطبيب والتخصص مطلوبان' });

  const clinic = store.clinics.find(c => c.id === clinicId);

  const newDoc = {
    id: 'doc_' + Date.now(),
    name: name.trim(),
    title: title || 'طبيب استشاري',
    clinicId,
    clinicName: clinic ? clinic.name : 'عيادة متخصصة',
    branchIds: Array.isArray(branchIds) && branchIds.length > 0 ? branchIds : ['br_maadi'],
    consultationFee: Number(consultationFee) || 400,
    followUpFee: Math.round((Number(consultationFee) || 400) * 0.3),
    rating: 5.0,
    reviewsCount: 1,
    phone: phone || '',
    avatar: avatar || '👨‍⚕️',
    status: 'available',
    experienceYears: 10,
    education: 'استشاري معتمد',
    schedule: [
      { day: 'السبت', time: '10:00 ص - 03:00 م', branchId: 'br_maadi' },
      { day: 'الثلاثاء', time: '04:00 م - 09:00 م', branchId: 'br_maadi' }
    ]
  };

  store.doctors.push(newDoc);
  saveData();
  res.status(201).json(newDoc);
});

// Start server
app.listen(PORT, () => {
  console.log(`Clinic Management Backend running on http://localhost:${PORT}`);
});

