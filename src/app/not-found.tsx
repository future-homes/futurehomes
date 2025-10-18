import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-blue-600 mb-4">404</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
          >
            Go Home
          </Link>
          <Link
            href="/properties"
            className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition border-2 border-gray-200"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
