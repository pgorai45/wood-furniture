import React from 'react';

const storesList = [
  {
    city: 'Kolkata - Salt Lake',
    address: 'Salt Lake, Sector V, Kolkata, West Bengal',
    phone: '+91 9876543210',
    time: '10:00 AM - 9:00 PM',
    rating: '⭐⭐⭐⭐⭐ (4.9)',
    image: '/img/logo/logo2.jpg',
  },
  {
    city: 'Bankura Showroom',
    address: 'Main Road, Bankura, West Bengal',
    phone: '+91 9732145124',
    time: '10:00 AM - 8:30 PM',
    rating: '⭐⭐⭐⭐⭐ (5.0)',
    image: '/img/logo/logo1.png',
  },
  {
    city: 'Kolkata - South City',
    address: 'Prince Anwar Shah Road, Kolkata',
    phone: '+91 9876543211',
    time: '10:00 AM - 9:00 PM',
    rating: '⭐⭐⭐⭐⭐ (4.8)',
    image: '/img/logo/logo2.jpg',
  },
  {
    city: 'Durgapur Experience Center',
    address: 'City Centre, Durgapur, West Bengal',
    phone: '+91 9876543212',
    time: '10:30 AM - 8:30 PM',
    rating: '⭐⭐⭐⭐⭐ (4.9)',
    image: '/img/logo/logo2.jpg',
  },
];

const Store = () => {
  return (
    <main className="store-page">
      {/* Hero Banner */}
      <section className="store-hero-section">
        <div className="store-hero-overlay">
          <h1 className="store-hero-title">Visit Our Experience Store</h1>
          <p className="store-hero-text">
            Discover premium furniture collections, experience quality craftsmanship, and get expert
            interior consultation.
          </p>
          <a href="#our-stores" className="store-hero-btn">
            Explore Stores
          </a>
        </div>
      </section>

      {/* Our Stores */}
      <section className="store-location-section" id="our-stores">
        <div className="store-section-heading">
          <h2 className="store-section-title">Our Stores</h2>
          <p className="store-section-subtitle">
            Visit your nearest Bidyut Furniture showroom.
          </p>
        </div>

        <div className="store-location-grid">
          {storesList.map((store, idx) => (
            <div className="store-location-card" key={idx}>
              <img
                src={store.image}
                className="store-location-image"
                alt={store.city}
              />

              <div className="store-location-content">
                <h3 className="store-city-name">{store.city}</h3>

                <p className="store-address">
                  <i className="fa-solid fa-location-dot"></i> {store.address}
                </p>

                <p className="store-phone">
                  <i className="fa-solid fa-phone"></i> {store.phone}
                </p>

                <p className="store-time">
                  <i className="fa-regular fa-clock"></i> {store.time}
                </p>

                <p className="store-rating">{store.rating}</p>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    store.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-direction-btn"
                >
                  Get Direction
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Google Map */}
      <section className="store-map-section">
        <div className="store-section-heading">
          <h2 className="store-section-title">Find Us On Map</h2>
          <p className="store-section-subtitle">
            Locate your nearest Bidyut Furniture Store.
          </p>
        </div>

        <div className="store-map-box">
          <iframe
            src="https://maps.google.com/maps?q=Bankura,West+Bengal&t=&z=13&ie=UTF8&iwloc=&output=embed"
            loading="lazy"
            title="Store Map"
            style={{ width: '100%', height: '350px', border: 0 }}
          ></iframe>
        </div>
      </section>

      {/* Why Visit */}
      <section className="store-benefit-section">
        <div className="store-section-heading">
          <h2 className="store-section-title">Why Visit Our Store?</h2>
        </div>

        <div className="store-benefit-grid">
          <div className="store-benefit-card">
            <i className="fa-solid fa-couch"></i>
            <h3>Premium Furniture</h3>
          </div>

          <div className="store-benefit-card">
            <i className="fa-solid fa-user-tie"></i>
            <h3>Free Consultation</h3>
          </div>

          <div className="store-benefit-card">
            <i className="fa-solid fa-box-open"></i>
            <h3>5000+ Products</h3>
          </div>

          <div className="store-benefit-card">
            <i className="fa-solid fa-credit-card"></i>
            <h3>Easy EMI</h3>
          </div>

          <div className="store-benefit-card">
            <i className="fa-solid fa-truck-fast"></i>
            <h3>Free Delivery</h3>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="store-review-section">
        <div className="store-section-heading">
          <h2 className="store-section-title">Customer Reviews</h2>
        </div>

        <div className="store-review-card">
          <h3 className="store-review-stars">⭐⭐⭐⭐⭐</h3>
          <p className="store-review-text">
            Amazing quality furniture and excellent customer support. Highly recommended!
          </p>
          <span className="store-review-user"> - Happy Customer </span>
        </div>
      </section>

      {/* Contact */}
      <section className="store-contact-section">
        <h2 className="store-contact-title">Need Help?</h2>
        <p className="store-contact-text">
          Contact our support team or visit your nearest showroom.
        </p>
        <p style={{ marginTop: '10px', color: '#b97a57', fontWeight: 600 }}>
          <i className="fa-solid fa-phone"></i> +91 9732145124 |{' '}
          <i className="fa-solid fa-envelope"></i> support@bidyutfurniture.com
        </p>
      </section>
    </main>
  );
};

export default Store;
