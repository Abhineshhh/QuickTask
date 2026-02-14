import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="w-full max-w-sm px-4">
        <h1 className="text-2xl font-semibold mb-1">QuickTask</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Create a new account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
              placeholder="Your name"
            />
          </div>
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
              placeholder="At least 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-gray-900 dark:text-gray-100 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
