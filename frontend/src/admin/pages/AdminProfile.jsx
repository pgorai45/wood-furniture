import React from 'react';
import { useOutletContext } from 'react-router-dom';
import '../styles/admin-profile.css';

const AdminProfile = () => {
  const { currentUser, products, orders, users, loadAdminData, token, handleLogout } =
    useOutletContext();

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Administrator Profile & Settings</h1>
          <p>Account credentials, server status, and security preferences</p>
        </div>
      </div>

      <div className="admin-profile-grid">
        {/* Admin Profile Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">👤 Admin Account Profile</div>
          </div>
          <div className="admin-card-body">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div
                className="admin-avatar"
                style={{ width: '60px', height: '60px', fontSize: '24px' }}
              >
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', color: 'var(--admin-primary)' }}>
                  {currentUser?.name || 'Master Administrator'}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)' }}>
                  Role: <span className="role-badge role-admin">{currentUser?.role || 'admin'}</span>
                </p>
              </div>
            </div>

            <div className="admin-info-list">
              <div className="admin-info-item">
                <span className="admin-info-label">Email Address</span>
                <span className="admin-info-value">{currentUser?.email}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Admin ID</span>
                <span className="admin-info-value">#{currentUser?.id || 1}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Permissions</span>
                <span className="admin-info-value">Full Access (Read / Write / Delete)</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Session Status</span>
                <span className="admin-info-value" style={{ color: '#059669' }}>
                  🟢 Active & Authenticated
                </span>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button className="admin-btn-primary" onClick={handleLogout}>
                🚪 Logout from Admin
              </button>
            </div>
          </div>
        </div>

        {/* System & API Status */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">🖥️ Server & Database Health</div>
          </div>
          <div className="admin-card-body">
            <div className="admin-info-list">
              <div className="admin-info-item">
                <span className="admin-info-label">Backend API URL</span>
                <span className="admin-info-value">http://localhost:5000</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Database Engine</span>
                <span className="admin-info-value">MySQL (wood_furniture)</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Connected Products</span>
                <span className="admin-info-value">{products.length} Items</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Connected Orders</span>
                <span className="admin-info-value">{orders.length} Records</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Connected Customers</span>
                <span className="admin-info-value">{users.length} Accounts</span>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button className="admin-btn-outline" onClick={() => loadAdminData(token)}>
                🔄 Re-verify Server Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
