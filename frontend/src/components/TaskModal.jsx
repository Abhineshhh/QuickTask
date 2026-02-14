import { useState, useEffect } from 'react';

/**
 * Modal dialog for creating or editing a task.
 * Renders a form with title, description, priority, status, and due date fields.
 */
export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Todo',
    dueDate: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        status: task.status || 'Todo',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        dueDate: form.dueDate + 'T00:00:00.000Z',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <h3 className="text-base font-semibold mb-4">
          {task ? 'Edit Task' : 'New Task'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
              placeholder="Task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 resize-none"
              rows={3}
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date *</label>
            <input
              type="date"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm px-4 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="text-sm px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
            >
              {saving ? 'Saving...' : task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
