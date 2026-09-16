import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach admin/user token automatically if available
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('userToken');
  const token = adminToken || userToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Products API
export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const addProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// Cart API
export const addToCartApi = async (userId, productId, quantity = 1) => {
  const response = await api.post('/cart/add', {
    user_id: userId,
    product_id: productId,
    quantity,
  });
  return response.data;
};

// Users / Auth API
export const registerUser = async (name, email, password) => {
  const response = await api.post('/users/register', { name, email, password });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/users/login', { email, password });
  return response.data;
};

// Orders API
export const checkoutOrder = async (userId, items) => {
  const response = await api.post('/orders/checkout', {
    user_id: userId,
    items,
  });
  return response.data;
};

export const createOrder = async (userId, totalAmount, items) => {
  const response = await api.post('/orders', {
    user_id: userId,
    total_amount: totalAmount,
    items,
  });
  return response.data;
};

// Admin API
export const getAdminProducts = async (token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get('/admin/products', { headers });
  return response.data;
};

export const adminAddProduct = async (token, productData) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.post('/admin/products/add', productData, { headers });
  return response.data;
};

export const adminUpdateProduct = async (token, id, productData) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.put(`/admin/products/update/${id}`, productData, { headers });
  return response.data;
};

export const adminDeleteProduct = async (token, id) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.delete(`/admin/products/delete/${id}`, { headers });
  return response.data;
};

export const getAdminUsers = async (token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get('/admin/users', { headers });
  return response.data;
};

export const getAdminOrders = async (token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get('/admin/orders', { headers });
  return response.data;
};

export const updateOrderStatus = async (token, orderId, status) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.put(`/admin/orders/${orderId}/status`, { status }, { headers });
  return response.data;
};

export const getOrderDetails = async (token, orderId) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get(`/admin/orders/${orderId}`, { headers });
  return response.data;
};

export default api;
