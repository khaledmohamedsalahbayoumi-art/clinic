const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'clinic_data.json');

// Default clean structure for fresh clinic deployment
const initialData = {
  branches: [
    { id: 'br_maadi', name: 'فرع المعادي الرئيسي', address: 'شارع النصر، دجلة، المعادي، القاهرة', phone: '0225198001', isMain: true },
    { id: 'br_tagamoa', name: 'فرع التجمع الخامس', address: 'مجمع الميديكال بارك، شارع التسعين الشمالي', phone: '0228128003', isMain: false }
  ],
  clinics: [
    { id: 'cl_internal', name: 'عيادة الباطنة والجهاز الهضمي', icon: '🩺' },
    { id: 'cl_ortho', name: 'عيادة العظام والمفاصل', icon: '🦴' },
    { id: 'cl_pediatric', name: 'عيادة طب الأطفال وحديثي الولادة', icon: '👶' },
    { id: 'cl_cardio', name: 'عيادة القلب والأوعية الدموية', icon: '❤️' },
    { id: 'cl_derma', name: 'عيادة الجلدية والتجميل والليزر', icon: '✨' },
    { id: 'cl_dentistry', name: 'عيادة طب وجراحة الأسنان', icon: '🦷' }
  ],
  doctors: [],
  patients: [],
  appointments: [],
  prescriptions: [],
  transactions: [],
  labRequests: [],
  users: [
    {
      id: 'usr_1',
      username: 'owner',
      password: '2026',
      name: 'Khaled',
      role: 'owner',
      title: 'developer',
      branchId: 'all',
      phone: '01012345671',
      permissions: [
        'dashboard:view',
        'queue:view',
        'queue:manage',
        'patients:view',
        'patients:sensitive',
        'patients:create',
        'prescriptions:view',
        'prescriptions:create',
        'finances:view',
        'finances:create',
        'settings:manage'
      ],
      createdAt: '2026-01-01',
      doctorId: ''
    }
  ]
};

// Memory store initialized from disk or default
let memoryStore = null;

function loadData() {
  if (memoryStore) return memoryStore;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      memoryStore = JSON.parse(content);
      if (!memoryStore.users || memoryStore.users.length === 0) {
        memoryStore.users = JSON.parse(JSON.stringify(initialData.users));
        saveData();
      }
    } else {
      memoryStore = JSON.parse(JSON.stringify(initialData));
      saveData();
    }
  } catch (err) {
    console.error('Error loading data file, falling back to initial data:', err);
    memoryStore = JSON.parse(JSON.stringify(initialData));
  }
  return memoryStore;
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving data to file:', err);
  }
}

module.exports = {
  loadData,
  saveData,
  getStore: () => loadData()
};
