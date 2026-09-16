import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  loginUser,
  getAdminProducts,
  adminAddProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  getAdminUsers,
  getAdminOrders,
  updateOrderStatus,
  getOrderDetails,
} from '../services/api';

const Admin = () => {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('admin@bidyutfurniture.com');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    image: '',
    price: '',
    old_price: '',
    discount: '',
    rating: '4.5',
    reviews: '50',
    colors: '3+ Colors',
    delivery: 'Ships in 3 Days',
    badge: 'New Arrival',
    category: '',
  });

  const navigate = useNavigate();

  // Attempt auto admin login if no token
  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    try {
      const data = await loginUser(adminEmail, adminPassword);
      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
      } else {
        alert(data.message || 'Admin login failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Admin login connection error');
    }
  };

  const loadAllAdminData = async (currentToken) => {
    setLoading(true);
    try {
      const [prodRes, userRes, orderRes] = await Promise.allSettled([
        getAdminProducts(currentToken),
        getAdminUsers(currentToken),
        getAdminOrders(currentToken),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value.success) {
        setProducts(prodRes.value.products || []);
      }
      if (userRes.status === 'fulfilled' && userRes.value.success) {
        setUsers(userRes.value.users || []);
      }
      if (orderRes.status === 'fulfilled' && orderRes.value.success) {
        setOrders(orderRes.value.orders || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAllAdminData(token);
    } else {
      // Auto login with default credentials as in original admin.js
      handleAdminLogin();
    }
  }, [token]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('adminToken');
    setToken('');
    navigate('/');
  };

  // Add Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Admin login required');
      return;
    }

    try {
      const payload = {
        ...newProduct,
        price: Number(newProduct.price),
        old_price: Number(newProduct.old_price || 0),
        rating: Number(newProduct.rating || 4),
        reviews: Number(newProduct.reviews || 0),
      };

      const data = await adminAddProduct(token, payload);
      if (data.success) {
        alert('Product added successfully');
        setNewProduct({
          name: '',
          image: '',
          price: '',
          old_price: '',
          discount: '',
          rating: '4.5',
          reviews: '50',
          colors: '3+ Colors',
          delivery: 'Ships in 3 Days',
          badge: 'New Arrival',
          category: '',
        });
        loadAllAdminData(token);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Add product error:', err);
      alert('Failed to add product.');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const data = await adminDeleteProduct(token, id);
      if (data.success) {
        alert('Product deleted successfully');
        loadAllAdminData(token);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Delete product failed');
    }
  };

  // Edit Product
  const handleEditProduct = async (product) => {
    const name = window.prompt('Product Name:', product.name);
    if (name === null) return;

    const image = window.prompt('Image Path:', product.image);
    if (image === null) return;

    const price = window.prompt('Price:', product.price);
    if (price === null) return;

    const oldPrice = window.prompt('Old Price:', product.old_price || '');
    if (oldPrice === null) return;

    const discount = window.prompt('Discount:', product.discount || '');
    if (discount === null) return;

    const rating = window.prompt('Rating:', product.rating || '4');
    if (rating === null) return;

    const reviews = window.prompt('Reviews:', product.reviews || '0');
    if (reviews === null) return;

    const colors = window.prompt('Colors:', product.colors || '');
    if (colors === null) return;

    const delivery = window.prompt('Delivery:', product.delivery || '');
    if (delivery === null) return;

    const badge = window.prompt('Badge:', product.badge || '');
    if (badge === null) return;

    const category = window.prompt('Category:', product.category);
    if (category === null) return;

    try {
      const updateData = await adminUpdateProduct(token, product.id, {
        name,
        image,
        price: Number(price),
        old_price: Number(oldPrice),
        discount,
        rating: Number(rating),
        reviews: Number(reviews),
        colors,
        delivery,
        badge,
        category,
      });

      if (updateData.success) {
        alert('Product updated successfully');
        loadAllAdminData(token);
      } else {
        alert(updateData.message);
      }
    } catch (err) {
      alert('Backend connection error');
    }
  };

  // Update Status
  const handleStatusChange = async (orderId, status) => {
    try {
      const data = await updateOrderStatus(token, orderId, status);
      if (data.success) {
        alert(`Order #${orderId} status updated to ${status}`);
        loadAllAdminData(token);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Order status update error');
    }
  };

  // View Details
  const handleViewOrderDetails = async (orderId) => {
    try {
      const data = await getOrderDetails(token, orderId);
      if (!data.success || !data.items || data.items.length === 0) {
        alert('No products found in this order.');
        return;
      }

      let details = `Order #${orderId} Details:\n\n`;
      data.items.forEach((item) => {
        details += `Product: ${item.product_name}\nQuantity: ${item.quantity}\nPrice: ₹${Number(
          item.price
        ).toLocaleString('en-IN')}\n\n`;
      });
      alert(details);
    } catch (err) {
      alert('Order details error');
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="admin-header">
        <div className="admin-logo">🪵 Bidyut Furniture</div>
        <div className="admin-user">Admin</div>
      </header>

      {/* Admin Layout */}
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <h3>Admin Panel</h3>
          <a href="#dashboard" className="active">
            📊 Dashboard
          </a>
          <a href="#addProductSection">➕ Add Product</a>
          <a href="#productManagement">📦 Products</a>
          <a href="#userManagement">👤 Users</a>
          <a href="#orderManagement">🛒 Orders</a>
          <a href="#" onClick={handleLogout}>
            🚪 Logout
          </a>
        </aside>

        {/* Main Content */}
        <main className="admin-main" id="dashboard">
          <h1>Admin Dashboard</h1>
          <p className="welcome-text">Welcome, Admin</p>

          {!token && (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3>Admin Login Required</h3>
              <form onSubmit={handleAdminLogin} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Admin Email"
                  required
                />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Admin Password"
                  required
                />
                <button type="submit">Login as Admin</button>
              </form>
            </div>
          )}

          {/* Stats */}
          <section className="admin-stats">
            <div className="stat-card">
              <h3>Total Products</h3>
              <p id="totalProducts">{products.length}</p>
            </div>

            <div className="stat-card">
              <h3>Total Users</h3>
              <p id="totalUsers">{users.length}</p>
            </div>

            <div className="stat-card">
              <h3>Total Orders</h3>
              <p id="totalOrders">{orders.length}</p>
            </div>
          </section>

          {/* Add Product */}
          <section className="add-product-section" id="addProductSection">
            <h2>Add New Product</h2>
            <form id="addProductForm" onSubmit={handleAddProduct}>
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Image Path (e.g. img/bed/bed1.jpg)"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Old Price"
                value={newProduct.old_price}
                onChange={(e) => setNewProduct({ ...newProduct, old_price: e.target.value })}
              />
              <input
                type="text"
                placeholder="Discount (e.g. 25% OFF)"
                value={newProduct.discount}
                onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Rating (1-5)"
                value={newProduct.rating}
                onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })}
              />
              <input
                type="number"
                placeholder="Reviews"
                value={newProduct.reviews}
                onChange={(e) => setNewProduct({ ...newProduct, reviews: e.target.value })}
              />
              <input
                type="text"
                placeholder="Colors (e.g. 3+ Colors)"
                value={newProduct.colors}
                onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
              />
              <input
                type="text"
                placeholder="Delivery (e.g. Ships in 3 Days)"
                value={newProduct.delivery}
                onChange={(e) => setNewProduct({ ...newProduct, delivery: e.target.value })}
              />
              <input
                type="text"
                placeholder="Badge (e.g. Best Seller)"
                value={newProduct.badge}
                onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
              />
              <input
                type="text"
                placeholder="Category (e.g. bed, sofa, dining-table)"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                required
              />
              <button type="submit">Add Product</button>
            </form>
          </section>

          {/* Product Management */}
          <section id="productManagement">
            <h2 className="section-title">Product Management</h2>
            <div id="adminProducts">
              {products.length === 0 ? (
                <p>No products found or backend loading...</p>
              ) : (
                products.map((prod) => (
                  <div className="admin-product" key={prod.id}>
                    <img
                      src={
                        prod.image?.startsWith('/') ||
                        prod.image?.startsWith('http')
                          ? prod.image
                          : `/${prod.image}`
                      }
                      alt={prod.name}
                    />
                    <div className="admin-product-info">
                      <h3>{prod.name}</h3>
                      <p>Category: {prod.category}</p>
                      <p>Price: ₹{Number(prod.price).toLocaleString('en-IN')}</p>
                      <p>Stock Product ID: {prod.id}</p>
                      <button type="button" onClick={() => handleEditProduct(prod)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDeleteProduct(prod.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* User Management */}
          <section id="userManagement" className="user-management">
            <h2 className="section-title">User Management</h2>
            <div id="adminUsers">
              {users.length === 0 ? (
                <p>No users found or loading...</p>
              ) : (
                users.map((u) => (
                  <div className="admin-user-card" key={u.id}>
                    <div>
                      <strong>{u.name}</strong>
                    </div>
                    <div>Email: {u.email}</div>
                    <div>Role: {u.role}</div>
                    <div>User ID: {u.id}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Order Management */}
          <section id="orderManagement" className="order-management">
            <h2 className="section-title">Order Management</h2>
            <div id="adminOrders">
              {orders.length === 0 ? (
                <p>No orders found or loading...</p>
              ) : (
                orders.map((ord) => (
                  <div className="admin-order-card" key={ord.id}>
                    <h3>Order #{ord.id}</h3>
                    <p>Customer: {ord.user_name}</p>
                    <p>Email: {ord.user_email}</p>
                    <p>Total: ₹{Number(ord.total_amount).toLocaleString('en-IN')}</p>
                    <div className="order-status">
                      <label>Status: </label>
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <p>Date: {new Date(ord.created_at).toLocaleString('en-IN')}</p>
                    <button type="button" onClick={() => handleViewOrderDetails(ord.id)}>
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Admin;
