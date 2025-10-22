import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const orderData = await request.json();
    
    const woocommerceUrl = `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wc/v3/orders`;
    
    console.log('🛒 Creating WooCommerce order:', orderData);

    const response = await fetch(woocommerceUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
        ).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ WooCommerce API error:', errorText);
      throw new Error(`WooCommerce API error: ${response.status}`);
    }

    const order = await response.json();
    console.log('✅ Order created successfully:', order.id);

    return NextResponse.json(order);
    
  } catch (error) {
    console.error('❌ Order creation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}