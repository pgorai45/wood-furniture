import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getUserProfile, sendOtpApi, resendOtpApi, verifyOtpApi, forgotPasswordApi, resetPasswordApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('userToken') || null);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken') || null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return !savedUser;
    } catch {
      return true;
    }
  });
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'

  // Refresh user profile from backend
  const refreshUserProfile = useCallback(async () => {
    const currentToken = token || localStorage.getItem('userToken');
    if (!currentToken) return;

    try {
      const data = await getUserProfile(currentToken);
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') {
          localStorage.setItem('adminUser', JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.warn('Profile refresh notice:', err.message);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshUserProfile();
    }
  }, [token, refreshUserProfile]);

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userToken', data.token);

        if (data.user && data.user.role === 'admin') {
          setAdminToken(data.token);
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
        } else {
          setAdminToken(null);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }

        setIsLoginModalOpen(false);
        return { success: true, message: data.message, user: data.user, token: data.token };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login error';
      return { success: false, message: msg };
    }
  };

  const loginWithOtp = async (phone, otp) => {
    try {
      const data = await verifyOtpApi(phone, otp);
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userToken', data.token);

        if (data.user && data.user.role === 'admin') {
          setAdminToken(data.token);
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
        } else {
          setAdminToken(null);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }

        setIsLoginModalOpen(false);
        return { success: true, message: data.message, user: data.user, token: data.token };
      } else {
        return { success: false, message: data.message || 'OTP verification failed' };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'OTP verification error';
      return { success: false, message: msg };
    }
  };

  const sendOtp = async (phone, purpose = 'login') => {
    try {
      const data = await sendOtpApi(phone, purpose);
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send OTP';
      return { success: false, message: msg };
    }
  };

  const resendOtp = async (phone, purpose = 'login') => {
    try {
      const data = await resendOtpApi(phone, purpose);
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to resend OTP';
      return { success: false, message: msg };
    }
  };

  const verifyOtp = async (phone, otp, purpose = 'login') => {
    try {
      const data = await verifyOtpApi(phone, otp, purpose);
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to verify OTP';
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password, phone, otp = null) => {
    try {
      const data = await registerUser(name, email, password, phone, otp);
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration error';
      return { success: false, message: msg };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const data = await forgotPasswordApi(email);
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to process forgot password request';
      return { success: false, message: msg };
    }
  };

  const resetPassword = async (resetToken, newPassword, confirmPassword) => {
    try {
      const data = await resetPasswordApi(resetToken, newPassword, confirmPassword);
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reset password';
      return { success: false, message: msg };
    }
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    if (updatedUser?.role === 'admin') {
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAdminToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const openLogin = () => {
    setAuthView('login');
    setIsLoginModalOpen(true);
  };

  const openSignup = () => {
    setAuthView('signup');
    setIsLoginModalOpen(true);
  };

  const openForgotPassword = () => {
    setAuthView('forgot-password');
    setIsLoginModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: updateUserState,
        token,
        adminToken,
        setAdminToken,
        isLoginModalOpen,
        authView,
        setAuthView,
        login,
        loginWithOtp,
        sendOtp,
        resendOtp,
        verifyOtp,
        register,
        forgotPassword,
        resetPassword,
        logout,
        refreshUserProfile,
        openLogin,
        openSignup,
        openForgotPassword,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
