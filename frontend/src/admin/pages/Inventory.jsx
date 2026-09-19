import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import StatCard from '../components/StatCard';
import '../styles/inventory.css';

const Inventory = () => {
  const navigate = useNavigate();
  const { products, formatImageUrl, formatINR, openEditModal } = useOutletContext();
  const [inventorySearch, setInventorySearch] = useState('');

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Inventory & Stock Status</h1>
          <p>Monitor warehouse catalogue and product availability</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn-primary" onClick={() => navigate('/admin/products/add')}>
            ➕ Add Stock Item
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <StatCard
          title="Active SKUs"
          value={products.length}
          subtitle="Catalogue products listed"
          icon="📋"
          iconBgClass="stat-icon-blue"
        />

        <StatCard
          title="In Stock"
          value={products.length}
          subtitle="Available for instant delivery"
          icon="✅"
          iconBgClass="stat-icon-green"
          valueStyle={{ color: '#059669' }}
        />

        <StatCard
          title="Featured Items"
          value={products.filter((p) => p.badge).length}
          subtitle="Best sellers & promotions"
          icon="⭐"
          iconBgClass="stat-icon-amber"
          valueStyle={{ color: '#d97706' }}
        />
      </div>

      <div className="admin-card">
        <div className="admin-card-body">
          <div className="admin-toolbar">
            <div className="admin-search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search inventory items..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>SKU / ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Delivery SLA</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <code>SKU-{prod.id}</code>
                    </td>
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
                          <span>{prod.colors || 'Standard colors'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="product-tag">{prod.category}</span>
                    </td>
                    <td>
                      <strong>{formatINR(prod.price)}</strong>
                    </td>
                    <td>{prod.delivery || 'Ships in 3 Days'}</td>
                    <td>
                      <span className="status-badge status-delivered">● In Stock</span>
                    </td>
                    <td>
                      <button
                        className="admin-btn-action edit-btn"
                        onClick={() => openEditModal(prod)}
                      >
                        ✏️ Edit SKU
                      </button>
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

export default Inventory;
