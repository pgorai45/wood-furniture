import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const SEARCH_SUGGESTIONS = [
  'Sofa',
  'Living Room',
  'Bedroom',
  'Dining Table',
  'Wardrobe',
  'Study Table',
  'Coffee Table',
  'TV Unit',
  'Mattress',
  'Bookshelf',
];

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFixed, setIsFixed] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const navbarTopRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, openLogin } = useAuth();

  useEffect(() => {
    if (menuRef.current) {
      setMenuHeight(menuRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (navbarTopRef.current) {
        const topHeight = navbarTopRef.current.offsetHeight;
        if (window.scrollY >= topHeight && topHeight > 0) {
          setIsFixed(true);
        } else {
          setIsFixed(false);
        }
      }
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filtered = SEARCH_SUGGESTIONS.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleSuggestionClick = (item) => {
    setSearchTerm(item);
    setSuggestions([]);
  };

  const handleSearchClick = () => {
    const trimmed = searchTerm.toLowerCase().trim();
    if (!trimmed) {
      alert('Please enter a product name!');
      return;
    }

    const found = SEARCH_SUGGESTIONS.find(
      (p) => p.toLowerCase() === trimmed || p.toLowerCase().includes(trimmed)
    );

    if (found) {
      alert(`${found} found!`);
    } else {
      alert('No product found!');
    }
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/profile');
    } else {
      openLogin();
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-top" ref={navbarTopRef}>
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src="/img/logo/logo1.png" alt="Bidyut Furniture Logo" />
          <h2>Bidyut Furniture</h2>
        </Link>

        <div className="search-box">
          <input
            type="text"
            id="searchInput"
            placeholder="Search Products, Color & More ..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className="search-btn" onClick={handleSearchClick} type="button">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
          {suggestions.length > 0 && (
            <div className="search-results" id="searchResults" style={{ display: 'block' }}>
              {suggestions.map((item, idx) => (
                <div key={idx} onClick={() => handleSuggestionClick(item)}>
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="icons">
          <Link to="/store" className="icon-link">
            <span className="icon">
              <i className="fa-solid fa-store"></i>
            </span>
            <p>Stores</p>
          </Link>

          <a href="/profile" className="icon-link" id="profileBtn" onClick={handleProfileClick}>
            <span className="icon">
              <i className="fa-regular fa-user"></i>
            </span>
            <p>{user ? user.name.split(' ')[0] : 'Profile'}</p>
          </a>

          <Link to="/wishlist" className="icon-link">
            <span className="icon">
              <i className="fa-regular fa-heart"></i>
            </span>
            <p>
              Wishlist <span className="wishlist-badge">({wishlistCount})</span>
            </p>
          </Link>

          <Link to="/cart" className="icon-link">
            <span className="icon">
              <i className="fa-solid fa-cart-shopping"></i>
            </span>
            <p>
              Cart <span className="badges">({cartCount})</span>
            </p>
          </Link>
        </div>
      </div>

      {/* Category Navigation */}
      <div
        className="category-menu-wrapper"
        style={{ minHeight: isFixed && menuHeight ? `${menuHeight}px` : 'auto' }}
      >
        <nav ref={menuRef} className={`category-menu ${isFixed ? 'fixed' : ''}`}>
          <ul>
            <li>
              <Link to="/living">Sofa</Link>
            </li>
            <li>
              <Link to="/living">Living</Link>
            </li>
            <li>
              <Link to="/bedroom">Bedroom</Link>
            </li>
            <li>
              <Link to="/dining">Dining</Link>
            </li>
            <li>
              <Link to="/living">Storage</Link>
            </li>
            <li>
              <Link to="/study">Study & Office</Link>
            </li>
            <li>
              <Link to="/outdoor">Outdoor</Link>
            </li>
            <li>
              <Link to="/decor">Decor & Furnishing</Link>
            </li>
            <li>
              <Link to="/dining">Modular Kitchen & Wardrobe</Link>
            </li>
            <li>
              <Link to="/profile" className="luxury">
                WS Luxe
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
