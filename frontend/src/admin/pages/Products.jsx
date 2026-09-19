import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import ProductTable from '../components/ProductTable';
import '../styles/products.css';

const Products = () => {
  const navigate = useNavigate();
  const {
    products,
    availableCategories,
    formatImageUrl,
    formatINR,
    openEditModal,
    openDeleteModal,
    setViewProductModal,
  } = useOutletContext();

  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(productSearch.toLowerCase()) ||
        String(p.id).includes(productSearch);

      const matchCategory =
        productCategoryFilter === 'ALL' ||
        (p.category || '').toLowerCase() === productCategoryFilter.toLowerCase();

      return matchSearch && matchCategory;
    });
  }, [products, productSearch, productCategoryFilter]);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Product Management</h1>
          <p>View, search, edit, and manage all furniture products in store</p>
        </div>
        <div className="admin-header-actions">
          <button
            className="admin-btn-primary"
            onClick={() => navigate('/admin/products/add')}
          >
            ➕ Add New Product
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-body">
          {/* Search and Filters */}
          <div className="admin-toolbar">
            <div className="admin-search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search product name, category, or ID..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            <div className="admin-filter-group">
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
                Category:
              </label>
              <select
                className="admin-select"
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories ({products.length})</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table Component */}
          <ProductTable
            products={filteredProducts}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onView={setViewProductModal}
            formatImageUrl={formatImageUrl}
            formatINR={formatINR}
          />
        </div>
      </div>
    </div>
  );
};

export default Products;
