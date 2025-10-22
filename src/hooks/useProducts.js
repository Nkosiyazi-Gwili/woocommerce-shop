'use client'

import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/woocommerce';

export function useProducts(page = 1) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const currentRequest = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (currentRequest.current) {
        currentRequest.current.cancel = true;
      }
      
      const requestId = {};
      currentRequest.current = requestId;

      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Loading products...');
        const response = await api.getProducts(page);
        
        if (currentRequest.current !== requestId) {
          return;
        }
        
        console.log('✅ Products loaded successfully');
        if (page === 1) {
          setProducts(response.products);
        } else {
          setProducts(prev => [...prev, ...response.products]);
        }
        
        setHasMore(page < response.totalPages);
        setTotalProducts(response.totalProducts);
      } catch (err) {
        if (currentRequest.current !== requestId) {
          return;
        }
        
        console.error('❌ Error loading products:', err.message);
        if (page === 1) {
          setError('Failed to load products. Please try again.');
          setProducts([]);
        }
      } finally {
        if (currentRequest.current === requestId) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      currentRequest.current = null;
    };
  }, [page]);

  return { products, loading, error, hasMore, totalProducts };
}