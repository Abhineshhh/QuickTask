import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Logged in successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="w-full max-w-sm px-4">
        <h1 className="text-2xl font-semibold mb-1">QuickTask</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-gray-900 dark:text-gray-100 underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
