import React from 'react';

const ProductTable = ({
  products = [],
  onEdit,
  onDelete,
  onView,
  formatImageUrl = (p) => (p?.startsWith('/') || p?.startsWith('http') ? p : `/${p || 'img/bed/bed1.jpg'}`),
  formatINR = (amt) => `₹${Number(amt || 0).toLocaleString('en-IN')}`,
  emptyTitle = 'No products match your filter',
  emptyMessage = 'Try clearing your search or add a new product.',
}) => {
  if (products.length === 0) {
    return (
      <div className="admin-empty-state">
        <div className="admin-empty-icon">📦</div>
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
            <th>ID</th>
            <th>Product Info</th>
            <th>Category</th>
            <th>Price</th>
            <th>Discount</th>
            <th>Rating</th>
            <th>Badge</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod.id}>
              <td>#{prod.id}</td>
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
                    <span>{prod.delivery || 'Ships in 3 Days'}</span>
                  </div>
                </div>
              </td>
              <td>
                <span className="product-tag">{prod.category}</span>
              </td>
              <td>
                <div>
                  <strong>{formatINR(prod.price)}</strong>
                  {prod.old_price > 0 && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        textDecoration: 'line-through',
                      }}
                    >
                      {formatINR(prod.old_price)}
                    </div>
                  )}
                </div>
              </td>
              <td>{prod.discount || '-'}</td>
              <td>
                ⭐ {prod.rating || '4.5'}
                <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '3px' }}>
                  ({prod.reviews || 0})
                </span>
              </td>
              <td>
                {prod.badge ? (
                  <span
                    style={{
                      background: '#fef3c7',
                      color: '#b45309',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {prod.badge}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td>
                <div className="admin-action-btn-group">
                  {onView && (
                    <button
                      className="admin-btn-action view-btn"
                      onClick={() => onView(prod)}
                      title="View Details"
                    >
                      👁️
                    </button>
                  )}
                  {onEdit && (
                    <button
                      className="admin-btn-action edit-btn"
                      onClick={() => onEdit(prod)}
                      title="Edit Product"
                    >
                      ✏️ Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="admin-btn-action delete-btn"
                      onClick={() => onDelete(prod)}
                      title="Delete Product"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
