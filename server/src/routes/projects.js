const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireProjectMember } = require('../middleware/rbac');
const { projectValidation, addMemberValidation } = require('../utils/validation');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');

// All routes require authentication
router.use(auth);

// List all projects for the user
router.get('/', getProjects);

// Create a new project
router.post('/', projectValidation, createProject);

// Get a single project (requires membership)
router.get('/:id', requireProjectMember(), getProject);

// Update a project (requires ADMIN)
router.put('/:id', requireProjectMember('ADMIN'), projectValidation, updateProject);

// Delete a project (requires ADMIN)
router.delete('/:id', requireProjectMember('ADMIN'), deleteProject);

// Add a member (requires ADMIN)
router.post('/:id/members', requireProjectMember('ADMIN'), addMemberValidation, addMember);

// Remove a member (requires ADMIN)
router.delete('/:id/members/:userId', requireProjectMember('ADMIN'), removeMember);

module.exports = router;
