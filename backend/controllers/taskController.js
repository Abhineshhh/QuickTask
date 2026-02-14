const { validationResult } = require('express-validator');
const Task = require('../models/Task');

/** Create a new task for the authenticated user */
exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const task = await Task.create({ ...req.body, user: req.userId });
    res.status(201).json(task);
  } catch (error) {
    console.error('CreateTask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Get all tasks for the authenticated user with optional filters, search, and sorting */
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    const filter = { user: req.userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      // Escape regex special characters to prevent injection
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: escaped, $options: 'i' };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = ['dueDate', 'priority', 'createdAt'].includes(sortBy) ? sortBy : 'createdAt';

    let sort = { [sortField]: sortOrder };
    if (sortField === 'priority') {
      // Custom sort for priority: High > Medium > Low
      const tasks = await Task.find(filter).lean();
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      tasks.sort((a, b) => {
        const diff = priorityOrder[b.priority] - priorityOrder[a.priority];
        return sortOrder === -1 ? diff : -diff;
      });
      return res.json(tasks);
    }

    const tasks = await Task.find(filter).sort(sort).lean();
    res.json(tasks);
  } catch (error) {
    console.error('GetTasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Get a single task by ID (only if owned by the authenticated user) */
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    console.error('GetTask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Update a task by ID (only if owned by the authenticated user) */
exports.updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    // Whitelist allowed update fields to prevent injection
    const allowed = ['title', 'description', 'priority', 'status', 'dueDate'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    console.error('UpdateTask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Delete a task by ID (only if owned by the authenticated user) */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    console.error('DeleteTask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Get dashboard statistics: counts by status/priority, completion rate, overdue count */
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;

    const [total, completed, inProgress, todo, highPriority, mediumPriority, lowPriority, overdue] =
      await Promise.all([
        Task.countDocuments({ user: userId }),
        Task.countDocuments({ user: userId, status: 'Completed' }),
        Task.countDocuments({ user: userId, status: 'In Progress' }),
        Task.countDocuments({ user: userId, status: 'Todo' }),
        Task.countDocuments({ user: userId, priority: 'High' }),
        Task.countDocuments({ user: userId, priority: 'Medium' }),
        Task.countDocuments({ user: userId, priority: 'Low' }),
        Task.countDocuments({
          user: userId,
          status: { $ne: 'Completed' },
          dueDate: { $lt: new Date() },
        }),
      ]);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      total,
      completed,
      inProgress,
      todo,
      overdue,
      completionRate,
      byPriority: { High: highPriority, Medium: mediumPriority, Low: lowPriority },
      byStatus: { Todo: todo, 'In Progress': inProgress, Completed: completed },
    });
  } catch (error) {
    console.error('DashboardStats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
