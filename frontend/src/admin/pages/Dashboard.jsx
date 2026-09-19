import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import StatCard from '../components/StatCard';
import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    products,
    orders,
    stats,
    availableCategories,
    refreshing,
    loadAdminData,
    token,
    formatImageUrl,
    formatINR,
    renderStatusBadge,
    openEditModal,
    openDeleteModal,
    handleOpenOrderDetails,
  } = useOutletContext();

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Store Overview & Dashboard</h1>
          <p>Real-time analytics and management for Bidyut Furniture</p>
        </div>
        <div className="admin-header-actions">
          <button
            className="admin-btn-outline"
            onClick={() => loadAdminData(token)}
            disabled={refreshing}
          >
            🔄 {refreshing ? 'Syncing...' : 'Refresh Data'}
          </button>
          <button
            className="admin-btn-primary"
            onClick={() => navigate('/admin/products/add')}
          >
            ➕ Add New Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          subtitle={`Across ${availableCategories.length} categories`}
          icon="📦"
          iconBgClass="stat-icon-orange"
          onClick={() => navigate('/admin/products')}
        />

        <StatCard
          title="Customers"
          value={stats.totalUsers}
          subtitle="Registered customer accounts"
          icon="👥"
          iconBgClass="stat-icon-blue"
          onClick={() => navigate('/admin/users')}
        />

        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle={`${stats.pendingOrders} pending fulfillment`}
          icon="🛒"
          iconBgClass="stat-icon-purple"
          onClick={() => navigate('/admin/orders')}
        />

        <StatCard
          title="Total Revenue"
          value={formatINR(stats.totalRevenue)}
          subtitle="From all customer orders"
          icon="💰"
          iconBgClass="stat-icon-green"
        />
      </div>

      {/* Recent Orders Section */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">
            <span>🛒</span> Recent Customer Orders
          </div>
          <button
            className="admin-btn-outline"
            onClick={() => navigate('/admin/orders')}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            View All Orders →
          </button>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          {orders.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">🛒</div>
              <h4>No orders recorded yet</h4>
              <p>Orders placed by customers will automatically appear here.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <strong>#{ord.id}</strong>
                      </td>
                      <td>
                        <div>
                          <strong>{ord.user_name || 'Customer'}</strong>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {ord.user_email}
                          </div>
                        </div>
                      </td>
                      <td>{new Date(ord.created_at).toLocaleDateString('en-IN')}</td>
                      <td>
                        <strong>{formatINR(ord.total_amount)}</strong>
                      </td>
                      <td>{renderStatusBadge(ord.status)}</td>
                      <td>
                        <button
                          className="admin-btn-action view-btn"
                          onClick={() => handleOpenOrderDetails(ord)}
                        >
                          👁️ View Items
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Products Overview */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">
            <span>📦</span> Newly Added Products
          </div>
          <button
            className="admin-btn-outline"
            onClick={() => navigate('/admin/products')}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Manage Catalogue →
          </button>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Badge</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div className="admin-product-cell">
                        <img
                          src={formatImageUrl(prod.image)}
                          alt={prod.name}
                          className="admin-product-thumb"
                          onError={(e) => {
                            e.target.src = '/img/bed/bed1.jpg';
                          }}
                        />
                        <div className="admin-product-meta">
                          <h4>{prod.name}</h4>
                          <span>ID: #{prod.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="product-tag">{prod.category}</span>
                    </td>
                    <td>
                      <strong>{formatINR(prod.price)}</strong>
                    </td>
                    <td>⭐ {prod.rating || 4.5}</td>
                    <td>{prod.badge || '-'}</td>
                    <td>
                      <div className="admin-action-btn-group">
                        <button
                          className="admin-btn-action edit-btn"
                          onClick={() => openEditModal(prod)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="admin-btn-action delete-btn"
                          onClick={() => openDeleteModal(prod)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
