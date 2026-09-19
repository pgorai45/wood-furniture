import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { adminAddProduct } from '../../services/api';
import '../styles/products.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const { token, showMessage, loadAdminData, formatImageUrl } = useOutletContext();

  const [newProduct, setNewProduct] = useState({
    name: '',
    image: 'img/bed/bed1.jpg',
    price: '',
    old_price: '',
    discount: '',
    rating: '4.5',
    reviews: '50',
    colors: '3+ Colors',
    delivery: 'Ships in 3 Days',
    badge: 'New Arrival',
    category: 'bed',
  });
  const [addingProduct, setAddingProduct] = useState(false);

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showMessage('Admin authorization expired. Please log in.', 'error');
      return;
    }

    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      showMessage('Please provide at least a Product Name, Category, and Price.', 'error');
      return;
    }

    setAddingProduct(true);
    try {
      const payload = {
        name: newProduct.name.trim(),
        image: newProduct.image.trim() || 'img/bed/bed1.jpg',
        price: Number(newProduct.price),
        old_price: Number(newProduct.old_price || 0),
        discount: newProduct.discount?.trim() || '',
        rating: Number(newProduct.rating || 4.5),
        reviews: Number(newProduct.reviews || 0),
        colors: newProduct.colors?.trim() || '3+ Colors',
        delivery: newProduct.delivery?.trim() || 'Ships in 3 Days',
        badge: newProduct.badge?.trim() || '',
        category: newProduct.category?.trim().toLowerCase(),
      };

      const res = await adminAddProduct(token, payload);
      if (res.success) {
        showMessage(`Product "${payload.name}" successfully added to catalogue!`);
        await loadAdminData(token);
        navigate('/admin/products');
      } else {
        showMessage(res.message || 'Failed to add product', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.message || 'Server error while adding product', 'error');
    } finally {
      setAddingProduct(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Add New Product</h1>
          <p>Fill in the product specifications to list it on the store</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">📝 Product Information Form</div>
        </div>
        <div className="admin-card-body">
          <form onSubmit={handleAddProductSubmit}>
            <div className="admin-form-grid">
              {/* Product Name */}
              <div className="admin-form-group full-width">
                <label>
                  Product Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Royal Teak Wood King Size Bed"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
              </div>

              {/* Category */}
              <div className="admin-form-group">
                <label>
                  Category <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="bed, sofa, dining-table, study, chair..."
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  required
                />
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {['bed', 'sofa', 'dining-table', 'study', 'outdoor', 'decor'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewProduct({ ...newProduct, category: cat })}
                      style={{
                        background: newProduct.category === cat ? '#d4704c' : '#f3f4f6',
                        color: newProduct.category === cat ? '#fff' : '#4b5563',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Path */}
              <div className="admin-form-group">
                <label>
                  Image Path / URL <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. img/bed/bed1.jpg or https://..."
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  required
                />
              </div>

              {/* Image Preview Box */}
              <div className="admin-form-group full-width">
                <label>Live Image Preview</label>
                <div className="admin-image-preview-container">
                  <img
                    src={formatImageUrl(newProduct.image)}
                    alt="Preview"
                    className="admin-image-preview-box"
                    onError={(e) => {
                      e.target.src = '/img/bed/bed1.jpg';
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    <div>
                      Previewing: <code>{newProduct.image || 'None'}</code>
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      Local assets from <code>frontend/public/img/</code> or external web URLs are supported.
                    </div>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="admin-form-group">
                <label>
                  Selling Price (₹) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  className="admin-form-input"
                  placeholder="e.g. 24999"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                />
              </div>

              {/* Old Price */}
              <div className="admin-form-group">
                <label>Original / Old Price (₹)</label>
                <input
                  type="number"
                  className="admin-form-input"
                  placeholder="e.g. 32999"
                  value={newProduct.old_price}
                  onChange={(e) => setNewProduct({ ...newProduct, old_price: e.target.value })}
                />
              </div>

              {/* Discount text */}
              <div className="admin-form-group">
                <label>Discount Badge</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. 25% OFF"
                  value={newProduct.discount}
                  onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                />
              </div>

              {/* Rating */}
              <div className="admin-form-group">
                <label>Rating (1.0 to 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  className="admin-form-input"
                  placeholder="4.5"
                  value={newProduct.rating}
                  onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })}
                />
              </div>

              {/* Reviews count */}
              <div className="admin-form-group">
                <label>Reviews Count</label>
                <input
                  type="number"
                  className="admin-form-input"
                  placeholder="50"
                  value={newProduct.reviews}
                  onChange={(e) => setNewProduct({ ...newProduct, reviews: e.target.value })}
                />
              </div>

              {/* Available Colors */}
              <div className="admin-form-group">
                <label>Color Options</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. 3+ Colors (Teak, Walnut, Mahogany)"
                  value={newProduct.colors}
                  onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                />
              </div>

              {/* Delivery Time */}
              <div className="admin-form-group">
                <label>Delivery Timeline</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Ships in 3 Days"
                  value={newProduct.delivery}
                  onChange={(e) => setNewProduct({ ...newProduct, delivery: e.target.value })}
                />
              </div>

              {/* Badge */}
              <div className="admin-form-group">
                <label>Featured Badge</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Best Seller, New Arrival, Trending"
                  value={newProduct.badge}
                  onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                className="admin-btn-primary"
                style={{ padding: '12px 28px', fontSize: '14px' }}
                disabled={addingProduct}
              >
                {addingProduct ? 'Adding Product to Database...' : '💾 Save & Publish Product'}
              </button>
              <button
                type="button"
                className="admin-btn-outline"
                onClick={() => navigate('/admin/products')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
