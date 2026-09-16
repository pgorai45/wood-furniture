import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
  const { wishlist, removeWishlist, moveToCart } = useWishlist();

  const formatImage = (img) => {
    if (!img) return '/img/bedroom/bed1.webp';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) {
      return img;
    }
    return `/${img}`;
  };

  return (
    <main>
      {/* Breadcrumb */}
      <section className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Wishlist</span>
        </div>
      </section>

      {/* Wishlist Hero */}
      <section className="wishlist-hero">
        <div className="wishlist-heading">
          <div className="heading-line"></div>
          <span>YOUR SAVED PIECES</span>
          <div className="heading-line"></div>
        </div>
        <h1>My Wishlist</h1>
        <p>Save the furniture you love and come back whenever you're ready to bring it home.</p>
      </section>

      {wishlist.length === 0 ? (
        /* Empty Wishlist */
        <section className="wishlist-wrapper" id="emptyWishlist">
          <div className="wishlist-card">
            <div className="wishlist-image">
              <img src="/img/wishlist/empty-wishlist.png" alt="Wishlist" />
            </div>
            <h2>Your wishlist is waiting</h2>
            <p>
              Nothing saved yet. Browse the collection and tap the heart on anything you'd like to
              keep an eye on.
            </p>
            <Link to="/" className="continue-shopping">
              Continue Shopping <i className="fa-solid fa-arrow-right"></i>
            </Link>

            <div className="wishlist-divider">
              <span>or start with</span>
            </div>

            <div className="wishlist-tags">
              <Link to="/living">Sofas</Link>
              <Link to="/dining">Dining Tables</Link>
              <Link to="/living">Storage</Link>
              <Link to="/decor">Decor</Link>
            </div>
          </div>
        </section>
      ) : (
        /* Wishlist Products */
        <section className="wishlist-products" id="wishlistPage">
          <div className="wishlist-header">
            <h2>Wishlist Items</h2>
            <span id="wishlistCount">{wishlist.length} Items</span>
          </div>

          <div className="wishlist-grid" id="wishlistGrid">
            {wishlist.map((product, index) => (
              <div className="wishlist-item" key={index}>
                <img src={formatImage(product.image)} alt={product.name} />

                <div className="wishlist-info">
                  <h3>{product.name}</h3>
                  {product.delivery && <p>{product.delivery}</p>}

                  <div className="wishlist-price">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </div>

                  <div className="wishlist-actions">
                    <button
                      className="move-cart-btn"
                      onClick={() => moveToCart(index)}
                      type="button"
                    >
                      <i className="fa-solid fa-cart-shopping"></i> Move To Cart
                    </button>

                    <button
                      className="remove-btn"
                      onClick={() => removeWishlist(index)}
                      type="button"
                    >
                      <i className="fa-solid fa-trash"></i> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default Wishlist;
