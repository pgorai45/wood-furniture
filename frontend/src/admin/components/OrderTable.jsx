import React from 'react';

const renderDefaultStatusBadge = (status) => {
  const s = (status || 'Pending').toLowerCase();
  let badgeClass = 'status-pending';
  if (s === 'confirmed') badgeClass = 'status-confirmed';
  if (s === 'shipped') badgeClass = 'status-shipped';
  if (s === 'delivered') badgeClass = 'status-delivered';
  if (s === 'cancelled') badgeClass = 'status-cancelled';

  return <span className={`status-badge ${badgeClass}`}>{status || 'Pending'}</span>;
};

const OrderTable = ({
  orders = [],
  onStatusChange,
  onViewDetails,
  renderStatusBadge = renderDefaultStatusBadge,
  formatINR = (amt) => `₹${Number(amt || 0).toLocaleString('en-IN')}`,
  showStatusSelect = true,
  emptyTitle = 'No orders recorded yet',
  emptyMessage = 'Orders placed by customers will automatically appear here.',
}) => {
  if (orders.length === 0) {
    return (
      <div className="admin-empty-state">
        <div className="admin-empty-icon">🛒</div>
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
            <th>Order ID</th>
            <th>Customer Info</th>
            <th>Placed On</th>
            <th>Total Amount</th>
            <th>Fulfillment Status</th>
            {showStatusSelect && onStatusChange && <th>Change Status</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((ord) => (
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
              <td>
                <div>
                  {new Date(ord.created_at).toLocaleDateString('en-IN')}
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {new Date(ord.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </td>
              <td>
                <strong style={{ color: '#059669', fontSize: '14px' }}>
                  {formatINR(ord.total_amount)}
                </strong>
              </td>
              <td>{renderStatusBadge(ord.status)}</td>
              {showStatusSelect && onStatusChange && (
                <td>
                  <select
                    className="admin-select"
                    value={ord.status || 'Pending'}
                    onChange={(e) => onStatusChange(ord.id, e.target.value)}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              )}
              <td>
                {onViewDetails && (
                  <button
                    className="admin-btn-action view-btn"
                    onClick={() => onViewDetails(ord)}
                  >
                    👁️ Items
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
