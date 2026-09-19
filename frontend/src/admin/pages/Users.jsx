import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import UserTable from '../components/UserTable';
import '../styles/users.css';

const Users = () => {
  const { users, orders, token, loadAdminData } = useOutletContext();
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const isRoleUser = (u.role || 'user').toLowerCase() === 'user';
      const matchSearch =
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        String(u.id).includes(userSearch);
      return isRoleUser && matchSearch;
    });
  }, [users, userSearch]);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>User Management</h1>
          <p>View and search registered customer accounts (role: user)</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn-outline" onClick={() => loadAdminData(token)}>
            🔄 Refresh Users
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-body">
          <div className="admin-toolbar">
            <div className="admin-search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search customer name, email, or ID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
              Total Registered Customers: <strong>{users.length}</strong>
            </div>
          </div>

          <UserTable users={filteredUsers} orders={orders} />
        </div>
      </div>
    </div>
  );
};

export default Users;
