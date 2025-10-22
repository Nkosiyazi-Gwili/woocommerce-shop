'use client'

import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, getCartItemsCount, clearCart, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({
    // Billing Information
    billing_first_name: '',
    billing_last_name: '',
    billing_email: '',
    billing_phone: '',
    billing_address_1: '',
    billing_address_2: '',
    billing_city: '',
    billing_state: '',
    billing_postcode: '',
    billing_country: 'ZA',
    
    // Shipping Information
    shipping_first_name: '',
    shipping_last_name: '',
    shipping_address_1: '',
    shipping_address_2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postcode: '',
    shipping_country: 'ZA',
    
    // Order Notes
    customer_note: ''
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);

  // Update shipping address when sameAsBilling changes
  const handleSameAsBillingChange = (checked) => {
    setSameAsBilling(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        shipping_first_name: prev.billing_first_name,
        shipping_last_name: prev.billing_last_name,
        shipping_address_1: prev.billing_address_1,
        shipping_address_2: prev.billing_address_2,
        shipping_city: prev.billing_city,
        shipping_state: prev.billing_state,
        shipping_postcode: prev.billing_postcode,
        shipping_country: prev.billing_country,
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If same as billing is checked, update shipping fields
    if (sameAsBilling && name.startsWith('billing_')) {
      const shippingField = name.replace('billing_', 'shipping_');
      setFormData(prev => ({
        ...prev,
        [shippingField]: value
      }));
    }
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const validateForm = () => {
    const requiredFields = [
      'billing_first_name',
      'billing_last_name',
      'billing_email',
      'billing_phone',
      'billing_address_1',
      'billing_city',
      'billing_postcode',
      'billing_country'
    ];

    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        alert(`Please fill in all required fields. Missing: ${field.replace('billing_', '').replace('_', ' ')}`);
        return false;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.billing_email)) {
      alert('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      alert('Your cart is empty. Please add some items before checkout.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        payment_method: paymentMethod === 'cod' ? 'cod' : 'bacs',
        payment_method_title: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Direct Bank Transfer',
        set_paid: false,
        status: "pending",
        customer_id: 0,
        
        // Line items from cart
        line_items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price
        })),
        
        // Billing information
        billing: {
          first_name: formData.billing_first_name,
          last_name: formData.billing_last_name,
          address_1: formData.billing_address_1,
          address_2: formData.billing_address_2 || '',
          city: formData.billing_city,
          state: formData.billing_state || '',
          postcode: formData.billing_postcode,
          country: formData.billing_country,
          email: formData.billing_email,
          phone: formData.billing_phone
        },
        
        // Shipping information
        shipping: {
          first_name: sameAsBilling ? formData.billing_first_name : formData.shipping_first_name,
          last_name: sameAsBilling ? formData.billing_last_name : formData.shipping_last_name,
          address_1: sameAsBilling ? formData.billing_address_1 : formData.shipping_address_1,
          address_2: sameAsBilling ? (formData.billing_address_2 || '') : (formData.shipping_address_2 || ''),
          city: sameAsBilling ? formData.billing_city : formData.shipping_city,
          state: sameAsBilling ? (formData.billing_state || '') : (formData.shipping_state || ''),
          postcode: sameAsBilling ? formData.billing_postcode : formData.shipping_postcode,
          country: sameAsBilling ? formData.billing_country : formData.shipping_country
        },
        
        // Customer note
        customer_note: formData.customer_note || ''
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const order = await response.json();
      
      // Clear cart and redirect to success page
      clearCart();
      router.push(`/checkout/success?order_id=${order.id}`);
      
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
          <button
            onClick={() => router.push('/shop')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center">Checkout</h1>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Billing Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Billing Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="billing_first_name"
                      value={formData.billing_first_name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="billing_last_name"
                      value={formData.billing_last_name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="billing_email"
                      value={formData.billing_email}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="billing_phone"
                      value={formData.billing_phone}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="billing_address_1"
                      value={formData.billing_address_1}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="billing_address_2"
                      value={formData.billing_address_2}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="billing_city"
                      value={formData.billing_city}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="billing_state"
                      value={formData.billing_state}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="billing_postcode"
                      value={formData.billing_postcode}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      name="billing_country"
                      value={formData.billing_country}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ZA">South Africa</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Shipping Information</h2>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Same as billing information</span>
                  </label>
                </div>
                
                {!sameAsBilling && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="shipping_first_name"
                        value={formData.shipping_first_name}
                        onChange={handleInputChange}
                        required={!sameAsBilling}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="shipping_last_name"
                        value={formData.shipping_last_name}
                        onChange={handleInputChange}
                        required={!sameAsBilling}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        name="shipping_address_1"
                        value={formData.shipping_address_1}
                        onChange={handleInputChange}
                        required={!sameAsBilling}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        name="shipping_address_2"
                        value={formData.shipping_address_2}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="shipping_city"
                        value={formData.shipping_city}
                        onChange={handleInputChange}
                        required={!sameAsBilling}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="shipping_state"
                        value={formData.shipping_state}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="shipping_postcode"
                        value={formData.shipping_postcode}
                        onChange={handleInputChange}
                        required={!sameAsBilling}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <select
                        name="shipping_country"
                        value={formData.shipping_country}
                        onChange={handleInputChange}
                        required={!sameAsBilling}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="ZA">South Africa</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Notes (Optional)</h2>
                <textarea
                  name="customer_note"
                  value={formData.customer_note}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Any special instructions or notes about your order..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
          </div>

          {/* Order Summary, Payment Method & Submit Button */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium mt-1 transition-colors duration-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>{getCartItemsCount()} items in your order</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>
              
              <div className="space-y-4">
                {/* Cash on Delivery */}
                <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">Cash on Delivery/Collection</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Pay when you receive your order or collect in person
                        </p>
                      </div>
                    </div>
                  </div>
                </label>

                {/* EFT Banking */}
                <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="eft"
                    checked={paymentMethod === 'eft'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">Electronic Funds Transfer (EFT)</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Bank transfer payment
                        </p>
                      </div>
                    </div>
                    
                    {paymentMethod === 'eft' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-3">Banking Details:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium">Legal entity name:</span>
                            <p>ESKILZ COLLEGE PTY LTD</p>
                          </div>
                          <div>
                            <span className="font-medium">Account holder:</span>
                            <p>ESKILZ COLLEGE PTY LTD</p>
                          </div>
                          <div>
                            <span className="font-medium">Registration number:</span>
                            <p>2012/076565/07</p>
                          </div>
                          <div>
                            <span className="font-medium">Account number:</span>
                            <p>401997618</p>
                          </div>
                          <div>
                            <span className="font-medium">Account type:</span>
                            <p>BUSINESS CURRENT ACCOUNT</p>
                          </div>
                          <div>
                            <span className="font-medium">Branch:</span>
                            <p>NORTHGATE</p>
                          </div>
                          <div>
                            <span className="font-medium">Branch code:</span>
                            <p>001106</p>
                          </div>
                          <div>
                            <span className="font-medium">Electronic payments:</span>
                            <p>051001</p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-medium">SWIFT address:</span>
                            <p>SBZA ZA J</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-3">
                          Please use your order number as reference when making payment.
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Big Centered Submit Button */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-5 px-8 rounded-lg shadow-lg transition-all duration-200 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Placing Order...</span>
                  </div>
                ) : (
                  `Place Order - $${getCartTotal().toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}