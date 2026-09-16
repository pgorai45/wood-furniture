import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../assets/css/login.css';

const LoginModal = () => {
  const {
    isLoginModalOpen,
    closeAuthModal,
    authView,
    setAuthView,
    login,
    register,
  } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoginModalOpen) {
      document.body.style.overflow = 'hidden';
      setErrorMessage('');
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('login-overlay')) {
      closeAuthModal();
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!signupName || !signupEmail || !signupPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await register(signupName, signupEmail, signupPassword);
    setLoading(false);

    if (result.success) {
      alert('Account created successfully! Please log in.');
      setAuthView('login');
      setLoginEmail(signupEmail);
      setLoginPassword('');
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="login-overlay" id="loginOverlay" style={{ display: 'flex' }} onClick={handleOverlayClick}>
      <div className="login-popup">
        {/* Close Button */}
        <span className="login-close" id="closeLogin" onClick={closeAuthModal}>
          &times;
        </span>

        {/* Left */}
        <div className="login-left">
          <img src="/img/logo/logo1.png" alt="Logo" />
          <h3>Welcome Back!</h3>
          <p>
            Login to explore premium furniture, save your wishlist and manage your orders.
          </p>
        </div>

        {/* Right */}
        <div className="login-right">
          {errorMessage && (
            <div style={{ color: '#d9534f', marginBottom: '12px', fontSize: '13px', fontWeight: 500 }}>
              {errorMessage}
            </div>
          )}

          {authView === 'login' ? (
            <div id="loginForm">
              <h2>Login</h2>
              <form onSubmit={handleLoginSubmit}>
                <div className="input-box">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-box">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="login-options">
                  <label>
                    <input type="checkbox" /> Remember Me
                  </label>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Forgot Password?
                  </a>
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div className="login-divider">
                <span>OR</span>
              </div>

              <button
                type="button"
                className="google-btn"
                onClick={() => alert('Google authentication is not configured yet.')}
              >
                <i className="fa-brands fa-google"></i> Continue with Google
              </button>

              <p className="signup-text">
                New Customer?{' '}
                <a
                  href="#"
                  id="openSignup"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthView('signup');
                    setErrorMessage('');
                  }}
                >
                  Create Account
                </a>
              </p>
            </div>
          ) : (
            <div id="signupForm">
              <h2>Create Account</h2>
              <form onSubmit={handleSignupSubmit}>
                <div className="input-box">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-box">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-box">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Create password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="input-box">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>

              <p className="signup-text">
                Already have an account?{' '}
                <a
                  href="#"
                  id="openLogin"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthView('login');
                    setErrorMessage('');
                  }}
                >
                  Login
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
