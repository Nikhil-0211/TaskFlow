const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

const getProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId: req.user.id }
        }
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
        members: {
          where: { userId: req.user.id },
          select: { role: true }
        },
        tasks: {
          select: { status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format response
    const formatted = projects.map(p => {
      const taskStats = {
        total: p.tasks.length,
        todo: p.tasks.filter(t => t.status === 'TODO').length,
        inProgress: p.tasks.filter(t => t.status === 'IN_PROGRESS').length,
        done: p.tasks.filter(t => t.status === 'DONE').length,
      };
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        owner: p.owner,
        myRole: p.members[0]?.role || null,
        memberCount: p._count.members,
        taskStats,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      };
    });

    res.json({ projects: formatted });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          },
          orderBy: { joinedAt: 'asc' }
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN'
          }
        }
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } }
      }
    });

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } }
      }
    });

    res.json({ message: 'Project updated', project });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role } = req.body;
    const projectId = req.params.id;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'No user found with this email.' });
    }

    // Check if already a member
    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } }
    });
    if (existing) {
      return res.status(409).json({ error: 'User is already a member of this project.' });
    }

    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId,
        role: role || 'MEMBER'
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json({ message: 'Member added successfully', member });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { id: projectId, userId } = req.params;

    // Prevent removing the project owner
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project.ownerId === userId) {
      return res.status(400).json({ error: 'Cannot remove the project owner.' });
    }

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Member not found in this project.' });
    }
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
