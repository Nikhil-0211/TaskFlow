const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Middleware to check if the user is a member of the project
 * and optionally check for a specific role.
 * Attaches req.projectMember with role information.
 */
const requireProjectMember = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.params.id;
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required.' });
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: req.user.id,
            projectId: projectId
          }
        }
      });

      if (!membership) {
        return res.status(403).json({ error: 'You are not a member of this project.' });
      }

      if (requiredRole && membership.role !== requiredRole) {
        return res.status(403).json({ error: `This action requires ${requiredRole} role.` });
      }

      req.projectMember = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { requireProjectMember };
