const { body } = require('express-validator');

exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Completed'])
    .withMessage('Status must be Todo, In Progress, or Completed'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
];

/** Update validation — all fields optional, but if provided must be valid */
exports.taskUpdateValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Completed'])
    .withMessage('Status must be Todo, In Progress, or Completed'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
];
