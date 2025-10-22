// src/app/api/products/route.js
export async function GET(request) {
  // Set CORS headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 1;
    const per_page = searchParams.get('per_page') || 12;

    // Use your actual environment variable names
    const wordpressUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || process.env.WORDPRESS_SITE_URL;
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    console.log('Env check:', { 
      hasWordPressUrl: !!wordpressUrl,
      hasConsumerKey: !!consumerKey,
      hasConsumerSecret: !!consumerSecret,
      wordpressUrl: wordpressUrl
    });

    // Validate environment variables
    if (!wordpressUrl || !consumerKey || !consumerSecret) {
      throw new Error(`Missing environment variables: 
        WordPress URL: ${!!wordpressUrl}
        Consumer Key: ${!!consumerKey}
        Consumer Secret: ${!!consumerSecret}
      `);
    }

    // Build the WooCommerce API URL
    const apiUrl = new URL(`${wordpressUrl}/wp-json/wc/v3/products`);
    
    // Add query parameters
    apiUrl.searchParams.append('per_page', per_page);
    apiUrl.searchParams.append('page', page);
    apiUrl.searchParams.append('status', 'publish');
    
    // Add authentication via query parameters
    apiUrl.searchParams.append('consumer_key', consumerKey);
    apiUrl.searchParams.append('consumer_secret', consumerSecret);

    console.log('Fetching from:', apiUrl.toString());

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`WooCommerce API error: ${response.status} - ${errorData}`);
    }

    const products = await response.json();
    
    // Return the products
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(headers),
      },
    });
    
  } catch (error) {
    console.error('API Route Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch products',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(headers),
      },
    });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return new Response(null, { status: 200, headers });
}