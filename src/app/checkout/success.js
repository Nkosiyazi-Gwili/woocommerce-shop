'use client'

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
        
        {orderId && (
          <p className="text-gray-600 mb-4">
            Your order number is: <strong>#{orderId}</strong>
          </p>
        )}
        
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. We have sent you an email with your order details.
          {orderId && ' You can track your order using the order number above.'}
        </p>
        
        <div className="space-y-3">
          <Link
            href="/shop"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors block"
          >
            Continue Shopping
          </Link>
          
          <Link
            href="/"
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}