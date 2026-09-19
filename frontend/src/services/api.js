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
  const token = userToken || adminToken;
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
export const registerUser = async (name, email, password, phone, otp = null) => {
  const response = await api.post('/users/register', { name, email, password, phone, otp });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/users/login', { email, password });
  return response.data;
};

export const sendOtpApi = async (phone, purpose = 'login') => {
  const response = await api.post('/auth/send-otp', { phone, purpose });
  return response.data;
};

export const resendOtpApi = async (phone, purpose = 'login') => {
  const response = await api.post('/auth/resend-otp', { phone, purpose });
  return response.data;
};

export const verifyOtpApi = async (phone, otp, purpose = 'login') => {
  const response = await api.post('/auth/verify-otp', { phone, otp, purpose });
  return response.data;
};

export const forgotPasswordApi = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const verifyResetTokenApi = async (token) => {
  const response = await api.post('/auth/verify-reset-token', { token });
  return response.data;
};

export const resetPasswordApi = async (token, newPassword, confirmPassword) => {
  const response = await api.post('/auth/reset-password', { token, newPassword, confirmPassword });
  return response.data;
};

export const getUserProfile = async (token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get('/users/profile', { headers });
  return response.data;
};

export const updateUserProfile = async (profileData, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.put('/users/profile', profileData, { headers });
  return response.data;
};

export const changeUserPassword = async (passwordData, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.put('/users/change-password', passwordData, { headers });
  return response.data;
};

export const uploadUserAvatar = async (formData, token) => {
  const headers = {
    'Content-Type': 'multipart/form-data',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await api.post('/users/avatar', formData, { headers });
  return response.data;
};

export const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:') || avatar.startsWith('blob:')) {
    return avatar;
  }
  return `http://localhost:5000${avatar.startsWith('/') ? '' : '/'}${avatar}`;
};

// Orders API
export const checkoutOrder = async (orderPayloadOrUserId, itemsOrToken, maybeToken) => {
  let payload = {};
  let token = null;

  if (typeof orderPayloadOrUserId === 'object' && orderPayloadOrUserId !== null) {
    payload = orderPayloadOrUserId;
    token = itemsOrToken || localStorage.getItem('userToken');
  } else {
    payload = {
      items: itemsOrToken,
    };
    token = maybeToken || localStorage.getItem('userToken');
  }

  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.post('/orders/checkout', payload, { headers });
  return response.data;
};

export const createOrder = async (userId, totalAmount, items) => {
  const token = localStorage.getItem('userToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.post('/orders', {
    user_id: userId,
    total_amount: totalAmount,
    items,
  }, { headers });
  return response.data;
};

export const getMyOrders = async (token) => {
  const currentToken = token || localStorage.getItem('userToken');
  const headers = currentToken ? { Authorization: `Bearer ${currentToken}` } : {};
  const response = await api.get('/orders/my-orders', { headers });
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
