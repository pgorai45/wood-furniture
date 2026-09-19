import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import OrderTable from '../components/OrderTable';
import '../styles/orders.css';

const Orders = () => {
  const {
    orders,
    stats,
    token,
    loadAdminData,
    handleStatusChange,
    handleOpenOrderDetails,
    renderStatusBadge,
    formatINR,
  } = useOutletContext();

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        String(o.id).includes(orderSearch) ||
        o.user_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.user_email?.toLowerCase().includes(orderSearch.toLowerCase());

      const matchStatus =
        orderStatusFilter === 'ALL' ||
        (o.status || '').toLowerCase() === orderStatusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Order Management</h1>
          <p>Track, manage, and update order fulfillment statuses</p>
        </div>
        <div className="admin-header-actions">
          <button
            className="admin-btn-outline"
            onClick={() => loadAdminData(token)}
          >
            🔄 Refresh Orders
          </button>
        </div>
      </div>

      {/* Status Counters */}
      <div className="admin-stats-grid" style={{ marginBottom: '20px' }}>
        <div
          className="admin-stat-card"
          style={{ cursor: 'pointer' }}
          onClick={() => setOrderStatusFilter('ALL')}
        >
          <div className="admin-stat-info">
            <h3>All Orders</h3>
            <div className="stat-value">{orders.length}</div>
          </div>
        </div>

        <div
          className="admin-stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid #f59e0b' }}
          onClick={() => setOrderStatusFilter('Pending')}
        >
          <div className="admin-stat-info">
            <h3>Pending</h3>
            <div className="stat-value" style={{ color: '#d97706' }}>
              {stats.pendingOrders}
            </div>
          </div>
        </div>

        <div
          className="admin-stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid #4f46e5' }}
          onClick={() => setOrderStatusFilter('Confirmed')}
        >
          <div className="admin-stat-info">
            <h3>Confirmed</h3>
            <div className="stat-value" style={{ color: '#4338ca' }}>
              {stats.confirmedOrders}
            </div>
          </div>
        </div>

        <div
          className="admin-stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid #10b981' }}
          onClick={() => setOrderStatusFilter('Delivered')}
        >
          <div className="admin-stat-info">
            <h3>Delivered</h3>
            <div className="stat-value" style={{ color: '#059669' }}>
              {stats.deliveredOrders}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-body">
          {/* Toolbar */}
          <div className="admin-toolbar">
            <div className="admin-search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, or Email..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
            </div>

            <div className="admin-filter-group">
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
                Status:
              </label>
              <select
                className="admin-select"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses ({orders.length})</option>
                <option value="Pending">Pending ({stats.pendingOrders})</option>
                <option value="Confirmed">Confirmed ({stats.confirmedOrders})</option>
                <option value="Shipped">Shipped ({stats.shippedOrders})</option>
                <option value="Delivered">Delivered ({stats.deliveredOrders})</option>
                <option value="Cancelled">Cancelled ({stats.cancelledOrders})</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <OrderTable
            orders={filteredOrders}
            onStatusChange={handleStatusChange}
            onViewDetails={handleOpenOrderDetails}
            renderStatusBadge={renderStatusBadge}
            formatINR={formatINR}
          />
        </div>
      </div>
    </div>
  );
};

export default Orders;
