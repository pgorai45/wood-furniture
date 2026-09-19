import React, { createContext, useContext, useState, useEffect } from 'react';
import { addToCartApi } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, showFeedback = true) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: (updated[existingIndex].qty || 1) + quantity,
        };
        return updated;
      } else {
        return [...prevCart, { ...product, qty: quantity }];
      }
    });

    // Sync with backend if user is authenticated
    try {
      const userToken = localStorage.getItem('userToken');
      const savedUser = localStorage.getItem('user');
      if (userToken && savedUser) {
        const userObj = JSON.parse(savedUser);
        addToCartApi(userObj.id, product.id, quantity).catch(() => {});
      }
    } catch {}

    if (showFeedback) {
      alert(`${product.name} added to cart`);
    }
  };

  const increaseQty = (index) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          qty: (updated[index].qty || 1) + 1,
        };
      }
      return updated;
    });
  };

  const decreaseQty = (index) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      if (updated[index]) {
        if (updated[index].qty > 1) {
          updated[index] = {
            ...updated[index],
            qty: updated[index].qty - 1,
          };
        } else {
          updated.splice(index, 1);
        }
      }
      return updated;
    });
  };

  const removeItem = (index) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      updated.splice(index, 1);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Calculations
  const cartCount = cart.reduce((total, item) => total + (item.qty || 1), 0);
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * (item.qty || 1), 0);
  const discount = subtotal >= 50000 ? Math.round(subtotal * 0.1) : 0;
  const tax = Math.round((subtotal - discount) * 0.18);
  const grandTotal = subtotal - discount + tax;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeItem,
        clearCart,
        cartCount,
        subtotal,
        discount,
        tax,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
