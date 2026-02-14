import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/**
 * Application shell layout — header with navigation, theme toggle,
 * mobile hamburger menu, and user info. Renders child routes via <Outlet />.
 */
export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 text-sm rounded ${
      isActive
        ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-lg font-semibold tracking-tight">QuickTask</span>
            {/* Desktop nav */}
            <nav className="hidden sm:flex gap-1">
              <NavLink to="/" end className={navLinkClass}>Dashboard</NavLink>
              <NavLink to="/tasks" className={navLinkClass}>Tasks</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? 'Light' : 'Dark'}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hidden sm:inline"
            >
              Logout
            </button>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden text-gray-600 dark:text-gray-400 p-1"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-3 space-y-2 bg-white dark:bg-gray-900">
            <NavLink to="/" end className={({ isActive }) => `block ${navLinkClass({ isActive })}`} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
            <NavLink to="/tasks" className={({ isActive }) => `block ${navLinkClass({ isActive })}`} onClick={() => setMenuOpen(false)}>Tasks</NavLink>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
