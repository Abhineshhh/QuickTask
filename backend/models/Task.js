const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Completed'],
      default: 'Todo',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
