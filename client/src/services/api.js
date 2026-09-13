import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || `http://${window.location.hostname || 'localhost'}:5000/api`;
const API = axios.create({ baseURL: API_BASE });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const loginUser               = (data)       => API.post('/auth/login', data);
export const registerUser            = (data)       => API.post('/auth/register', data);
export const getPatients             = ()           => API.get('/patients');
export const createPatient           = (data)       => API.post('/patients', data);
export const getEHR                  = (pid)        => API.get(`/ehr/${pid}`);
export const createEHR               = (data)       => API.post('/ehr', data);
export const getLabReports           = (pid)        => API.get(`/lab/${pid}`);
export const createLab               = (data)       => API.post('/lab', data);
export const getAccessLogs           = ()           => API.get('/admin/logs');
export const getAllUsers              = ()           => API.get('/admin/users');
export const getAlerts               = ()           => API.get('/admin/alerts');
export const getAppointments         = ()           => API.get('/appointments');
export const updateAppointmentStatus = (id, status) => API.put(`/appointments/${id}/status`, { status });
export const addPatient              = (data)       => API.post('/admin/patients', data);
export const runMLCheck              = (data)       => axios.post('http://localhost:5001/predict', data);
export const faceLoginUser           = (data)       => API.post('/auth/face-login', data);
export const getEnrolledFaces        = ()           => API.get('/auth/enrolled-faces');
export const enrollFaceBiometric     = (data)       => API.post('/auth/enroll-face', data);

// Dynamic Roles & RBAC Management
export const getPublicRoles          = ()           => API.get('/auth/roles');
export const getAdminRoles           = ()           => API.get('/admin/roles');
export const createAdminRole         = (data)       => API.post('/admin/roles', data);
export const updateAdminRole         = (roleId, data) => API.put(`/admin/roles/${roleId}`, data);
export const deleteAdminRole         = (roleId)     => API.delete(`/admin/roles/${roleId}`);

// Staff Account & Login Governance
export const updateStaffRole         = (userId, role) => API.put(`/admin/users/${userId}/role`, { role });
export const toggleStaffStatus       = (userId)     => API.put(`/admin/users/${userId}/toggle-status`);
export const resetStaffFace          = (userId)     => API.post(`/admin/users/${userId}/reset-face`);

// Global Security Policies & Real-Time Login Stream
export const getSecuritySettings     = ()           => API.get('/admin/security-settings');
export const updateSecuritySetting   = (data)       => API.put('/admin/security-settings', data);
export const getLoginActivity        = ()           => API.get('/admin/login-activity');