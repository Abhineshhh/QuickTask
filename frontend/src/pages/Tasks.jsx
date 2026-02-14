import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import TaskModal from '../components/TaskModal';
import { useDebounce } from '../hooks/useDebounce';

// Filter and sort option constants
const STATUS_OPTIONS = ['', 'Todo', 'In Progress', 'Completed'];
const PRIORITY_OPTIONS = ['', 'Low', 'Medium', 'High'];
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  const fetchTasks = useCallback(async () => {
    try {
      const params = { sortBy, order };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const { data } = await api.get('/tasks', { params });
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, debouncedSearch, sortBy, order]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      fetchTasks();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = async (taskData) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, taskData);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', taskData);
        toast.success('Task created');
      }
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (task) => {
    return task.status !== 'Completed' && new Date(task.dueDate) < new Date();
  };

  /** Check if task is due within the next 24 hours (bonus: due date warning) */
  const isDueSoon = (task) => {
    if (task.status === 'Completed') return false;
    const due = new Date(task.dueDate);
    const now = new Date();
    const diff = due - now;
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  };

  /** Export all current tasks to a CSV file (bonus feature) */
  const handleExportCSV = () => {
    if (tasks.length === 0) {
      toast.error('No tasks to export');
      return;
    }
    const headers = ['Title', 'Description', 'Priority', 'Status', 'Due Date', 'Created At'];
    const rows = tasks.map((t) => [
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.priority,
      t.status,
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
      t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tasks exported to CSV');
  };

  const priorityClass = (p) => {
    if (p === 'High') return 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800';
    if (p === 'Medium') return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800';
    return 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800';
  };

  const statusClass = (s) => {
    if (s === 'Completed') return 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800';
    if (s === 'In Progress') return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800';
    return 'text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Export CSV
          </button>
          <button
            onClick={openCreate}
            className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 w-48"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
        >
          <option value="">All Priority</option>
          {PRIORITY_OPTIONS.filter(Boolean).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
          className="border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          title="Toggle sort order"
        >
          {order === 'asc' ? 'Asc' : 'Desc'}
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-12 text-center">
          No tasks found. Create your first task to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`border rounded p-4 bg-white dark:bg-gray-900 flex flex-col sm:flex-row sm:items-center gap-3 ${
                isOverdue(task) ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">{task.title}</span>
                  {isOverdue(task) && (
                    <span className="text-xs text-red-600 font-medium">Overdue</span>
                  )}
                  {isDueSoon(task) && (
                    <span className="text-xs text-yellow-600 font-medium">Due Soon</span>
                  )}
                </div>
                {task.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${priorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${statusClass(task.status)}`}>
                    {task.status}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Due: {formatDate(task.dueDate)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className="text-xs border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded px-2 py-1 focus:outline-none"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <button
                  onClick={() => openEdit(task)}
                  className="text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="text-xs text-red-600 hover:text-red-800 px-2 py-1 border border-red-200 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
