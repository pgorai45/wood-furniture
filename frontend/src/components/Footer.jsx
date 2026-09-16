import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/footer.css';

const Footer = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* Download App Section */}
      <div className="footer-app">
        <div className="app-content">
          <h2>Download Our App</h2>
          <p>
            Shop premium furniture anytime, anywhere with the Bidyut Furniture App.
          </p>
        </div>

        <div className="app-buttons">
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="app-btn"
          >
            <img src="/img/footer/footer1.png" alt="Google Play" />
          </a>

          <a
            href="https://www.apple.com/app-store/"
            target="_blank"
            rel="noopener noreferrer"
            className="app-btn"
          >
            <img src="/img/footer/footer2.png" alt="App Store" />
          </a>
        </div>
      </div>

      <hr />

      {/* Main Footer */}
      <div className="footer-main">
        {/* About */}
        <div className="footer-column">
          <h3>ABOUT US</h3>
          <ul>
            <li><Link to="/">About Us</Link></li>
            <li><Link to="/">Our Story</Link></li>
            <li><Link to="/store">Our Stores</Link></li>
            <li><Link to="/">Blog</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div className="footer-column">
          <h3>HELP</h3>
          <ul>
            <li><Link to="/">Contact Us</Link></li>
            <li><Link to="/">FAQ</Link></li>
            <li><Link to="/cart">Track Order</Link></li>
            <li><Link to="/">Support Center</Link></li>
          </ul>
        </div>

        {/* Partners */}
        <div className="footer-column">
          <h3>PARTNERS</h3>
          <ul>
            <li><Link to="/">Become a Franchise</Link></li>
            <li><Link to="/">Sell With Us</Link></li>
            <li><Link to="/">Business Enquiry</Link></li>
            <li><Link to="/">Affiliate Program</Link></li>
          </ul>
        </div>

        {/* Info */}
        <div className="footer-column">
          <h3>INFO</h3>
          <ul>
            <li><Link to="/">Privacy Policy</Link></li>
            <li><Link to="/">Terms & Conditions</Link></li>
            <li><Link to="/">Return Policy</Link></li>
            <li><Link to="/">Shipping Policy</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-column">
          <h3>BIDYUT FURNITURE</h3>
          <p>
            <i className="fa-solid fa-location-dot"></i>
            Bankura, West Bengal, India
          </p>
          <p>
            <i className="fa-solid fa-phone"></i>
            +91 9732145124
          </p>
          <p>
            <i className="fa-solid fa-envelope"></i>
            support@bidyutfurniture.com
          </p>

          <div className="footer-social">
            <a href="https://www.facebook.com/share/1Fm35a9CLr/" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://www.instagram.com/work_shop21?igsh=MTVzZTFwMTMwY2Iydw==" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-x-twitter"></i>
            </a>
            <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-youtube"></i>
            </a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </div>

      <hr />

      {/* Bottom */}
      <div className="footer-bottom">
        <p>
          © <span id="year">{currentYear}</span> <strong>Bidyut Furniture</strong>. All Rights Reserved.
        </p>
      </div>

      {/* Top Button */}
      <a
        href="#"
        className={`backToTop ${showBackToTop ? 'show' : ''}`}
        onClick={scrollToTop}
      >
        TOP
      </a>
    </footer>
  );
};

export default Footer;
