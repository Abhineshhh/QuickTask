import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const [stats, setStats] = useState(null);
  const [productivity, setProductivity] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme-aware chart colors
  const COLORS = dark ? ['#e5e5e5', '#999', '#555'] : ['#111', '#666', '#bbb'];
  const barFill = dark ? '#d4d4d4' : '#111';
  const gridStroke = dark ? '#333' : '#eee';

  // Fetch productivity data from analytics endpoint
  const fetchProductivity = useCallback(async () => {
    try {
      const res = await api.get(`/analytics/productivity/${user.id}?days=14`);
      return res.data;
    } catch {
      // Analytics service may not be running — gracefully return null
      return null;
    }
  }, [user?.id]);

  // Fetch dashboard stats from Node backend and productivity from Python service
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, prodRes] = await Promise.all([
        api.get('/tasks/dashboard'),
        fetchProductivity(),
      ]);
      setStats(statsRes.data);
      setProductivity(prodRes);
    } catch (err) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [fetchProductivity]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="text-sm text-gray-500 dark:text-gray-400 py-12 text-center">Failed to load dashboard data.</div>;
  }

  // Calculate pending = todo + in-progress (completed vs pending requirement)
  const pending = stats.todo + stats.inProgress;

  const priorityData = [
    { name: 'High', value: stats.byPriority.High },
    { name: 'Medium', value: stats.byPriority.Medium },
    { name: 'Low', value: stats.byPriority.Low },
  ];

  const statusData = [
    { name: 'Todo', value: stats.byStatus.Todo },
    { name: 'In Progress', value: stats.byStatus['In Progress'] },
    { name: 'Completed', value: stats.byStatus.Completed },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">Dashboard</h2>

      {/* Stat Cards — total, completed, pending, in-progress, overdue */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Tasks" value={stats.total} />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Pending" value={pending} />
        <StatCard label="In Progress" value={stats.inProgress} />
        <StatCard label="Overdue" value={stats.overdue} accent={stats.overdue > 0} />
      </div>

      {/* Completion Rate */}
      <div className="border border-gray-200 dark:border-gray-800 rounded p-4 mb-8 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Completion Rate</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{stats.completionRate}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
          <div
            className="bg-gray-900 dark:bg-gray-100 h-2 rounded-full transition-all"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Priority Distribution — Pie Chart */}
        <div className="border border-gray-200 dark:border-gray-800 rounded p-4 bg-white dark:bg-gray-900">
          <h3 className="text-sm font-medium mb-4">Tasks by Priority</h3>
          {priorityData.every((d) => d.value === 0) ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-16 text-center">No tasks yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {priorityData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Distribution — Bar Chart */}
        <div className="border border-gray-200 dark:border-gray-800 rounded p-4 bg-white dark:bg-gray-900">
          <h3 className="text-sm font-medium mb-4">Tasks by Status</h3>
          {statusData.every((d) => d.value === 0) ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-16 text-center">No tasks yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill={barFill} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Productivity Trend — from Analytics Service */}
      {productivity && productivity.daily_data && (
        <div className="border border-gray-200 dark:border-gray-800 rounded p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Productivity Trend (Last 14 Days)</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Avg {productivity.average_daily_completions} completions/day
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={productivity.daily_data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="created" fill="#999" name="Created" radius={[2, 2, 0, 0]} />
              <Bar dataKey="completed" fill={barFill} name="Completed" radius={[2, 2, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/** Reusable stat card component for dashboard metrics */
function StatCard({ label, value, accent = false }) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded p-4 bg-white dark:bg-gray-900">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-semibold ${accent ? 'text-red-600' : ''}`}>{value}</div>
    </div>
  );
}
