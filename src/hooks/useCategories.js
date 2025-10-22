'use client'

import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/woocommerce';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use ref to track the current request
  const currentRequest = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const requestId = {};
      currentRequest.current = requestId;

      try {
        setLoading(true);
        console.log('🔄 Fetching categories...');
        
        const categoriesData = await api.getCategories({
          per_page: 50,
          hide_empty: true
        });
        
        // Check if this request is still valid
        if (currentRequest.current !== requestId) {
          return;
        }
        
        console.log('✅ Categories fetched successfully');
        setCategories(categoriesData);
      } catch (err) {
        // Check if this request is still valid
        if (currentRequest.current !== requestId) {
          return;
        }
        
        console.error('❌ Error fetching categories:', err.message);
        setError('Failed to load categories.');
        setCategories([]);
      } finally {
        // Check if this request is still valid
        if (currentRequest.current === requestId) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    // Cleanup function
    return () => {
      currentRequest.current = null;
    };
  }, []);

  return { categories, loading, error };
}