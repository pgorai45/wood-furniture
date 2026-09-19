import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { adminUpdateProduct } from '../../services/api';
import '../styles/products.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, token, showMessage, loadAdminData, formatImageUrl } = useOutletContext();

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    price: '',
    old_price: '',
    discount: '',
    rating: '4.5',
    reviews: '0',
    colors: '',
    delivery: '',
    badge: '',
    category: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id && products.length > 0) {
      const prod = products.find((p) => String(p.id) === String(id));
      if (prod) {
        setFormData({
          name: prod.name || '',
          image: prod.image || '',
          price: prod.price || '',
          old_price: prod.old_price || '',
          discount: prod.discount || '',
          rating: prod.rating || '4.5',
          reviews: prod.reviews || '0',
          colors: prod.colors || '',
          delivery: prod.delivery || '',
          badge: prod.badge || '',
          category: prod.category || '',
        });
      }
    }
  }, [id, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showMessage('Admin authorization expired. Please log in.', 'error');
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        name: formData.name.trim(),
        image: formData.image.trim(),
        price: Number(formData.price),
        old_price: Number(formData.old_price || 0),
        discount: formData.discount?.trim() || '',
        rating: Number(formData.rating || 4.5),
        reviews: Number(formData.reviews || 0),
        colors: formData.colors?.trim() || '',
        delivery: formData.delivery?.trim() || '',
        badge: formData.badge?.trim() || '',
        category: formData.category?.trim().toLowerCase(),
      };

      const res = await adminUpdateProduct(token, id, payload);
      if (res.success) {
        showMessage(`Product #${id} updated successfully!`);
        await loadAdminData(token);
        navigate('/admin/products');
      } else {
        showMessage(res.message || 'Update failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.message || 'Error updating product', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Edit Product #{id}</h1>
          <p>Update product specifications and catalogue details</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">✏️ Edit Product Form</div>
        </div>
        <div className="admin-card-body">
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="admin-form-group full-width">
                <label>
                  Product Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>
                  Category <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>
                  Image Path / URL <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group full-width">
                <label>Live Image Preview</label>
                <div className="admin-image-preview-container">
                  <img
                    src={formatImageUrl(formData.image)}
                    alt="Preview"
                    className="admin-image-preview-box"
                    onError={(e) => {
                      e.target.src = '/img/bed/bed1.jpg';
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Previewing: <code>{formData.image || 'None'}</code>
                  </div>
                </div>
              </div>

              <div className="admin-form-group">
                <label>
                  Selling Price (₹) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Original / Old Price (₹)</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={formData.old_price}
                  onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Discount Badge</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Rating (1.0 to 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  className="admin-form-input"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Reviews Count</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={formData.reviews}
                  onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Color Options</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Delivery Timeline</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.delivery}
                  onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
                />
              </div>

              <div className="admin-form-group full-width">
                <label>Featured Badge</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                className="admin-btn-primary"
                style={{ padding: '12px 28px', fontSize: '14px' }}
                disabled={updating}
              >
                {updating ? 'Saving...' : '💾 Update Product'}
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

export default EditProduct;
