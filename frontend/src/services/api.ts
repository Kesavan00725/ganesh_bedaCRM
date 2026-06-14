import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh')
};

// Customers
export const customerAPI = {
  list: (params?: any) => api.get('/customers', { params }),
  get: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`)
};

// Products
export const productAPI = {
  list: (params?: any) => api.get('/products', { params }),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  lowStock: () => api.get('/products/low-stock')
};

// Dashboard
export const dashboardAPI = {
  kpis: () => api.get('/dashboard/kpis'),
  salesChart: () => api.get('/dashboard/sales-chart'),
  productDistribution: () => api.get('/dashboard/product-distribution'),
  recentActivities: () => api.get('/dashboard/recent-activities')
};

// Sales
export const salesAPI = {
  list: (params?: any) => api.get('/sales', { params }),
  get: (id: string) => api.get(`/sales/${id}`),
  create: (data: any) => api.post('/sales', data),
  delete: (id: string) => api.delete(`/sales/${id}`)
};

// Orders
export const orderAPI = {
  list: (params?: any) => api.get('/orders', { params }),
  get: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  update: (id: string, data: any) => api.put(`/orders/${id}`, data),
  delete: (id: string) => api.delete(`/orders/${id}`)
};

// Settings
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
  listUsers: () => api.get('/settings/users'),
  updateUser: (id: string, data: any) => api.put(`/settings/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/settings/users/${id}`)
};

// Reports
export const reportAPI = {
  sales: (params?: any) => api.get('/reports/sales', { params }),
  inventory: () => api.get('/reports/inventory'),
  customers: () => api.get('/reports/customers'),
  export: (data: any) => api.post('/reports/export', data)
};

// Notifications
export const notificationAPI = {
  list: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`)
};

export default api;
