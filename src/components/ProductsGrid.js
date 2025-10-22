'use client'

import { useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';

export default function ProductsGrid({ 
  products, 
  loading, 
  hasMore, 
  onLoadMore,
  totalProducts 
}) {
  const observerRef = useRef();
  const loadingRef = useRef();

  // Create a callback for the intersection observer
  const lastProductElementRef = useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log('🔄 Loading more products...');
        onLoadMore();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, onLoadMore]);

  if (products.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
          <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">No Products Found</h3>
          <p className="text-yellow-700">
            We couldn't find any products. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Results Count */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Collection</h2>
        <p className="text-gray-600">
          Showing {products.length} of {totalProducts} products
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => {
          // Attach the ref to the last product element
          if (products.length === index + 1) {
            return (
              <div key={product.id} ref={lastProductElementRef}>
                <ProductCard product={product} />
              </div>
            );
          } else {
            return <ProductCard key={product.id} product={product} />;
          }
        })}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading more products...</p>
          </div>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8 border-t mt-8">
          <p className="text-gray-500">You've seen all our products!</p>
        </div>
      )}
    </div>
  );
}