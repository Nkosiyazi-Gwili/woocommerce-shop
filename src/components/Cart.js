'use client'

import { useCart } from '../contexts/CartContext';
import { useEffect } from 'react';

export default function Cart({ isOpen, onClose }) {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal,
    getCartItemsCount,
    clearCart
  } = useCart();

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.cart-sidebar') && !event.target.closest('.cart-toggle')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const proceedToCheckout = () => {
    if (process.env.NEXT_PUBLIC_WOOCOMMERCE_URL) {
      window.location.href = `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/checkout`;
    } else {
      alert('Checkout URL not configured. Please set NEXT_PUBLIC_WOOCOMMERCE_URL in your environment variables.');
    }
  };

  const handleQuantityUpdate = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  // Always show the cart toggle button, even when cart is closed
  const CartToggleButton = () => (
    <button
      onClick={() => onClose()} // This should toggle - if closed, open; if open, close
      className="cart-toggle fixed top-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center justify-center"
      type="button"
      aria-label="Open shopping cart"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21" />
      </svg>
      {getCartItemsCount() > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
          {getCartItemsCount()}
        </span>
      )}
    </button>
  );

  // If cart is not open, just show the toggle button
  if (!isOpen) {
    return <CartToggleButton />;
  }

  // Cart sidebar with higher z-index
  return (
    <>
      {/* Backdrop with high z-index */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Cart Sidebar with highest z-index */}
      <div className="cart-sidebar fixed right-0 top-0 h-full w-96 max-w-full bg-white shadow-2xl z-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {getCartItemsCount()} {getCartItemsCount() === 1 ? 'item' : 'items'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200"
                type="button"
                aria-label="Close cart"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21" />
                </svg>
                <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                <p className="text-gray-400 text-sm">Add some products to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                      <p className="text-green-600 font-bold text-lg">
                        ${parseFloat(item.price).toFixed(2)}
                      </p>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
                          type="button"
                          aria-label="Decrease quantity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <span className="font-medium text-gray-800 min-w-8 text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
                          type="button"
                          aria-label="Increase quantity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-4 text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="flex-shrink-0 border-t bg-white p-6 space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold text-gray-800">Subtotal:</span>
                <span className="font-bold text-gray-900">${getCartTotal().toFixed(2)}</span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={clearCart}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition-colors font-medium"
                  type="button"
                >
                  Clear Cart
                </button>
                <button
                  onClick={proceedToCheckout}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                  type="button"
                >
                  Checkout
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Shipping & taxes calculated at checkout
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Always show the toggle button */}
      <CartToggleButton />
    </>
  );
}