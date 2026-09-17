// Dynamically detect API base URL (works seamlessly in local dev, on same Wi-Fi, and online on Render/Vercel/Cloud)
const API_BASE = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.port === '3000'
    ? `http://${window.location.hostname}:5000/api`
    : '/api'
);


export const api = {
  // Authentication
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  // Users & Permissions Management
  getUsers: async () => {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },
  createUser: async (data) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateUser: async (id, data) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Branches & Clinics
  getBranches: async () => {
    const res = await fetch(`${API_BASE}/branches`);
    return res.json();
  },
  createBranch: async (data) => {
    const res = await fetch(`${API_BASE}/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateBranch: async (id, data) => {
    const res = await fetch(`${API_BASE}/branches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteBranch: async (id) => {
    const res = await fetch(`${API_BASE}/branches/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },
  getClinics: async () => {
    const res = await fetch(`${API_BASE}/clinics`);
    return res.json();
  },
  createClinic: async (data) => {
    const res = await fetch(`${API_BASE}/clinics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateClinic: async (id, data) => {
    const res = await fetch(`${API_BASE}/clinics/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteClinic: async (id) => {
    const res = await fetch(`${API_BASE}/clinics/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Doctors
  getDoctors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/doctors?${query}`);
    return res.json();
  },
  getDoctorById: async (id) => {
    const res = await fetch(`${API_BASE}/doctors/${id}`);
    return res.json();
  },
  createDoctor: async (data) => {
    const res = await fetch(`${API_BASE}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateDoctor: async (id, data) => {
    const res = await fetch(`${API_BASE}/doctors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteDoctor: async (id) => {
    const res = await fetch(`${API_BASE}/doctors/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Patients
  getPatients: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/patients${query}`);
    return res.json();
  },
  getPatientById: async (id) => {
    const res = await fetch(`${API_BASE}/patients/${id}`);
    return res.json();
  },
  createPatient: async (data) => {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updatePatient: async (id, data) => {
    const res = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Appointments
  getAppointments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/appointments?${query}`);
    return res.json();
  },
  createAppointment: async (data) => {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateAppointmentStatus: async (id, status, paymentStatus) => {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paymentStatus })
    });
    return res.json();
  },
  saveVitals: async (appointmentId, vitalsData) => {
    const res = await fetch(`${API_BASE}/appointments/${appointmentId}/vitals`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vitalsData)
    });
    return res.json();
  },

  // Prescriptions
  getPrescriptions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/prescriptions?${query}`);
    return res.json();
  },
  createPrescription: async (data) => {
    const res = await fetch(`${API_BASE}/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Lab & Radiology Requests
  getLabRequests: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/lab-requests?${query}`);
    return res.json();
  },
  createLabRequest: async (data) => {
    const res = await fetch(`${API_BASE}/lab-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Transactions & Expenses
  getTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/transactions?${query}`);
    return res.json();
  },
  createTransaction: async (data) => {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Dashboard Stats
  getDashboardStats: async (branchId = 'all') => {
    const res = await fetch(`${API_BASE}/dashboard/stats?branchId=${branchId}`);
    return res.json();
  },

  // Multi-Device & Network Connectivity Info
  getNetworkInfo: async () => {
    const res = await fetch(`${API_BASE}/network-info`);
    return res.json();
  },

  // Internal Intercom Chat (محادثة الطبيب والاستقبال)
  getChatMessages: async (limit = 100) => {
    const res = await fetch(`${API_BASE}/chat/messages?limit=${limit}`);
    return res.json();
  },
  sendChatMessage: async (data) => {
    const res = await fetch(`${API_BASE}/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  markChatMessagesRead: async (readerRole) => {
    const res = await fetch(`${API_BASE}/chat/messages/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readerRole })
    });
    return res.json();
  }
};

