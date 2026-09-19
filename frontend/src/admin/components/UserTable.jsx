import React from 'react';

const UserTable = ({
  users = [],
  orders = [],
  emptyTitle = 'No customer accounts found',
  emptyMessage = 'Customer accounts created on the storefront will appear here.',
}) => {
  if (users.length === 0) {
    return (
      <div className="admin-empty-state">
        <div className="admin-empty-icon">👥</div>
        <h4>{emptyTitle}</h4>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Customer Name</th>
            <th>Email Address</th>
            <th>Role</th>
            <th>Registration Date</th>
            <th>Orders Placed</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const userOrderCount = orders.filter(
              (o) => o.user_id === u.id || o.user_email === u.email
            ).length;

            return (
              <tr key={u.id}>
                <td>#{u.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#e0e7ff',
                        color: '#4338ca',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                      }}
                    >
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <strong>{u.name}</strong>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className="role-badge role-user">
                    {u.role || 'user'}
                  </span>
                </td>
                <td>
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString('en-IN')
                    : 'N/A'}
                </td>
                <td>
                  <span
                    style={{
                      background: '#f3f4f6',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 600,
                    }}
                  >
                    {userOrderCount} orders
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
