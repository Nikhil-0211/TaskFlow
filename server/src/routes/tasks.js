const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireProjectMember } = require('../middleware/rbac');
const { taskValidation } = require('../utils/validation');
const {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');

// All routes require authentication
router.use(auth);

// List tasks for a project (requires membership)
router.get('/project/:projectId', requireProjectMember(), getTasks);

// Create task in a project (requires ADMIN)
router.post('/project/:projectId', requireProjectMember('ADMIN'), taskValidation, createTask);

// Update a task (role checked inside controller)
router.put('/:id', taskValidation, updateTask);

// Update task status only (role checked inside controller)
router.patch('/:id/status', updateTaskStatus);

// Delete a task (role checked inside controller — ADMIN only)
router.delete('/:id', deleteTask);

module.exports = router;
