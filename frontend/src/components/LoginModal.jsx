import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/css/login.css';

const LoginModal = () => {
  const navigate = useNavigate();
  const {
    isLoginModalOpen,
    closeAuthModal,
    authView,
    setAuthView,
    login,
    loginWithOtp,
    sendOtp,
    resendOtp,
    register,
    forgotPassword,
    resetPassword,
  } = useAuth();

  // Login states
  const [loginMode, setLoginMode] = useState('email'); // 'email' or 'mobile'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoginDemoMode, setIsLoginDemoMode] = useState(false);

  // Signup states
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupOtp, setSignupOtp] = useState('');
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupSendingOtp, setSignupSendingOtp] = useState(false);
  const [signupCountdown, setSignupCountdown] = useState(0);
  const [isSignupDemoMode, setIsSignupDemoMode] = useState(false);

  // Forgot / Reset Password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [demoResetLink, setDemoResetLink] = useState('');
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetConfirmPasswordVal, setResetConfirmPasswordVal] = useState('');
  const [isResetDemoMode, setIsResetDemoMode] = useState(false);

  // Status states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoginModalOpen) {
      document.body.style.overflow = 'hidden';
      setErrorMessage('');
      setSuccessMessage('');
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isLoginModalOpen]);

  // Resend OTP countdown timer (Login)
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Resend OTP countdown timer (Signup)
  useEffect(() => {
    let timer;
    if (signupCountdown > 0) {
      timer = setInterval(() => {
        setSignupCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [signupCountdown]);

  if (!isLoginModalOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('login-overlay')) {
      closeAuthModal();
    }
  };

  const validatePhone = (phoneStr) => {
    if (!phoneStr) return false;
    const digits = String(phoneStr).replace(/\D/g, '').slice(-10);
    return /^[6-9]\d{9}$/.test(digits);
  };

  // Normal Email + Password Login
  const handleEmailLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.message);
    } else {
      if (result.user && result.user.role === 'admin') {
        navigate('/admin');
      }
    }
  };

  // Send OTP handler (Login)
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validatePhone(loginPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    setSendingOtp(true);
    const res = await sendOtp(loginPhone, 'login');
    setSendingOtp(false);

    if (res.success) {
      setOtpSent(true);
      setCountdown(30);
      setIsLoginDemoMode(Boolean(res.isDemoMode));
      setSuccessMessage(res.message || `OTP sent successfully to +91 ${loginPhone.slice(-10)}`);
    } else {
      setErrorMessage(res.message || 'Failed to send OTP.');
    }
  };

  // Resend OTP handler (Login)
  const handleResendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (countdown > 0) return;

    setSendingOtp(true);
    const res = await resendOtp(loginPhone, 'login');
    setSendingOtp(false);

    if (res.success) {
      setCountdown(30);
      setIsLoginDemoMode(Boolean(res.isDemoMode));
      setSuccessMessage(res.message || `OTP resent successfully to +91 ${loginPhone.slice(-10)}`);
    } else {
      setErrorMessage(res.message || 'Failed to resend OTP.');
    }
  };

  // Change Number action (Login)
  const handleChangeNumber = () => {
    setOtpSent(false);
    setLoginOtp('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Verify OTP Login
  const handleOtpLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validatePhone(loginPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!loginOtp || loginOtp.trim().length < 4) {
      setErrorMessage('Please enter the 6-digit OTP received on your mobile.');
      return;
    }

    setLoading(true);
    const result = await loginWithOtp(loginPhone, loginOtp);
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.message);
    } else {
      if (result.user && result.user.role === 'admin') {
        navigate('/admin');
      }
    }
  };

  // Send OTP handler (Signup)
  const handleSendSignupOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!validatePhone(signupPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number for verification.');
      return;
    }

    setSignupSendingOtp(true);
    const res = await sendOtp(signupPhone, 'signup');
    setSignupSendingOtp(false);

    if (res.success) {
      setSignupOtpSent(true);
      setSignupCountdown(30);
      setIsSignupDemoMode(Boolean(res.isDemoMode));
      setSuccessMessage(res.message || `OTP sent successfully to +91 ${signupPhone.slice(-10)}`);
    } else {
      setErrorMessage(res.message || 'Failed to send OTP for registration.');
    }
  };

  // Resend OTP handler (Signup)
  const handleResendSignupOtp = async () => {
    if (signupCountdown > 0) return;
    setErrorMessage('');
    setSuccessMessage('');

    setSignupSendingOtp(true);
    const res = await resendOtp(signupPhone, 'signup');
    setSignupSendingOtp(false);

    if (res.success) {
      setSignupCountdown(30);
      setIsSignupDemoMode(Boolean(res.isDemoMode));
      setSuccessMessage(res.message || `OTP resent successfully to +91 ${signupPhone.slice(-10)}`);
    } else {
      setErrorMessage(res.message || 'Failed to resend OTP.');
    }
  };

  // Change Number action (Signup)
  const handleChangeSignupNumber = () => {
    setSignupOtpSent(false);
    setSignupOtp('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Registration Handler
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signupName || !signupEmail || !signupPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (signupPhone && !validatePhone(signupPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    // If mobile number is entered and OTP has not been requested yet, send OTP first
    if (signupPhone && !signupOtpSent) {
      await handleSendSignupOtp();
      return;
    }

    // If OTP was sent, validate OTP entry
    if (signupPhone && signupOtpSent && (!signupOtp || signupOtp.trim().length < 4)) {
      setErrorMessage('Please enter the 6-digit OTP code to verify your mobile number.');
      return;
    }

    setLoading(true);
    const result = await register(signupName, signupEmail, signupPassword, signupPhone, signupOtp);
    setLoading(false);

    if (result.success) {
      alert('Account created successfully! Please log in.');
      setAuthView('login');
      setLoginMode('email');
      setLoginEmail(signupEmail);
      setLoginPassword('');
      setSignupOtpSent(false);
      setSignupOtp('');
    } else {
      setErrorMessage(result.message);
    }
  };

  // Forgot Password Handler
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setDemoResetLink('');

    if (!forgotEmail || !forgotEmail.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(forgotEmail.trim());
      if (res && res.success) {
        if (res.resetToken) {
          setResetToken(res.resetToken);
          setDemoResetLink(res.resetLink || `http://localhost:5173/reset-password?token=${res.resetToken}`);
          setIsResetDemoMode(true);
          setSuccessMessage(res.message || 'Demo Reset Link Generated');
        } else {
          setSuccessMessage(res.message || 'Password reset link sent! Please check your email.');
        }
      } else {
        setErrorMessage(res?.message || 'No account found with this email.');
      }
    } catch (err) {
      console.error('Forgot password submission error:', err);
      setErrorMessage(err.message || 'An error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  // Reset Password Handler
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!resetPasswordVal || !resetConfirmPasswordVal) {
      setErrorMessage('Please enter and confirm your new password.');
      return;
    }

    if (resetPasswordVal.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (resetPasswordVal !== resetConfirmPasswordVal) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(resetToken, resetPasswordVal, resetConfirmPasswordVal);
      if (res && res.success) {
        alert('Password updated successfully! Please login with your new password.');
        setAuthView('login');
        setLoginMode('email');
        setLoginEmail(forgotEmail || '');
        setLoginPassword('');
        setResetPasswordVal('');
        setResetConfirmPasswordVal('');
        setResetToken('');
        setErrorMessage('');
        setSuccessMessage('Password updated successfully! Please login.');
      } else {
        setErrorMessage(res?.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('Reset password submission error:', err);
      setErrorMessage(err.message || 'An error occurred while resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay" id="loginOverlay" style={{ display: 'flex' }} onClick={handleOverlayClick}>
      <div className="login-popup">
        {/* Close Button */}
        <span className="login-close" id="closeLogin" onClick={closeAuthModal}>
          &times;
        </span>

        {/* Left Welcome Panel */}
        <div className="login-left">
          <img src="/img/logo/logo1.png" alt="Logo" />
          <h3>
            {authView === 'forgot-password' || authView === 'reset-password'
              ? 'Reset Password'
              : 'Welcome Back!'}
          </h3>
          <p>
            {authView === 'forgot-password' || authView === 'reset-password'
              ? 'Securely reset your password and regain access to your account.'
              : 'Login to explore premium furniture, save your wishlist and manage your orders.'}
          </p>
        </div>

        {/* Right Form Panel */}
        <div className="login-right">
          {errorMessage && (
            <div style={{ color: '#d9534f', marginBottom: '12px', fontSize: '13px', fontWeight: 500 }}>
              ⚠️ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div style={{ color: '#059669', marginBottom: '12px', fontSize: '13px', fontWeight: 500 }}>
              ✅ {successMessage}
            </div>
          )}

          {authView === 'login' ? (
            <div id="loginForm">
              <h2>Login</h2>

              {/* Seamless Method Toggle: Email vs Mobile OTP */}
              <div className="login-mode-tabs">
                <button
                  type="button"
                  className={`login-mode-tab ${loginMode === 'email' ? 'active' : ''}`}
                  onClick={() => {
                    setLoginMode('email');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                >
                  ✉️ Email Login
                </button>
                <button
                  type="button"
                  className={`login-mode-tab ${loginMode === 'mobile' ? 'active' : ''}`}
                  onClick={() => {
                    setLoginMode('mobile');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                >
                  📱 Mobile & OTP
                </button>
              </div>

              {loginMode === 'email' ? (
                /* ================= EMAIL + PASSWORD LOGIN (UNCHANGED) ================= */
                <form onSubmit={handleEmailLoginSubmit}>
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
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setAuthView('forgot-password');
                        setForgotEmail(loginEmail || '');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                    >
                      Forgot Password?
                    </a>
                  </div>

                  <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
              ) : (
                /* ================= MOBILE NUMBER + OTP LOGIN (DUAL MODE) ================= */
                <form onSubmit={otpSent ? handleOtpLoginSubmit : handleSendOtp}>
                  <div className="input-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ margin: 0 }}>Mobile Number</label>
                      {otpSent && (
                        <button
                          type="button"
                          onClick={handleChangeNumber}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#d4704c',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          ✏️ Change Number
                        </button>
                      )}
                    </div>
                    <div className="phone-input-group">
                      <span className="country-code-badge">🇮🇳 +91</span>
                      <input
                        type="tel"
                        className="phone-input-field"
                        placeholder="Enter mobile number"
                        value={loginPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setLoginPhone(val);
                        }}
                        maxLength={10}
                        disabled={otpSent}
                        required
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <div className="input-box">
                      <label>6-Digit OTP Code</label>
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        required
                        autoFocus
                      />

                      {/* Clear Development/Demo Mode Notice */}
                      {isLoginDemoMode && (
                        <div
                          style={{
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            color: '#92400e',
                            padding: '6px 10px',
                            borderRadius: '5px',
                            fontSize: '12px',
                            marginTop: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span>🛠️</span>
                          <span>
                            <strong>Development Mode:</strong> Use Demo OTP <strong>123456</strong>
                          </span>
                        </div>
                      )}

                      <div className="otp-meta-row" style={{ marginTop: '6px' }}>
                        <span>OTP sent to +91 {loginPhone.slice(-10)}</span>
                        {countdown > 0 ? (
                          <span style={{ color: '#9ca3af' }}>Resend in {countdown}s</span>
                        ) : (
                          <button type="button" onClick={handleResendOtp} disabled={sendingOtp}>
                            {sendingOtp ? 'Sending...' : 'Resend OTP'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {otpSent ? (
                    <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: '10px' }}>
                      {loading ? 'Verifying OTP...' : 'Verify & Login'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="login-btn"
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      style={{ marginTop: '10px' }}
                    >
                      {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  )}
                </form>
              )}

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
                    setSuccessMessage('');
                  }}
                >
                  Create Account
                </a>
              </p>
            </div>
          ) : authView === 'signup' ? (
            /* ================= CREATE ACCOUNT VIEW ================= */
            <div id="signupForm">
              <h2>Create Account</h2>
              <form onSubmit={handleSignupSubmit}>
                {/* 1. Full Name */}
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

                {/* 2. Email Address */}
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

                {/* 3. Mobile Number with +91 support */}
                <div className="input-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ margin: 0 }}>Mobile Number</label>
                    {signupOtpSent && (
                      <button
                        type="button"
                        onClick={handleChangeSignupNumber}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#d4704c',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        ✏️ Change Number
                      </button>
                    )}
                  </div>
                  <div className="phone-input-group">
                    <span className="country-code-badge">🇮🇳 +91</span>
                    <input
                      type="tel"
                      className="phone-input-field"
                      placeholder="Enter mobile number"
                      value={signupPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setSignupPhone(val);
                      }}
                      maxLength={10}
                      disabled={signupOtpSent}
                      required
                    />
                  </div>
                </div>

                {/* 4. OTP Verification Row for Signup (when OTP is sent) */}
                {signupOtpSent && (
                  <div className="input-box">
                    <label>6-Digit OTP Code</label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={signupOtp}
                      onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      required
                      autoFocus
                    />

                    {/* Development Mode Notice in Signup */}
                    {isSignupDemoMode && (
                      <div
                        style={{
                          background: '#fffbeb',
                          border: '1px solid #fde68a',
                          color: '#92400e',
                          padding: '6px 10px',
                          borderRadius: '5px',
                          fontSize: '12px',
                          marginTop: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>🛠️</span>
                        <span>
                          <strong>Development Mode:</strong> Use Demo OTP <strong>123456</strong>
                        </span>
                      </div>
                    )}

                    <div className="otp-meta-row" style={{ marginTop: '6px' }}>
                      <span>OTP sent to +91 {signupPhone.slice(-10)}</span>
                      {signupCountdown > 0 ? (
                        <span style={{ color: '#9ca3af' }}>Resend in {signupCountdown}s</span>
                      ) : (
                        <button type="button" onClick={handleResendSignupOtp} disabled={signupSendingOtp}>
                          {signupSendingOtp ? 'Sending...' : 'Resend OTP'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. Password */}
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

                {/* 6. Confirm Password */}
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

                <button type="submit" className="login-btn" disabled={loading || signupSendingOtp}>
                  {loading
                    ? 'Processing...'
                    : signupOtpSent
                    ? 'Verify OTP & Create Account'
                    : 'Verify Mobile & Create Account'}
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
                    setSuccessMessage('');
                  }}
                >
                  Login
                </a>
              </p>
            </div>
          ) : authView === 'forgot-password' ? (
            /* ================= FORGOT PASSWORD VIEW ================= */
            <div id="forgotPasswordForm">
              <h2>Forgot Password</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '18px' }}>
                Enter your registered email address and we'll help you reset your password.
              </p>
              <form onSubmit={handleForgotPasswordSubmit}>
                <div className="input-box">
                  <label>Registered Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: '10px' }}>
                  {loading ? 'Processing...' : 'Send Reset Link'}
                </button>
              </form>

              {/* Demo-Only Reset Link Box */}
              {demoResetLink && (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#92400e',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    marginTop: '16px',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span>🛠️</span>
                    <span>Demo Reset Link Generated</span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#78350f' }}>
                    Click below to open the Reset Password page:
                  </p>
                  <a
                    href={demoResetLink}
                    onClick={(e) => {
                      e.preventDefault();
                      closeAuthModal();
                      navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`);
                    }}
                    style={{
                      display: 'inline-block',
                      background: '#d4704c',
                      color: '#ffffff',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🔗 Reset Password
                  </a>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', wordBreak: 'break-all' }}>
                    <strong>Direct Link:</strong>{' '}
                    <a
                      href={demoResetLink}
                      onClick={(e) => {
                        e.preventDefault();
                        closeAuthModal();
                        navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`);
                      }}
                      style={{ color: '#d4704c', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {demoResetLink}
                    </a>
                  </div>
                </div>
              )}

              <p className="signup-text" style={{ marginTop: '20px' }}>
                Remembered your password?{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthView('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                >
                  Back to Login
                </a>
              </p>
            </div>
          ) : (
            /* ================= RESET PASSWORD VIEW ================= */
            <div id="resetPasswordForm">
              <h2>Create New Password</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>
                Enter a new secure password for <strong>{forgotEmail}</strong>.
              </p>

              {isResetDemoMode && (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#92400e',
                    padding: '8px 10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🛠️</span>
                  <span>
                    <strong>Development Mode:</strong> Token verified. Set your new password below.
                  </span>
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit}>
                <div className="input-box">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password (min. 6 chars)"
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="input-box">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={resetConfirmPasswordVal}
                    onChange={(e) => setResetConfirmPasswordVal(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: '10px' }}>
                  {loading ? 'Updating Password...' : 'Reset Password'}
                </button>
              </form>

              <p className="signup-text" style={{ marginTop: '20px' }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthView('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                >
                  Cancel & Return to Login
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
