import React from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const formatImage = (img) => {
    if (!img) return '/img/bedroom/bed1.webp';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) {
      return img;
    }
    return `/${img}`;
  };

  const ratingNum = Math.round(Number(product.rating) || 4);
  const stars = '★'.repeat(ratingNum) + '☆'.repeat(Math.max(0, 5 - ratingNum));

  return (
    <div className="product-card">
      <div className="product-img">
        {product.badge && <span className="badge">{product.badge}</span>}

        <button
          className="wishlist"
          onClick={() => addToWishlist(product)}
          type="button"
          aria-label="Add to wishlist"
        >
          <i className="fa-regular fa-heart"></i>
        </button>

        <img src={formatImage(product.image)} alt={product.name} />
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>

        <div className="rating-row">
          <span className="stars">
            {stars}
            {product.reviews && <small>({product.reviews})</small>}
          </span>

          {product.colors && <span className="options">🎨 {product.colors}</span>}
        </div>

        <hr />

        <div className="price-row">
          <span className="price">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </span>

          {(product.old_price || product.oldPrice) && (
            <del>
              ₹{Number(product.old_price || product.oldPrice).toLocaleString('en-IN')}
            </del>
          )}

          {product.discount && (
            <span className="discount">{product.discount}</span>
          )}
        </div>

        {product.delivery && (
          <p className="delivery">🚚 {product.delivery}</p>
        )}

        <button
          className="add-cart-btn"
          onClick={() => addToCart(product)}
          type="button"
        >
          <i className="fa-solid fa-cart-shopping"></i> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
