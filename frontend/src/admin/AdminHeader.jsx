import React from 'react';

const AdminHeader = ({ sidebarOpen, setSidebarOpen, currentUser, handleLogout }) => {
  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          className="admin-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle Menu"
        >
          ☰
        </button>
        <div className="admin-logo">
          🪵 Bidyut<span>Furniture</span>
          <span className="admin-badge-tag">Admin Panel</span>
        </div>
      </div>

      <div className="admin-header-right">
        <div className="admin-server-status">
          <span className="admin-status-dot"></span>
          <span>Live MySQL DB (Port 5000)</span>
        </div>

        <div className="admin-user-profile">
          <div className="admin-avatar">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="admin-user-details">
            <span className="admin-user-name">{currentUser?.name || 'Administrator'}</span>
            <span className="admin-user-role">{currentUser?.email || 'admin@store.com'}</span>
          </div>
        </div>

        <button className="admin-btn-header-logout" onClick={handleLogout} title="Logout">
          🚪 Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
