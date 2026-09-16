import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const heroImages = [
  '/img/hero/hero1.jpg',
  '/img/hero/hero2.webp',
  '/img/hero/hero3.jpg',
  '/img/hero/hero6.webp',
];

const pageLinks = ['/bedroom', '/living', '/dining', '/study'];

const categoryItemsData = [
  { name: 'SOFAS', img: '/img/sofa/sofa1.jpg', categories: ['living'], link: '/living' },
  { name: 'BEDS', img: '/img/bed/bed1.jpg', categories: ['bedroom'], link: '/bedroom' },
  { name: 'DINING', img: '/img/dining/dining1.jpg', categories: ['dining'], link: '/dining' },
  { name: 'TV UNITS', img: '/img/tv-unit/tv-unit1.jpg', categories: ['living', 'bedroom', 'decor'], link: '/living' },
  { name: 'COFFEE TABLES', img: '/img/table/table1.jpg', categories: ['dining', 'living'], link: '/living' },
  { name: 'CABINETS', img: '/img/almari/almari1.jpg', categories: ['decor', 'bedroom'], link: '/bedroom' },
  { name: 'WARDROBES', img: '/img/almari/almari2.jpg', categories: ['bedroom'], link: '/bedroom' },
  { name: 'SOFA CUM BED', img: '/img/sofa/sofa2.jpg', categories: ['living', 'bedroom'], link: '/living' },
  { name: 'BOOKSHELVES', img: '/img/bookshelf/bookshelf1.jpg', categories: ['decor', 'living', 'bedroom'], link: '/study' },
  { name: 'ALL STUDY TABLES', img: '/img/table/table2.jpg', categories: ['living'], link: '/study' },
  { name: 'KITCHEN CABINETS', img: '/img/kitchen/kitchen1.jpg', categories: ['dining'], link: '/dining' },
  { name: 'L SPACE SOFA', img: '/img/sofa/sofa1.jpg', categories: ['living'], link: '/living' },
  { name: 'SHOE RACKS', img: '/img/almari/almari1.jpg', categories: ['living', 'decor'], link: '/living' },
  { name: 'DRESSING TABLE', img: '/img/bedroom/dressing1.webp', categories: ['bedroom'], link: '/bedroom' },
  { name: 'BREAKFAST TABLE', img: '/img/dining/diningtable1.webp', categories: ['bedroom', 'dining'], link: '/dining' },
  { name: 'BEDSIDE TABLE', img: '/img/bedroom/bedside1.webp', categories: ['bedroom'], link: '/bedroom' },
  { name: 'QUEEN SIZE BED', img: '/img/bedroom/bed1.webp', categories: ['bedroom'], link: '/bedroom' },
  { name: 'KING SIZE BED', img: '/img/bed/bed2.jpg', categories: ['bedroom'], link: '/bedroom' },
  { name: '6 SEATER DINING', img: '/img/dining/diningtable1.webp', categories: ['dining'], link: '/dining' },
  { name: '4 SEATER DINING', img: '/img/dining/dining1.jpg', categories: ['dining'], link: '/dining' },
  { name: 'CROCKERY UNIT', img: '/img/dining/crockery1.webp', categories: ['dining'], link: '/dining' },
  { name: 'SERVING TRAYS', img: '/img/decor/wallart1.webp', categories: ['dining', 'decor'], link: '/decor' },
  { name: 'DINING TABLES', img: '/img/dining/dining2.jpg', categories: ['dining'], link: '/dining' },
  { name: 'BAR CABINET', img: '/img/dining/barunit1.webp', categories: ['dining'], link: '/dining' },
  { name: 'WALL SHELVES', img: '/img/decor/wallart1.webp', categories: ['decor'], link: '/decor' },
  { name: 'PHOTO FRAMES', img: '/img/decor/wallart1.webp', categories: ['decor'], link: '/decor' },
  { name: 'DECORATIVE VASES', img: '/img/decor/lighting1.webp', categories: ['decor'], link: '/decor' },
];

