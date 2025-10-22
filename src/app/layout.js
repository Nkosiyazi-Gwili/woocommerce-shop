import { CartProvider } from '../contexts/CartContext';
import './globals.css';

export const metadata = {
  title: 'Next.js WooCommerce Shop',
  description: 'Modern shop built with Next.js and WooCommerce',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}