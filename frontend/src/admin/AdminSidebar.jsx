import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const AdminSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  productsCount = 0,
  pendingOrdersCount = 0,
  usersCount = 0,
  handleLogout,
}) => {
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="admin-sidebar-nav">
        <div className="admin-nav-heading">Main Navigation</div>

        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <span className="nav-icon">📊</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/products"
          end
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <span className="nav-icon">📦</span>
          <span>Products</span>
          <span className="admin-nav-badge">{productsCount}</span>
        </NavLink>

        <NavLink
          to="/admin/products/add"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <span className="nav-icon">➕</span>
          <span>Add Product</span>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <span className="nav-icon">🛒</span>
          <span>Orders</span>
          {pendingOrdersCount > 0 && (
            <span className="admin-nav-badge" style={{ background: '#f59e0b' }}>
              {pendingOrdersCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <span className="nav-icon">👥</span>
          <span>Users</span>
          <span className="admin-nav-badge">{usersCount}</span>
        </NavLink>

        <NavLink
          to="/admin/inventory"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <span className="nav-icon">📋</span>
          <span>Inventory / Stock</span>
        </NavLink>

        <div className="admin-nav-heading">Settings & Info</div>

        <NavLink
          to="/admin/profile"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <span className="nav-icon">⚙️</span>
          <span>Admin Profile</span>
        </NavLink>
      </div>

      <div className="admin-sidebar-footer">
        <Link to="/" className="admin-btn-secondary-link" target="_blank">
          🌐 View Storefront ↗
        </Link>
        <button
          className="admin-btn-secondary-link"
          onClick={handleLogout}
          style={{ border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