const bedSliderItems = [
  { name: 'Usualy Bed', price: '₹24,999', img: '/img/bed/bed1.jpg' },
  { name: 'Comfort Bed', price: '₹19,999', img: '/img/bed/bed2.jpg' },
  { name: 'Luxury Bed', price: '₹34,999', img: '/img/bed/bed3.jpg' },
  { name: 'Basic Bed', price: '₹14,999', img: '/img/bed/bed4.jpg' },
  { name: 'Premium Bed', price: '₹50,999', img: '/img/bed/bed5.jpg' },
  { name: 'Royal Bed', price: '₹45,999', img: '/img/bed/bed6.jpg' },
  { name: 'Classic Wooden Bed', price: '₹28,999', img: '/img/bed/bed1.jpg' },
  { name: 'Modern Platform Bed', price: '₹32,999', img: '/img/bed/bed2.jpg' },
];

const diningSliderItems = [
  { name: 'Wooden Dining Set', price: '₹44,999', img: '/img/dining/dining1.jpg' },
  { name: 'Modern Dining Table', price: '₹34,999', img: '/img/dining/dining2.jpg' },
  { name: 'Contemporary Dining', price: '₹54,999', img: '/img/dining/dining3.jpg' },
  { name: 'Classic Dining', price: '₹39,999', img: '/img/dining/dining4.jpg' },
  { name: 'Royal Dining Set', price: '₹49,999', img: '/img/dining/dining5.jpg' },
  { name: 'Compact Dining Table', price: '₹29,999', img: '/img/dining/dining6.jpg' },
];

