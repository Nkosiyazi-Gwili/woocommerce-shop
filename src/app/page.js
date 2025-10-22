import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to Our Shop</h1>
        <p className="text-xl mb-8">Discover amazing products at great prices</p>
        <Link 
          href="/shop"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors"
        >
          Go to Shop
        </Link>
      </div>
    </main>
  );
}