import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';

import Home from './pages/Home';
import Bedroom from './pages/Bedroom';
import Living from './pages/Living';
import Dining from './pages/Dining';
import Study from './pages/Study';
import Outdoor from './pages/Outdoor';
import Decor from './pages/Decor';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Store from './pages/Store';
import ResetPassword from './pages/ResetPassword';

// Admin Panel Modular imports
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Products from './admin/pages/Products';
import AddProduct from './admin/pages/AddProduct';
import EditProduct from './admin/pages/EditProduct';
import Orders from './admin/pages/Orders';
import Users from './admin/pages/Users';
import Inventory from './admin/pages/Inventory';
import AdminProfile from './admin/pages/AdminProfile';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bedroom" element={<Bedroom />} />
        <Route path="/living" element={<Living />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/study" element={<Study />} />
        <Route path="/outdoor" element={<Outdoor />} />
        <Route path="/decor" element={<Decor />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/store" element={<Store />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Modular Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="*" element={<Home />} />
      </Routes>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <LoginModal />}
    </>
  );
}

export default App;
