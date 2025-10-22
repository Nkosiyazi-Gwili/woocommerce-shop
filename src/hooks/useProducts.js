import { useState, useEffect } from 'react';

export function useProducts(page = 1) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/products?page=${page}&per_page=12`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }
        
        const productsData = await response.json();
        
        setProducts(prevProducts => 
          page === 1 ? productsData : [...prevProducts, ...productsData]
        );
        
        // Check if there are more products (assuming 12 per page)
        setHasMore(productsData.length === 12);
        setTotalProducts(prev => page === 1 ? productsData.length : prev + productsData.length);
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  return { products, loading, error, hasMore, totalProducts };
}