import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

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
        }

        setIsLoginModalOpen(false);
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login error';
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await registerUser(name, email, password);
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

  const logout = () => {
    setUser(null);
    setToken(null);
    setAdminToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
  };

  const openLogin = () => {
    setAuthView('login');
    setIsLoginModalOpen(true);
  };

  const openSignup = () => {
    setAuthView('signup');
    setIsLoginModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        adminToken,
        setAdminToken,
        isLoginModalOpen,
        authView,
        setAuthView,
        login,
        register,
        logout,
        openLogin,
        openSignup,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
