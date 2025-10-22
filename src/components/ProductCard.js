'use client'

import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const { addToCart, items } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('➕ Adding to cart:', product.name);
    
    setIsAdding(true);
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.src || '/placeholder-image.jpg',
      permalink: product.permalink,
    };
    
    console.log('🛒 Cart item data:', cartItem);
    
    addToCart(cartItem);
    
    console.log('✅ Added to cart, current items:', items);
    
    // Show success state briefly
    setTimeout(() => setIsAdding(false), 1000);
  };

  // Check if product is in cart
  const cartItem = items.find(item => item.id === product.id);
  const inCart = Boolean(cartItem);

  console.log('📦 Product card render:', product.name, 'in cart:', inCart);

  return (
    <div className="card hover:shadow-md transition-shadow group">
      <div className="relative mb-4">
        <img
          src={product.images?.[0]?.src || '/placeholder-image.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover rounded"
        />
        {inCart && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            In Cart ({cartItem.quantity})
          </div>
        )}
      </div>
      
      <h3 className="font-semibold text-lg mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
        {product.name}
      </h3>
      
      <div 
        className="text-gray-600 mb-3 text-sm line-clamp-2"
        dangerouslySetInnerHTML={{ __html: product.short_description || product.description || 'No description available' }}
      />
      
      <div className="flex justify-between items-center">
        <span className="text-xl font-bold text-green-600">
          ${parseFloat(product.price || 0).toFixed(2)}
        </span>
        
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`py-2 px-4 rounded font-medium transition-colors ${
            isAdding 
              ? 'bg-gray-400 cursor-not-allowed' 
              : inCart 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          type="button"
        >
          {isAdding ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </span>
          ) : inCart ? (
            `Add More (${cartItem.quantity})`
          ) : (
            'Add to Cart'
          )}
        </button>
      </div>
    </div>
  );
}