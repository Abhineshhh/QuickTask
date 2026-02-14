const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { taskValidation, taskUpdateValidation } = require('../middleware/validators');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');

router.get('/dashboard', auth, getDashboardStats);
router.get('/', auth, getTasks);
router.get('/:id', auth, getTask);
router.post('/', auth, taskValidation, createTask);
router.put('/:id', auth, taskUpdateValidation, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