const Home = () => {
  // Hero Slider
  const [slideIndex, setSlideIndex] = useState(0);

  // Bed & Dining Sliders
  const bedSliderRef = useRef(null);
  const diningSliderRef = useRef(null);

  // Filter
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleNextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % heroImages.length);
  };

  const scrollSlider = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 265; // card width approx + gap
      ref.current.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Filtered categories
  const filteredCategoryItems =
    activeFilter === 'all'
      ? categoryItemsData.slice(0, 12)
      : categoryItemsData
          .filter((item) => item.categories.includes(activeFilter))
          .slice(0, 12);

  return (
    <main className="main-content">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-banner">
          <div className="banner-left">
            <div className="slider">
              <div
                className="slides"
                style={{
                  transform: `translateX(-${slideIndex * 100}%)`,
                  transition: '0.6s ease-in-out',
                }}
              >
                {heroImages.map((src, idx) => (
                  <img key={idx} src={src} className="slide" alt={`Hero ${idx + 1}`} />
                ))}
              </div>

              <button className="prev" onClick={handlePrevSlide} type="button">
                &#10094;
              </button>
              <button className="next" onClick={handleNextSlide} type="button">
                &#10095;
              </button>
            </div>

            <div className="banner-content">
              <span className="tag">NEW ARRIVAL</span>
              <h1>
                STORE
                <br />
                IN STYLE
              </h1>
              <p>Luxury Wardrobe Collection</p>

              <div className="banner-bottom">
                <h3>Starting From </h3>
                <h2>₹16,999*</h2>
                <Link to={pageLinks[slideIndex % pageLinks.length]} className="hero-btn" id="heroBtn">
                  Explore Collection →
                </Link>
              </div>
            </div>
          </div>

          <div className="banner-right">
            <Link to="/living" className="right-card">
              <div className="right-card">
                <img src="/img/hero/hero5.webp" alt="Promo 1" />
              </div>
            </Link>
            <Link to="/dining" className="right-card">
              <div className="right-card">
                <img src="/img/hero/hero4.jpg" alt="Promo 2" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Room Categories Section */}
      <section className="room-categories-section">
        <div className="room-header">
          <h2 className="room-title">Crafted for Beautiful Living</h2>
          <p className="room-description">
            Bringing together elegant design, premium craftsmanship, and lasting quality to create
            furniture you'll love for years to come.{' '}
            <Link to="/living" className="more-link">
              Read More...
            </Link>
          </p>
        </div>

        <div className="room-carousel">
          <div className="room-items-container">
            <div className="room-item">
              <Link to="/living">
                <div className="room-image">
                  <img src="/img/living room/living room1.jpg" alt="Living Room" />
                </div>
                <h3 className="room-name">Living Room</h3>
              </Link>
            </div>

            <div className="room-item">
              <Link to="/bedroom">
                <div className="room-image">
                  <img src="/img/bedroom/bedroom1.jpg" alt="Bedroom" />
                </div>
                <h3 className="room-name">Bedroom</h3>
              </Link>
            </div>

            <div className="room-item">
              <Link to="/dining">
                <div className="room-image">
                  <img src="/img/dining room/dining room1.jpg" alt="Dining Room" />
                </div>
                <h3 className="room-name">Dining Room</h3>
              </Link>
            </div>

            <div className="room-item">
              <Link to="/study">
                <div className="room-image">
                  <img src="/img/study room/study room1.jpg" alt="Study Room" />
                </div>
                <h3 className="room-name">Study Room</h3>
              </Link>
            </div>

            <div className="room-item">
              <Link to="/outdoor">
                <div className="room-image">
                  <img src="/img/outdoor/outdoor1.jpg" alt="Outdoor" />
                </div>
                <h3 className="room-name">Outdoor</h3>
              </Link>
            </div>

            <div className="room-item">
              <Link to="/decor">
                <div className="room-image">
                  <img src="/img/decor/decor1.jpg" alt="Decor" />
                </div>
                <h3 className="room-name">Decor</h3>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bed Collections */}
      <section id="mattress" className="category-section">
        <h2 className="section-titles">Bed Collections</h2>
        <div className="product-slider">
          <button
            className="slide-btn prev-btn"
            onClick={() => scrollSlider(bedSliderRef, -1)}
            type="button"
          >
            &#10094;
          </button>
          <div className="products-wrapper" ref={bedSliderRef}>
            <Link to="/bedroom" className="view-all-link">
              <div className="products-grids">
                {bedSliderItems.map((bed, idx) => (
                  <div className="product-cards" key={idx}>
                    <img src={bed.img} alt={bed.name} />
                    <h4>{bed.name}</h4>
                    <p className="price">{bed.price}</p>
                  </div>
                ))}
              </div>
            </Link>
          </div>
          <button
            className="slide-btn next-btn"
            onClick={() => scrollSlider(bedSliderRef, 1)}
            type="button"
          >
            &#10095;
          </button>
        </div>
      </section>

      {/* Dining Collections */}
      <section id="dining" className="category-section">
        <h2 className="section-titles">Dining Collections</h2>
        <div className="product-slider">
          <button
            className="slide-btn prev-btn"
            onClick={() => scrollSlider(diningSliderRef, -1)}
            type="button"
          >
            &#10094;
          </button>
          <div className="products-wrapper" ref={diningSliderRef}>
            <Link to="/dining" className="view-all-link">
              <div className="products-grids">
                {diningSliderItems.map((din, idx) => (
                  <div className="product-cards" key={idx}>
                    <img src={din.img} alt={din.name} />
                    <h4>{din.name}</h4>
                    <p className="price">{din.price}</p>
                  </div>
                ))}
              </div>
            </Link>
          </div>
          <button
            className="slide-btn next-btn"
            onClick={() => scrollSlider(diningSliderRef, 1)}
            type="button"
          >
            &#10095;
          </button>
        </div>
      </section>

      {/* Product Categories Browse Section */}
      <section className="categories-browse-section">
        <div className="filter-buttons">
          {['all', 'living', 'bedroom', 'dining', 'decor'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
              data-filter={f}
              onClick={() => setActiveFilter(f)}
              type="button"
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="categories-grid">
          {filteredCategoryItems.map((item, idx) => (
            <div className="category-item" data-category={item.categories.join(',')} key={idx}>
              <Link to={item.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="category-image">
                  <img src={item.img} alt={item.name} />
                </div>
                <h3 className="category-name">{item.name}</h3>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Marquee */}
      <section className="brand-marquee">
        <div className="brand-track">
          <span>Bidyut Furniture</span>
          <span>||</span>
          <span>Premium Quality</span>
          <span>||</span>
          <span>Crafted for Beautiful Living</span>
          <span>||</span>
          <span>Since 2026</span>
          <span>||</span>
          <span>Luxury Furniture</span>
          <span>||</span>
          {/* Duplicate for infinite loop */}
          <span>Bidyut Furniture</span>
          <span>||</span>
          <span>Premium Quality</span>
          <span>||</span>
          <span>Crafted for Beautiful Living</span>
          <span>||</span>
          <span>Since 2026</span>
          <span>||</span>
          <span>Luxury Furniture</span>
          <span>||</span>
        </div>
      </section>
    </main>
  );
};

export default Home;
