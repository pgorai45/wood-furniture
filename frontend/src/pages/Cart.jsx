import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { checkoutOrder } from '../services/api';

const Cart = () => {
  const {
    cart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    subtotal,
    discount,
    tax,
    grandTotal,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  const formatImage = (img) => {
    if (!img) return '/img/bedroom/bed1.webp';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) {
      return img;
    }
    return `/${img}`;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    const userId = user ? user.id : 1;

    const items = cart.map((product) => ({
      product_id: product.id,
      quantity: Number(product.qty || 1),
      price: Number(product.price),
    }));

    setCheckingOut(true);
    try {
      const data = await checkoutOrder(userId, items);

      if (!data.success) {
        alert(data.message || 'Failed to place order.');
        return;
      }

      alert(
        `Order placed successfully!\n\nOrder ID: ${data.orderId}\nSubtotal: ₹${Number(
          data.subtotal
        ).toLocaleString('en-IN')}\nDiscount: ₹${Number(
          data.discount
        ).toLocaleString('en-IN')}\nGST: ₹${Number(
          data.gst
        ).toLocaleString('en-IN')}\nTotal: ₹${Number(
          data.totalAmount
        ).toLocaleString('en-IN')}`
      );

      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Checkout error:', error);
      alert(
        error.response?.data?.message ||
          'Unable to place order with backend right now. Please verify server connection.'
      );
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <main>
      {/* Breadcrumb */}
      <section className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Shopping Cart</span>
        </div>
      </section>

      {/* Cart Hero */}
      <section className="cart-hero">
        <div className="cart-hero-content">
          <div className="wishlist-heading">
            <div className="heading-line"></div>
            <span>YOUR SHOPPING BAG</span>
            <div className="heading-line"></div>
          </div>
          <h1>Shopping Cart</h1>
          <p>Review your selected furniture before proceeding to checkout.</p>
        </div>
      </section>

      {cart.length === 0 ? (
        /* Empty Cart */
        <section className="empty-cart-section" id="emptyCart">
          <div className="empty-cart-card">
            <div className="empty-cart-image">
              <img src="/img/cart/empty-cart.png" alt="Empty Cart" />
            </div>
            <h2>Your Cart is Empty</h2>
            <p>
              Looks like you haven't added any furniture yet. Browse our collection and find
              something you'll love.
            </p>
            <Link to="/" className="continue-btn">
              Continue Shopping <i className="fa-solid fa-arrow-right"></i>
            </Link>

            <div className="cart-divider">
              <span>Popular Categories</span>
            </div>

            <div className="cart-category-list">
              <Link to="/living">Living Room</Link>
              <Link to="/bedroom">Bedroom</Link>
              <Link to="/dining">Dining</Link>
              <Link to="/decor">Decor</Link>
            </div>
          </div>
        </section>
      ) : (
        /* Cart With Products */
        <section className="cart-page" id="cartPage">
          <div className="cart-container">
            {/* Left Products */}
            <div className="cart-products">
              <div className="cart-header">
                <h2>Cart Items</h2>
                <span id="cartCount">{cart.length} Items</span>
              </div>

              <div id="cartItems">
                {cart.map((product, index) => (
                  <div className="cart-item" key={index}>
                    <img src={formatImage(product.image)} alt={product.name} />

                    <div className="cart-info">
                      <h3>{product.name}</h3>
                      {product.delivery && <p>{product.delivery}</p>}

                      <div className="cart-price">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </div>

                      <div className="quantity-box">
                        <button
                          className="qty-btn"
                          onClick={() => decreaseQty(index)}
                          type="button"
                        >
                          -
                        </button>
                        <span className="qty">{product.qty}</span>
                        <button
                          className="qty-btn"
                          onClick={() => increaseQty(index)}
                          type="button"
                        >
                          +
                        </button>
                      </div>

                      <div
                        className="remove-btn"
                        onClick={() => removeItem(index)}
                        role="button"
                      >
                        <i className="fa-solid fa-trash"></i> Remove
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Summary */}
            <aside className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-box">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span id="subtotal">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="summary-row">
                  <span>Discount</span>
                  <span id="discount">-₹{discount.toLocaleString('en-IN')}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>

                <div className="summary-row">
                  <span>GST</span>
                  <span id="tax">₹{tax.toLocaleString('en-IN')}</span>
                </div>

                <hr />

                <div className="summary-total">
                  <span>Total</span>
                  <span id="grandTotal">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                <button
                  className="checkout-btn"
                  id="checkoutBtn"
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? 'Placing Order...' : 'Proceed to Checkout'}
                </button>

                <Link
                  to="/"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    marginTop: '15px',
                    color: '#666',
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  ← Continue Shopping
                </Link>
              </div>
            </aside>
          </div>
        </section>
      )}
    </main>
  );
};

export default Cart;
