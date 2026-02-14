import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import NotFound from './pages/NotFound';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400">Loading...</div>;
  return user ? <Navigate to="/" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/** Toast container wrapper that adapts to current theme */
function ThemedToast() {
  const { dark } = useTheme();
  return <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme={dark ? 'dark' : 'light'} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
            <ThemedToast />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
