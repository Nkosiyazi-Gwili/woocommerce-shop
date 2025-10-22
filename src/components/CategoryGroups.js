'use client'

import { useState } from 'react';
import ProductCard from './ProductCard';

export default function CategoryGroups({ products, categories }) {
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.categories?.[0] || { id: 0, name: 'Uncategorized' };
    if (!acc[category.id]) {
      acc[category.id] = {
        category: category,
        products: []
      };
    }
    acc[category.id].products.push(product);
    return acc;
  }, {});

  // Get category details
  const getCategoryDetails = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || { name: 'Uncategorized' };
  };

  return (
    <div className="space-y-6">
      {Object.entries(productsByCategory).map(([categoryId, { category, products }]) => {
        const isExpanded = expandedCategories.has(parseInt(categoryId));
        const categoryDetails = getCategoryDetails(category.id);

        return (
          <div key={categoryId} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Category Header */}
            <div 
              className="p-6 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {categoryDetails.name}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                    {products.length} products
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-600 transform transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {categoryDetails.description && (
                <p className="text-gray-600 mt-2">{categoryDetails.description}</p>
              )}
            </div>

            {/* Category Products */}
            {isExpanded && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}