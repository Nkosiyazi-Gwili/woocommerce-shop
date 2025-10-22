'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  console.log('🛒 Cart reducer action:', action);
  
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(
        item => item.id === action.payload.id
      );
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        console.log('🛒 Updated existing item, new items:', updatedItems);
        return {
          ...state,
          items: updatedItems,
        };
      }
      
      const newItems = [...state.items, { ...action.payload, quantity: 1 }];
      console.log('🛒 Added new item, new items:', newItems);
      return {
        ...state,
        items: newItems,
      };
    
    case 'REMOVE_FROM_CART':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      console.log('🛒 Removed item, new items:', filteredItems);
      return {
        ...state,
        items: filteredItems,
      };
    
    case 'UPDATE_QUANTITY':
      const updatedQuantityItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      console.log('🛒 Updated quantity, new items:', updatedQuantityItems);
      return {
        ...state,
        items: updatedQuantityItems,
      };
    
    case 'CLEAR_CART':
      console.log('🛒 Cleared cart');
      return {
        ...state,
        items: [],
      };
    
    case 'SET_CART':
      console.log('🛒 Set cart from storage:', action.payload);
      return {
        ...state,
        items: action.payload,
      };
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('woocommerce-cart');
      console.log('🛒 Loading cart from localStorage:', savedCart);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          dispatch({ type: 'SET_CART', payload: parsedCart });
        } catch (error) {
          console.error('🛒 Error parsing cart from localStorage:', error);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🛒 Saving cart to localStorage:', state.items);
      localStorage.setItem('woocommerce-cart', JSON.stringify(state.items));
    }
  }, [state.items]);

  const addToCart = (product) => {
    console.log('🛒 Dispatching ADD_TO_CART:', product);
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    console.log('🛒 Dispatching REMOVE_FROM_CART:', productId);
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    console.log('🛒 Dispatching UPDATE_QUANTITY:', productId, quantity);
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    }
  };

  const clearCart = () => {
    console.log('🛒 Dispatching CLEAR_CART');
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    const total = state.items.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
    console.log('🛒 Calculating cart total:', total);
    return total;
  };

  const getCartItemsCount = () => {
    const count = state.items.reduce((total, item) => total + item.quantity, 0);
    console.log('🛒 Calculating cart items count:', count);
    return count;
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};