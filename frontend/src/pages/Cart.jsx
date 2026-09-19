import React, { useState, useEffect } from 'react';
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

  const { user, token, openLogin } = useAuth();
  const navigate = useNavigate();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [checkingOut, setCheckingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Shipping details state
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  // Pre-fill user profile info when logged in
  useEffect(() => {
    if (user) {
      if (!shippingName && user.name) setShippingName(user.name);
      if (!shippingPhone && user.phone) setShippingPhone(user.phone);
      if (!shippingAddress && user.address) setShippingAddress(user.address);
    }
  }, [user]);

  const formatImage = (img) => {
    if (!img) return '/img/bedroom/bed1.webp';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) {
      return img;
    }
    return `/${img}`;
  };

  // Step 1 -> Step 2: Proceed to Checkout
  const handleProceedToCheckout = () => {
    setErrorMessage('');
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!user) {
      openLogin();
      return;
    }

    setCheckoutStep('checkout');
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  // Step 2 -> Step 3: Place Order with backend
  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!user) {
      openLogin();
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    if (!shippingAddress || !shippingAddress.trim()) {
      setErrorMessage('Please provide your complete delivery address.');
      return;
    }

    if (!shippingPhone || !shippingPhone.trim()) {
      setErrorMessage('Please provide your contact mobile number for delivery.');
      return;
    }

    const currentToken = token || localStorage.getItem('userToken');
    if (!currentToken) {
      openLogin();
      return;
    }

    const items = cart.map((product) => ({
      product_id: product.id,
      quantity: Number(product.qty || 1),
      price: Number(product.price),
    }));

    setCheckingOut(true);
    try {
      const orderPayload = {
        items,
        shipping_name: shippingName.trim() || user.name,
        shipping_phone: shippingPhone.trim() || user.phone,
        shipping_address: shippingAddress.trim(),
        payment_method: 'Cash on Delivery',
      };

      const data = await checkoutOrder(orderPayload, currentToken);

      if (data && data.success) {
        setPlacedOrder(data);
        clearCart();
        setCheckoutStep('success');
        window.scrollTo({ top: 100, behavior: 'smooth' });
      } else {
        setErrorMessage(data?.message || 'Failed to place order.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setErrorMessage(
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
            <span>
              {checkoutStep === 'success'
                ? 'ORDER CONFIRMATION'
                : checkoutStep === 'checkout'
                ? 'SECURE CHECKOUT'
                : 'YOUR SHOPPING BAG'}
            </span>
            <div className="heading-line"></div>
          </div>
          <h1>
            {checkoutStep === 'success'
              ? 'Thank You For Your Order'
              : checkoutStep === 'checkout'
              ? 'Finalize Your Order'
              : 'Shopping Cart'}
          </h1>
          <p>
            {checkoutStep === 'success'
              ? 'Your handcrafted furniture order has been recorded successfully.'
              : checkoutStep === 'checkout'
              ? 'Confirm your delivery address and review order items before placing.'
              : 'Review your selected furniture before proceeding to checkout.'}
          </p>
        </div>
      </section>

      {/* ================= SUCCESS CONFIRMATION VIEW ================= */}
      {checkoutStep === 'success' && placedOrder && (
        <section className="empty-cart-section" style={{ padding: '40px 20px 90px' }}>
          <div className="empty-cart-card" style={{ maxWidth: '720px', textAlign: 'left', padding: '40px 45px' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ fontSize: '50px', marginBottom: '10px' }}>🎉</div>
              <h2 style={{ fontSize: '32px', color: '#222', marginBottom: '8px' }}>
                Order Placed Successfully!
              </h2>
              <p style={{ color: '#059669', fontWeight: 600, fontSize: '16px', margin: 0 }}>
                Order ID: #{placedOrder.orderId}
              </p>
            </div>

            <div style={{ background: '#fbf8f5', borderRadius: '16px', padding: '20px', border: '1px solid #ece3d8', marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#222', borderBottom: '1px solid #ece3d8', paddingBottom: '8px' }}>
                📦 Delivery & Customer Details
              </h4>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}>
                <strong>Recipient:</strong> {placedOrder.shipping_name || user?.name}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}>
                <strong>Contact Phone:</strong> +91 {placedOrder.shipping_phone || user?.phone}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}>
                <strong>Shipping Address:</strong> {placedOrder.shipping_address}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}>
                <strong>Payment Method:</strong> {placedOrder.payment_method || 'Cash on Delivery'}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}>
                <strong>Fulfillment Status:</strong>{' '}
                <span style={{ color: '#d97706', fontWeight: 600 }}>● {placedOrder.status || 'Pending'}</span>
              </p>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #ece3d8', marginBottom: '30px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#222', borderBottom: '1px solid #ece3d8', paddingBottom: '8px' }}>
                🧾 Order Amount Breakdown
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', fontSize: '14px', color: '#666' }}>
                <span>Subtotal</span>
                <span>₹{Number(placedOrder.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              {Number(placedOrder.discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', fontSize: '14px', color: '#059669' }}>
                  <span>Discount</span>
                  <span>-₹{Number(placedOrder.discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', fontSize: '14px', color: '#666' }}>
                <span>Shipping</span>
                <span>Free Delivery</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', fontSize: '14px', color: '#666' }}>
                <span>GST (18%)</span>
                <span>₹{Number(placedOrder.gst || 0).toLocaleString('en-IN')}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #ece3d8', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, color: '#222' }}>
                <span>Grand Total Paid / Due</span>
                <span style={{ color: '#d4704c' }}>₹{Number(placedOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="continue-btn"
                style={{ margin: 0, cursor: 'pointer' }}
                onClick={() => navigate('/profile?tab=orders', { state: { tab: 'orders' } })}
              >
                <i className="fa-solid fa-bag-shopping"></i> View in My Orders
              </button>

              <button
                type="button"
                className="continue-btn"
                style={{
                  margin: 0,
                  background: '#fff',
                  color: '#d4704c',
                  border: '2px solid #d4704c',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================= EMPTY CART VIEW ================= */}
      {checkoutStep === 'cart' && cart.length === 0 && (
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
      )}

      {/* ================= CART ITEMS VIEW ================= */}
      {checkoutStep === 'cart' && cart.length > 0 && (
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
                  <span>Discount (10% on ₹50k+)</span>
                  <span id="discount">-₹{discount.toLocaleString('en-IN')}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>Free</span>
                </div>

                <div className="summary-row">
                  <span>GST (18%)</span>
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
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
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

      {/* ================= CHECKOUT & SHIPPING VIEW ================= */}
      {checkoutStep === 'checkout' && cart.length > 0 && (
        <section className="cart-page" id="checkoutPage">
          <div className="cart-container">
            {/* Left: Shipping & Customer Information */}
            <div className="cart-products">
              <div className="cart-header" style={{ marginBottom: '20px' }}>
                <h2>Delivery & Shipping Information</h2>
                <span id="cartCount">{cart.length} Products</span>
              </div>

              {errorMessage && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    marginBottom: '20px',
                    fontWeight: 500,
                  }}
                >
                  ⚠️ {errorMessage}
                </div>
              )}

              <form onSubmit={handlePlaceOrder}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '8px', fontSize: '14px', color: '#64748b' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Contact Mobile Number (+91) *
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Shipping / Delivery Address *
                  </label>
                  <textarea
                    placeholder="Enter complete delivery address with landmark, city, state, and pin code"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                    rows={3}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ marginBottom: '25px', padding: '16px', background: '#fffaf7', border: '1px solid #ece3d8', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#222' }}>
                    💳 Payment Method
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155' }}>
                    <input type="radio" checked readOnly id="codRadio" />
                    <label htmlFor="codRadio" style={{ fontWeight: 600 }}>
                      Cash on Delivery (Pay upon delivery)
                    </label>
                  </div>
                  <p style={{ margin: '4px 0 0 24px', fontSize: '12px', color: '#78350f' }}>
                    Online card/UPI payments will be available soon.
                  </p>
                </div>

                {/* Items Summary in Checkout */}
                <h4 style={{ margin: '0 0 14px 0', fontSize: '16px', color: '#222' }}>
                  Items Being Ordered ({cart.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        border: '1px solid #ece3d8',
                        borderRadius: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={formatImage(item.image)}
                          alt={item.name}
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#222' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Qty: {item.qty || 1} × ₹{Number(item.price).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#d4704c', fontSize: '14px' }}>
                        ₹{(Number(item.price) * (item.qty || 1)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            </div>

            {/* Right: Order Summary with Place Order */}
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
                  <span style={{ color: '#059669', fontWeight: 600 }}>Free</span>
                </div>

                <div className="summary-row">
                  <span>GST (18%)</span>
                  <span id="tax">₹{tax.toLocaleString('en-IN')}</span>
                </div>

                <hr />

                <div className="summary-total">
                  <span>Total</span>
                  <span id="grandTotal">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                <button
                  className="checkout-btn"
                  id="placeOrderBtn"
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={checkingOut}
                >
                  {checkingOut ? 'Placing Order...' : 'Place Order Now'}
                </button>

                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    marginTop: '15px',
                    color: '#666',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  ← Back to Cart Items
                </button>
              </div>
            </aside>
          </div>
        </section>
      )}
    </main>
  );
};

export default Cart;
