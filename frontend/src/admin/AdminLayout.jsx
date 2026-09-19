import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import './styles/admin-layout.css';
import { useAuth } from '../context/AuthContext';
import {
  getAdminProducts,
  adminUpdateProduct,
  adminDeleteProduct,
  getAdminUsers,
  getAdminOrders,
  updateOrderStatus,
  getOrderDetails,
} from '../services/api';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import ConfirmModal from './components/ConfirmModal';
import Loading from './components/Loading';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, adminToken, login, logout } = useAuth();

  // Active admin token and current user
  const token =
    adminToken ||
    localStorage.getItem('adminToken') ||
    (user?.role === 'admin' ? localStorage.getItem('userToken') : '');

  const currentUser =
    user?.role === 'admin'
      ? user
      : (() => {
          try {
            return (
              JSON.parse(localStorage.getItem('adminUser')) || {
                name: 'Admin',
                email: 'admin@bidyutfurniture.com',
                role: 'admin',
              }
            );
          } catch {
            return { name: 'Admin', email: 'admin@bidyutfurniture.com', role: 'admin' };
          }
        })();

  // Login form state for unauthenticated admin access
  const [loginEmail, setLoginEmail] = useState('admin@bidyutfurniture.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [updatingProduct, setUpdatingProduct] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [viewProductModal, setViewProductModal] = useState(null);

  const [orderDetailsModal, setOrderDetailsModal] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  // Show temporary toast message
  const showMessage = (text, type = 'success') => {
    setActionMessage({ type, text });
    setTimeout(() => {
      setActionMessage({ type: '', text: '' });
    }, 4000);
  };

  // Direct login from admin screen
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const result = await login(loginEmail, loginPassword);
      if (result.success) {
        if (result.user && result.user.role !== 'admin') {
          setLoginError('Access denied: This account does not have administrative privileges.');
        } else {
          showMessage('Welcome back, Admin!');
        }
      } else {
        setLoginError(result.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setLoginError(
        err.response?.data?.message || 'Cannot connect to backend server. Check if port 5000 is running.'
      );
    } finally {
      setLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = (e) => {
    if (e) e.preventDefault();
    logout();
    navigate('/');
  };

  // Load all admin data from backend APIs
  const loadAdminData = async (currentToken) => {
    if (!currentToken) return;
    setLoading(true);
    setRefreshing(true);
    try {
      const [prodRes, userRes, orderRes] = await Promise.allSettled([
        getAdminProducts(currentToken),
        getAdminUsers(currentToken),
        getAdminOrders(currentToken),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value?.success) {
        setProducts(prodRes.value.products || []);
      }
      if (userRes.status === 'fulfilled' && userRes.value?.success) {
        // Filter ONLY role = 'user'
        const rawUsers = userRes.value.users || [];
        setUsers(rawUsers.filter((u) => (u.role || 'user').toLowerCase() === 'user'));
      }
      if (orderRes.status === 'fulfilled' && orderRes.value?.success) {
        setOrders(orderRes.value.orders || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAdminData(token);
    }
  }, [token]);

  // Derived statistics for Dashboard
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, order) => {
      const amt = Number(order.total_amount) || 0;
      return acc + amt;
    }, 0);

    const pendingOrders = orders.filter(
      (o) => (o.status || '').toLowerCase() === 'pending'
    ).length;

    const deliveredOrders = orders.filter(
      (o) => (o.status || '').toLowerCase() === 'delivered'
    ).length;

    const confirmedOrders = orders.filter(
      (o) => (o.status || '').toLowerCase() === 'confirmed'
    ).length;

    const shippedOrders = orders.filter(
      (o) => (o.status || '').toLowerCase() === 'shipped'
    ).length;

    const cancelledOrders = orders.filter(
      (o) => (o.status || '').toLowerCase() === 'cancelled'
    ).length;

    return {
      totalProducts: products.length,
      totalUsers: users.length,
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      confirmedOrders,
      shippedOrders,
      cancelledOrders,
    };
  }, [products, users, orders]);

  // Extract unique categories from products list
  const availableCategories = useMemo(() => {
    const cats = new Set(
      products.map((p) => (p.category || '').toLowerCase().trim()).filter(Boolean)
    );
    return Array.from(cats);
  }, [products]);

  // Helper for image URL
  const formatImageUrl = (path) => {
    if (!path) return '/img/placeholder.jpg';
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/${path}`;
  };

  // Helper for Indian Currency
  const formatINR = (amt) => {
    return `₹${Number(amt || 0).toLocaleString('en-IN')}`;
  };

  // Helper for Order Status Badge styling
  const renderStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    let badgeClass = 'status-pending';
    if (s === 'confirmed') badgeClass = 'status-confirmed';
    if (s === 'shipped') badgeClass = 'status-shipped';
    if (s === 'delivered') badgeClass = 'status-delivered';
    if (s === 'cancelled') badgeClass = 'status-cancelled';

    return <span className={`status-badge ${badgeClass}`}>{status || 'Pending'}</span>;
  };

  // ================= EDIT PRODUCT HANDLER =================
  const openEditModal = (product) => {
    setEditingProduct({
      ...product,
      old_price: product.old_price || '',
      discount: product.discount || '',
      rating: product.rating || '4.5',
      reviews: product.reviews || '0',
      colors: product.colors || '',
      delivery: product.delivery || '',
      badge: product.badge || '',
    });
    setEditModalOpen(true);
  };

  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct || !token) return;

    setUpdatingProduct(true);
    try {
      const payload = {
        name: editingProduct.name,
        image: editingProduct.image,
        price: Number(editingProduct.price),
        old_price: Number(editingProduct.old_price || 0),
        discount: editingProduct.discount,
        rating: Number(editingProduct.rating || 4.5),
        reviews: Number(editingProduct.reviews || 0),
        colors: editingProduct.colors,
        delivery: editingProduct.delivery,
        badge: editingProduct.badge,
        category: editingProduct.category,
      };

      const res = await adminUpdateProduct(token, editingProduct.id, payload);
      if (res.success) {
        showMessage(`Product #${editingProduct.id} updated successfully!`);
        setEditModalOpen(false);
        setEditingProduct(null);
        loadAdminData(token);
      } else {
        showMessage(res.message || 'Update failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.message || 'Error updating product', 'error');
    } finally {
      setUpdatingProduct(false);
    }
  };

  // ================= DELETE PRODUCT HANDLER =================
  const openDeleteModal = (product) => {
    setDeletingProduct(product);
    setDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct || !token) return;

    setIsDeleting(true);
    try {
      const res = await adminDeleteProduct(token, deletingProduct.id);
      if (res.success) {
        showMessage(`Product "${deletingProduct.name}" deleted successfully.`);
        setDeleteModalOpen(false);
        setDeletingProduct(null);
        loadAdminData(token);
      } else {
        showMessage(res.message || 'Delete failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.message || 'Error deleting product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ================= ORDER STATUS UPDATE HANDLER =================
  const handleStatusChange = async (orderId, newStatus) => {
    if (!token) return;
    try {
      const res = await updateOrderStatus(token, orderId, newStatus);
      if (res.success) {
        showMessage(`Order #${orderId} status changed to ${newStatus}`);
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
        );
      } else {
        showMessage(res.message || 'Status update failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage('Error updating order status', 'error');
    }
  };

  // ================= VIEW ORDER DETAILS MODAL =================
  const handleOpenOrderDetails = async (order) => {
    setOrderDetailsModal({ ...order, items: [] });
    setLoadingOrderDetails(true);
    try {
      const res = await getOrderDetails(token, order.id);
      if (res.success && res.items) {
        setOrderDetailsModal({ ...order, items: res.items });
      } else {
        setOrderDetailsModal({ ...order, items: [] });
      }
    } catch (err) {
      console.error(err);
      showMessage('Could not fetch order items from server', 'error');
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  // 1. If a logged-in user is NOT an admin, deny access cleanly
  if (user && user.role !== 'admin') {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card">
          <div className="admin-login-logo">🚫</div>
          <h2>Access Denied</h2>
          <p>
            Your account (<strong>{user.email}</strong>) does not have administrative privileges.
          </p>
          <div style={{ marginTop: '24px' }}>
            <button className="admin-btn-primary" onClick={() => navigate('/')}>
              ← Return to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. If no admin token / authentication exists, show admin login screen
  if (!token) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card">
          <div className="admin-login-logo">🪵</div>
          <h2>Bidyut Furniture Admin</h2>
          <p>Sign in with administrator credentials to access the store operations</p>

          {loginError && <div className="admin-login-alert">⚠️ {loginError}</div>}

          <form onSubmit={handleLoginSubmit}>
            <div className="admin-form-group" style={{ marginBottom: '14px', textAlign: 'left' }}>
              <label>Admin Email</label>
              <input
                type="email"
                className="admin-form-input"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@bidyutfurniture.com"
                required
              />
            </div>

            <div className="admin-form-group" style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label>Password</label>
              <input
                type="password"
                className="admin-form-input"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="admin-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              disabled={loggingIn}
            >
              {loggingIn ? 'Authenticating...' : 'Sign In as Administrator'}
            </button>
          </form>

          <div className="admin-login-hints">
            <strong>Default Credentials:</strong>
            <br />
            Email: <code>admin@bidyutfurniture.com</code>
            <br />
            Password: <code>admin123</code>
          </div>

          <div style={{ marginTop: '20px' }}>
            <Link to="/" style={{ color: 'var(--admin-accent)', fontSize: '13px', textDecoration: 'none' }}>
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Context value exposed to subroutes
  const contextValue = {
    products,
    setProducts,
    users,
    setUsers,
    orders,
    setOrders,
    loading,
    refreshing,
    stats,
    availableCategories,
    loadAdminData,
    token,
    currentUser,
    showMessage,
    formatImageUrl,
    formatINR,
    renderStatusBadge,
    openEditModal,
    openDeleteModal,
    handleOpenOrderDetails,
    handleStatusChange,
    handleLogout,
    setViewProductModal,
  };

  return (
    <div className="admin-body-wrapper">
      {/* ================= HEADER ================= */}
      <AdminHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentUser={currentUser}
        handleLogout={handleLogout}
      />

      {/* Global Toast Feedback Message */}
      {actionMessage.text && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '30px',
            zIndex: 9999,
            backgroundColor: actionMessage.type === 'error' ? '#dc2626' : '#059669',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'modal-slide-up 0.2s ease',
          }}
        >
          {actionMessage.type === 'error' ? '❌' : '✅'} {actionMessage.text}
        </div>
      )}

      {/* ================= LAYOUT ================= */}
      <div className="admin-layout">
        {/* ================= SIDEBAR ================= */}
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          productsCount={products.length}
          pendingOrdersCount={stats.pendingOrders}
          usersCount={users.length}
          handleLogout={handleLogout}
        />

        {/* ================= MAIN CONTENT VIA OUTLET ================= */}
        <main className="admin-main">
          {loading && products.length === 0 ? (
            <Loading message="Fetching store catalogue, orders, and customer accounts..." />
          ) : (
            <Outlet context={contextValue} />
          )}
        </main>
      </div>

      {/* ================= MODAL: EDIT PRODUCT ================= */}
      {editModalOpen && editingProduct && (
        <div className="admin-modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>✏️ Edit Product #{editingProduct.id}</h3>
              <button
                className="admin-modal-close-btn"
                onClick={() => setEditModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProductSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <div className="admin-form-group full-width">
                    <label>Product Name</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, category: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Image Path / URL</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editingProduct.image}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, image: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="admin-form-group full-width">
                    <label>Image Preview</label>
                    <div className="admin-image-preview-container">
                      <img
                        src={formatImageUrl(editingProduct.image)}
                        alt="Preview"
                        className="admin-image-preview-box"
                        onError={(e) => {
                          e.target.src = '/img/bed/bed1.jpg';
                        }}
                      />
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        Live preview of: {editingProduct.image}
                      </span>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Selling Price (₹)</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, price: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Old Price (₹)</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={editingProduct.old_price}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, old_price: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Discount Badge</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editingProduct.discount}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, discount: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      className="admin-form-input"
                      value={editingProduct.rating}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, rating: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Reviews</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={editingProduct.reviews}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, reviews: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Delivery</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editingProduct.delivery}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, delivery: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-form-group full-width">
                    <label>Featured Badge</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editingProduct.badge}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, badge: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={updatingProduct}
                >
                  {updatingProduct ? 'Saving...' : '💾 Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE PRODUCT CONFIRMATION ================= */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="🗑️ Delete Product Confirmation"
        message="Are you sure you want to permanently delete the following product from the database?"
        warningText="This action is irreversible and will remove this product from all customer categories."
        itemDetails={deletingProduct}
        onConfirm={confirmDeleteProduct}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeletingProduct(null);
        }}
        confirmText="Yes, Delete Permanently"
        isConfirming={isDeleting}
        formatImageUrl={formatImageUrl}
        formatINR={formatINR}
      />

      {/* ================= MODAL: VIEW PRODUCT DETAILS ================= */}
      {viewProductModal && (
        <div className="admin-modal-overlay" onClick={() => setViewProductModal(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>📦 Product Details: #{viewProductModal.id}</h3>
              <button
                className="admin-modal-close-btn"
                onClick={() => setViewProductModal(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <img
                  src={formatImageUrl(viewProductModal.image)}
                  alt={viewProductModal.name}
                  style={{
                    width: '200px',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                  }}
                  onError={(e) => {
                    e.target.src = '/img/bed/bed1.jpg';
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h2>{viewProductModal.name}</h2>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="product-tag">{viewProductModal.category}</span>
                    {viewProductModal.badge && (
                      <span className="status-badge status-pending">{viewProductModal.badge}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--admin-primary)', marginTop: '12px' }}>
                    {formatINR(viewProductModal.price)}
                    {viewProductModal.old_price > 0 && (
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#9ca3af',
                          textDecoration: 'line-through',
                          marginLeft: '8px',
                        }}
                      >
                        {formatINR(viewProductModal.old_price)}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
                    ⭐ Rating: <strong>{viewProductModal.rating || '4.5'}</strong> ({viewProductModal.reviews || 0} reviews)
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                    🚚 Delivery: <strong>{viewProductModal.delivery || 'Ships in 3 Days'}</strong>
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                    🎨 Colors: <strong>{viewProductModal.colors || 'Standard'}</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                className="admin-btn-primary"
                onClick={() => {
                  const p = viewProductModal;
                  setViewProductModal(null);
                  openEditModal(p);
                }}
              >
                ✏️ Edit this Product
              </button>
              <button
                className="admin-btn-outline"
                onClick={() => setViewProductModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ORDER DETAILS WITH ORDER ITEMS ================= */}
      {orderDetailsModal && (
        <div className="admin-modal-overlay" onClick={() => setOrderDetailsModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>🛒 Order #{orderDetailsModal.id} Details</h3>
              <button
                className="admin-modal-close-btn"
                onClick={() => setOrderDetailsModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="order-detail-meta">
                <div className="order-detail-meta-item">
                  <h5>Customer Name</h5>
                  <p>{orderDetailsModal.user_name || 'Customer'}</p>
                </div>
                <div className="order-detail-meta-item">
                  <h5>Email Address</h5>
                  <p>{orderDetailsModal.user_email || 'N/A'}</p>
                </div>
                <div className="order-detail-meta-item">
                  <h5>Order Date</h5>
                  <p>{new Date(orderDetailsModal.created_at).toLocaleString('en-IN')}</p>
                </div>
                <div className="order-detail-meta-item">
                  <h5>Fulfillment Status</h5>
                  <div>{renderStatusBadge(orderDetailsModal.status)}</div>
                </div>
              </div>

              <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--admin-primary)' }}>
                📦 Items Purchased ({orderDetailsModal.items ? orderDetailsModal.items.length : 0})
              </h4>

              {loadingOrderDetails ? (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  Loading order items from database...
                </div>
              ) : !orderDetailsModal.items || orderDetailsModal.items.length === 0 ? (
                <div className="admin-empty-state" style={{ padding: '24px' }}>
                  <p>No line items found for this order.</p>
                </div>
              ) : (
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Unit Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetailsModal.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="order-item-prod">
                            <img
                              src={formatImageUrl(item.product_image)}
                              alt={item.product_name}
                              className="order-item-img"
                              onError={(e) => {
                                e.target.src = '/img/bed/bed1.jpg';
                              }}
                            />
                            <div>
                              <strong>{item.product_name || `Product #${item.product_id}`}</strong>
                              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                Product ID: #{item.product_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{formatINR(item.price)}</td>
                        <td>
                          <strong>{item.quantity}</strong>
                        </td>
                        <td>
                          <strong>{formatINR(Number(item.price) * Number(item.quantity))}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb',
                }}
              >
                <span style={{ fontSize: '15px', color: '#4b5563' }}>Grand Total:</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#059669' }}>
                  {formatINR(orderDetailsModal.total_amount)}
                </span>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn-outline"
                onClick={() => setOrderDetailsModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
