import { Link } from 'react-router-dom';

/** 404 page for unmatched routes */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
      <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">404</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Page not found</p>
      <Link
        to="/"
        className="text-sm px-4 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
