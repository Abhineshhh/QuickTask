require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');

const seedData = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});

    // Create demo user
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@quicktask.com',
      password: 'demo123456',
    });

    // Create sample tasks
    const tasks = [
      {
        title: 'Set up project repository',
        description: 'Initialize Git repo and push initial commit',
        priority: 'High',
        status: 'Completed',
        dueDate: new Date('2026-02-10'),
        user: user._id,
      },
      {
        title: 'Design database schema',
        description: 'Plan MongoDB collections and relationships',
        priority: 'High',
        status: 'Completed',
        dueDate: new Date('2026-02-11'),
        user: user._id,
      },
      {
        title: 'Implement authentication',
        description: 'JWT-based login and registration',
        priority: 'High',
        status: 'In Progress',
        dueDate: new Date('2026-02-14'),
        user: user._id,
      },
      {
        title: 'Build task CRUD API',
        description: 'Create endpoints for task management',
        priority: 'Medium',
        status: 'In Progress',
        dueDate: new Date('2026-02-15'),
        user: user._id,
      },
      {
        title: 'Create dashboard UI',
        description: 'Build charts and statistics display',
        priority: 'Medium',
        status: 'Todo',
        dueDate: new Date('2026-02-16'),
        user: user._id,
      },
      {
        title: 'Write unit tests',
        description: 'Test critical backend functions',
        priority: 'Low',
        status: 'Todo',
        dueDate: new Date('2026-02-18'),
        user: user._id,
      },
      {
        title: 'Deploy application',
        description: 'Deploy to cloud hosting platform',
        priority: 'Medium',
        status: 'Todo',
        dueDate: new Date('2026-02-20'),
        user: user._id,
      },
      {
        title: 'Write documentation',
        description: 'Complete README with setup instructions',
        priority: 'Low',
        status: 'Todo',
        dueDate: new Date('2026-02-19'),
        user: user._id,
      },
    ];

    await Task.insertMany(tasks);
    console.log('Seed data inserted successfully');
    console.log('Demo user: demo@quicktask.com / demo123456');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
