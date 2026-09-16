import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart } from './CartContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { addToCart } = useCart();

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      alert('Already in Wishlist');
      return;
    }

    setWishlist((prev) => [...prev, product]);
    alert(`${product.name} added to Wishlist`);
  };

  const removeWishlist = (index) => {
    setWishlist((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const moveToCart = (index) => {
    const product = wishlist[index];
    if (!product) return;

    addToCart(product, 1, false);
    removeWishlist(index);
    alert(`${product.name} moved to Cart`);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeWishlist,
        moveToCart,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
