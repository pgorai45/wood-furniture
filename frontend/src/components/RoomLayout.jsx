import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { getProducts } from '../services/api';

const RoomLayout = ({
  categoryName,
  bannerTitle,
  bannerDesc,
  gridId = 'productGrid',
  filterOptions = [],
  categoryKeys = [],
  defaultProducts = [],
}) => {
  const [products, setProducts] = useState(defaultProducts);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRoomProducts = async () => {
      try {
        const data = await getProducts();
        if (data && data.success && Array.isArray(data.products)) {
          // Filter by category keys for this room
          const roomProducts = data.products.filter((p) =>
            categoryKeys.length === 0 || categoryKeys.includes(p.category)
          );

          if (isMounted) {
            if (roomProducts.length > 0) {
              setProducts(roomProducts);
            } else if (defaultProducts.length > 0) {
              setProducts(defaultProducts);
            }
          }
        }
      } catch (err) {
        console.warn('Backend unavailable, using fallback data:', err);
        if (isMounted && defaultProducts.length > 0) {
          setProducts(defaultProducts);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRoomProducts();
    return () => {
      isMounted = false;
    };
  }, [categoryKeys.join(','), defaultProducts]);

  // Apply Filter
  const filteredProducts = products.filter((product) => {
    if (activeFilter === 'all') return true;
    return product.category === activeFilter;
  });

  // Apply Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'low') return Number(a.price) - Number(b.price);
    if (sortOption === 'high') return Number(b.price) - Number(a.price);
    if (sortOption === 'popular') return Number(b.reviews || 0) - Number(a.reviews || 0);
    if (sortOption === 'newest') return Number(b.id || 0) - Number(a.id || 0);
    return 0;
  });

  return (
    <main>
      {/* Breadcrumb */}
      <section className="breadcrumb">
        <div className="breadcrumb-container">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{categoryName}</span>
        </div>
      </section>

      {/* Banner */}
      <section className="room-banner">
        <div className="room-banner-content">
          <h1>{bannerTitle}</h1>
          <p>{bannerDesc}</p>
          <a href={`#${gridId}`} className="shop-btn">
            Shop Now
          </a>
        </div>
      </section>

      {/* Collection Top */}
      <section className="collection-top">
        <div className="collection-info">
          <h2>Explore {categoryName} Collection</h2>
          <p>Choose premium {categoryName.toLowerCase()} furniture for every home.</p>
        </div>

        <div className="collection-sort">
          <select
            id="sortSelect"
            className="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="default">Sort By</option>
            <option value="popular">Popularity</option>
            <option value="newest">Newest</option>
            <option value="low">Price : Low to High</option>
            <option value="high">Price : High to Low</option>
          </select>
        </div>
      </section>

      {/* Filter */}
      {filterOptions.length > 0 && (
        <section className="filter-section">
          <div className="filter-buttons">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                className={`filter-btn ${activeFilter === opt.value ? 'active' : ''}`}
                data-filter={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                type="button"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section className="products-section">
        <div className="product-grid" id={gridId}>
          {sortedProducts.length > 0 ? (
            sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px' }}>
              No products available in this category.
            </p>
          )}
        </div>
      </section>

      {/* Why Choose */}
      <section className="why-choose">
        <div className="section-heading">
          <h2>Why Choose Bidyut Furniture?</h2>
          <p>Premium furniture with trusted quality.</p>
        </div>

        <div className="why-grid">
          <div className="why-box">
            <i className="fa-solid fa-truck-fast"></i>
            <h3>Fast Delivery</h3>
            <p>Quick doorstep delivery.</p>
          </div>

          <div className="why-box">
            <i className="fa-solid fa-shield-halved"></i>
            <h3>Warranty</h3>
            <p>Premium quality guarantee.</p>
          </div>

          <div className="why-box">
            <i className="fa-solid fa-credit-card"></i>
            <h3>Easy Payment</h3>
            <p>Secure payment methods.</p>
          </div>

          <div className="why-box">
            <i className="fa-solid fa-headset"></i>
            <h3>24/7 Support</h3>
            <p>Always ready to help.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="section-heading">
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="faq-container">
          <div className="faq-card">
            <h3>Do you provide installation?</h3>
            <p>Yes, installation is available on selected products.</p>
          </div>

          <div className="faq-card">
            <h3>Cash On Delivery Available?</h3>
            <p>Yes, in selected locations.</p>
          </div>

          <div className="faq-card">
            <h3>Can I return my order?</h3>
            <p>According to our return policy.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RoomLayout;
