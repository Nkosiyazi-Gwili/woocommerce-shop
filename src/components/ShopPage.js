'use client'

import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../contexts/CartContext';
import { useRouter } from 'next/navigation';
import ProductsGrid from './ProductsGrid';


export default function ShopPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { products, loading, error, hasMore, totalProducts } = useProducts(page);
  const { items, getCartTotal, getCartItemsCount, removeFromCart, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const openCart = () => {
    setIsCartOpen(true);
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeCart = () => {
    setIsCartOpen(false);
    // Re-enable body scroll when modal is closed
    document.body.style.overflow = 'unset';
  };

  const proceedToCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty. Add some items before checkout.');
      return;
    }
    closeCart();
    router.push('/checkout');
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isCartOpen ? 'overflow-hidden' : ''}`}>
      {/* Main content - completely hidden when modal is open */}
      <div className={`container mx-auto px-4 py-8 transition-all duration-300 ${
            isCartOpen ? 'invisible' : 'visible'
          }`}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">All Products</h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Discover our complete collection of quality products
            </p>
          </div>
          
          {/* Cart Button - Shows item count */}
          <button 
            onClick={openCart}
            className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg px-6 py-3 transition-all duration-200 flex items-center gap-3 cursor-pointer hover:shadow-xl transform hover:scale-105"
          >
            <div className="relative">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">View Cart</div>
              <div className="text-xs opacity-90">
                {items.length > 0 ? `${getCartItemsCount()} items` : 'Empty'}
              </div>
            </div>
          </button>
        </div>

        {/* Loading State */}
        {loading && products.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading products...</p>
              <p className="text-gray-500 text-sm mt-2">Please wait while we fetch our products</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading || products.length > 0 ? (
          <ProductsGrid
            products={products}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            totalProducts={totalProducts}
          />
        ) : null}

        {/* Empty State */}
        {!loading && products.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Available</h3>
              <p className="text-gray-600 mb-4">
                We're currently updating our product collection. Please check back soon!
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {isCartOpen && (
        <>
          {/* Solid Black Overlay */}
          <div
            className="fixed inset-0 bg-black z-[100]"
            onClick={closeCart}
          />

          {/* Slide-up Modal */}
          <div className="fixed inset-0 z-[101] flex items-end justify-center p-4 sm:items-center">
            {/* Modal with 82% width using proper Tailwind class */}
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-[82%] max-h-[90vh] overflow-hidden transform transition-all duration-500 ease-out translate-y-full animate-slideUp mx-auto" style={{ width: '82%' }}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Your Shopping Cart</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {items.length} item{items.length !== 1 ? 's' : ''} in your cart
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="p-3 hover:bg-white rounded-full transition-colors duration-200 shadow-sm hover:shadow-md border border-gray-200"
                >
                  X
                </button>
              </div>

              {/* Cart Content */}
              <div className="overflow-y-auto max-h-96">
                {items.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21" />
                    </svg>
                    <h3 className="text-2xl font-semibold text-gray-600 mb-3">Your cart is empty</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      Looks like you haven't added any items to your cart yet.
                    </p>
                    <button
                      onClick={closeCart}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-contain"
                              />
                            ) : (
                              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 text-lg mb-1">{item.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Qty: {item.quantity}</span>
                              <span>•</span>
                              <span>${parseFloat(item.price).toFixed(2)} each</span>
                            </div>
                            <p className="text-lg font-bold text-blue-600 mt-1">
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300 bg-white bg-opacity-95"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="text-sm font-medium">Remove</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-blue-50">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                      <span>Total Amount:</span>
                      <span className="text-2xl text-blue-600">${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                      <button
                        onClick={proceedToCheckout}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Proceed to Checkout
                      </button>

                      <button
                        onClick={clearCart}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors duration-200 border border-gray-300 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear Cart
                      </button>

                      <button
                        onClick={closeCart}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}