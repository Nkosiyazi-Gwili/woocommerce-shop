import axios from 'axios';

const woocommerce = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wc/v3`,
  auth: {
    username: process.env.WOOCOMMERCE_CONSUMER_KEY,
    password: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  },
  timeout: 30000, // Increased to 30 seconds
});

export const api = {
  // Get ALL products (not just furniture)
  getProducts: async (page = 1) => {
    console.log('📦 Fetching all products...');
    
    const response = await woocommerce.get('/products', { 
      params: {
        per_page: 12,
        page: page,
        status: 'publish'
        // Removed category filter to get ALL products
      }
    });
    
    console.log('✅ Products API Success:', {
      productsCount: response.data.length,
      totalPages: response.headers['x-wp-totalpages'],
      totalProducts: response.headers['x-wp-total']
    });
    
    return {
      products: response.data,
      totalPages: parseInt(response.headers['x-wp-totalpages']) || 1,
      totalProducts: parseInt(response.headers['x-wp-total']) || 0
    };
  },
};

export default woocommerce;