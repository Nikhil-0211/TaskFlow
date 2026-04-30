const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all projects the user is a member of
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true, role: true }
    });

    const projectIds = memberships.map(m => m.projectId);

    // Get all tasks across user's projects
    const allTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } }
      }
    });

    // My assigned tasks
    const myTasks = allTasks.filter(t => t.assigneeId === userId);

    // Stats
    const now = new Date();
    const stats = {
      totalTasks: allTasks.length,
      myTasks: myTasks.length,
      todo: allTasks.filter(t => t.status === 'TODO').length,
      inProgress: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
      done: allTasks.filter(t => t.status === 'DONE').length,
      overdue: allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length,
      highPriority: allTasks.filter(t => t.priority === 'HIGH' && t.status !== 'DONE').length,
      totalProjects: projectIds.length
    };

    // Overdue tasks details
    const overdueTasks = allTasks
      .filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 10);

    // Recent tasks (last 10)
    const recentTasks = [...allTasks]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Tasks by project
    const tasksByProject = projectIds.map(pid => {
      const projectTasks = allTasks.filter(t => t.projectId === pid);
      const project = projectTasks[0]?.project || { id: pid, name: 'Unknown' };
      return {
        project,
        total: projectTasks.length,
        done: projectTasks.filter(t => t.status === 'DONE').length,
        progress: projectTasks.length > 0
          ? Math.round((projectTasks.filter(t => t.status === 'DONE').length / projectTasks.length) * 100)
          : 0
      };
    }).filter(p => p.total > 0);

    res.json({
      stats,
      overdueTasks,
      recentTasks,
      tasksByProject
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
