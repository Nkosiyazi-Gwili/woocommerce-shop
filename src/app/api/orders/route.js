// pages/api/products.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { page = 1, per_page = 12 } = req.query;
    
    const response = await fetch(
      `${process.env.WORDPRESS_SITE_URL}/wp-json/wc/v3/products?` + 
      new URLSearchParams({
        per_page,
        page,
        status: 'publish',
        consumer_key: process.env.WOOCOMMERCE_CONSUMER_KEY,
        consumer_secret: process.env.WOOCOMMERCE_CONSUMER_SECRET
      })
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();
    res.status(200).json(products);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}