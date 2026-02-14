const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');

/**
 * Get aggregate statistics for a user.
 * Returns task counts, completion rate, priority/status distribution.
 */
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const uid = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    const pipeline = [
      { $match: { user: uid } },
      {
        $group: {
          _id: null,
          total_tasks: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          in_progress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'Todo'] }, 1, 0] } },
          high_priority: { $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] } },
          medium_priority: { $sum: { $cond: [{ $eq: ['$priority', 'Medium'] }, 1, 0] } },
          low_priority: { $sum: { $cond: [{ $eq: ['$priority', 'Low'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$status', 'Completed'] }, { $lt: ['$dueDate', now] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ];

    const result = await Task.aggregate(pipeline);

    if (!result.length) {
      return res.json({
        user_id: userId,
        user_name: user.name,
        total_tasks: 0,
        completed: 0,
        in_progress: 0,
        todo: 0,
        overdue: 0,
        completion_rate: 0,
        priority_distribution: { High: 0, Medium: 0, Low: 0 },
        status_distribution: { Todo: 0, 'In Progress': 0, Completed: 0 },
      });
    }

    const stats = result[0];
    const total = stats.total_tasks;
    const completion_rate = total > 0 ? Math.round((stats.completed / total) * 1000) / 10 : 0;

    res.json({
      user_id: userId,
      user_name: user.name,
      total_tasks: total,
      completed: stats.completed,
      in_progress: stats.in_progress,
      todo: stats.todo,
      overdue: stats.overdue,
      completion_rate,
      priority_distribution: {
        High: stats.high_priority,
        Medium: stats.medium_priority,
        Low: stats.low_priority,
      },
      status_distribution: {
        Todo: stats.todo,
        'In Progress': stats.in_progress,
        Completed: stats.completed,
      },
    });
  } catch (error) {
    console.error('Analytics user-stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get productivity trends for a user over a time period.
 * Returns daily task creation and completion counts.
 */
exports.getProductivity = async (req, res) => {
  try {
    const { userId } = req.params;
    let days = parseInt(req.query.days) || 30;
    days = Math.max(1, Math.min(365, days));

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const uid = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const [createdResults, completedResults] = await Promise.all([
      Task.aggregate([
        { $match: { user: uid, createdAt: { $gte: startDate, $lte: now } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Task.aggregate([
        {
          $match: {
            user: uid,
            status: 'Completed',
            updatedAt: { $gte: startDate, $lte: now },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const createdMap = {};
    createdResults.forEach((r) => (createdMap[r._id] = r.count));
    const completedMap = {};
    completedResults.forEach((r) => (completedMap[r._id] = r.count));

    const daily_data = [];
    let total_created = 0;
    let total_completed = 0;

    const current = new Date(startDate);
    while (current <= now) {
      const dateStr = current.toISOString().slice(0, 10);
      const created = createdMap[dateStr] || 0;
      const completed = completedMap[dateStr] || 0;
      total_created += created;
      total_completed += completed;
      daily_data.push({ date: dateStr, created, completed });
      current.setDate(current.getDate() + 1);
    }

    const average_daily_completions =
      Math.round((total_completed / Math.max(days, 1)) * 100) / 100;

    res.json({
      user_id: userId,
      period_days: days,
      start_date: startDate.toISOString().slice(0, 10),
      end_date: now.toISOString().slice(0, 10),
      total_created,
      total_completed,
      average_daily_completions,
      daily_data,
    });
  } catch (error) {
    console.error('Analytics productivity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
