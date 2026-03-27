const Item = require('../models/Item');

// ── Dummy seed data (used if DB is empty) ───────────────────────────────────
const SEED_DATA = {
  tasks: [
    { title: 'Design system architecture', category: 'task', status: 'completed', priority: 'high', description: 'Plan out microservices and data flow.' },
    { title: 'Set up CI/CD pipeline', category: 'task', status: 'active', priority: 'high', description: 'Configure GitHub Actions for automated deployment.' },
    { title: 'Write unit tests', category: 'task', status: 'pending', priority: 'medium', description: 'Achieve 80% code coverage across modules.' },
    { title: 'Code review backlog', category: 'task', status: 'active', priority: 'low', description: 'Review outstanding PRs from team members.' },
  ],
  leads: [
    { title: 'Acme Corporation', category: 'lead', status: 'active', priority: 'high', description: 'Enterprise deal — $120k ARR opportunity.' },
    { title: 'TechStart Solutions', category: 'lead', status: 'pending', priority: 'medium', description: 'Startup in Series A — needs onboarding.' },
    { title: 'Global Retail Inc.', category: 'lead', status: 'active', priority: 'high', description: 'Retail chain with 200+ locations.' },
    { title: 'NovaBridge Media', category: 'lead', status: 'inactive', priority: 'low', description: 'Media company evaluating competitors.' },
  ],
  users: [
    { title: 'Sarah Chen', category: 'user', status: 'active', priority: 'high', description: 'Senior Engineer — Backend Team' },
    { title: 'Marcus Webb', category: 'user', status: 'active', priority: 'medium', description: 'Product Manager — Growth' },
    { title: 'Priya Sharma', category: 'user', status: 'pending', priority: 'medium', description: 'UX Designer — Design Systems' },
    { title: 'Jake Torres', category: 'user', status: 'inactive', priority: 'low', description: 'DevOps Engineer — Infrastructure' },
  ],
};

// ── GET /dashboard ──────────────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    let tasks = await Item.find({ owner: req.user._id, category: 'task' }).sort({ createdAt: -1 });
    let leads = await Item.find({ owner: req.user._id, category: 'lead' }).sort({ createdAt: -1 });
    let users = await Item.find({ owner: req.user._id, category: 'user' }).sort({ createdAt: -1 });

    // Seed data for first-time users
    if (tasks.length === 0 && leads.length === 0 && users.length === 0) {
      const allItems = [
        ...SEED_DATA.tasks.map((t) => ({ ...t, owner: req.user._id })),
        ...SEED_DATA.leads.map((l) => ({ ...l, owner: req.user._id })),
        ...SEED_DATA.users.map((u) => ({ ...u, owner: req.user._id })),
      ];

      await Item.insertMany(allItems);

      tasks = await Item.find({ owner: req.user._id, category: 'task' });
      leads = await Item.find({ owner: req.user._id, category: 'lead' });
      users = await Item.find({ owner: req.user._id, category: 'user' });
    }

    res.render('dashboard', {
      title: 'Dashboard',
      user: req.user,
      tasks,
      leads,
      teamUsers: users,
      stats: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === 'completed').length,
        activeLeads: leads.filter((l) => l.status === 'active').length,
        totalLeads: leads.length,
        activeUsers: users.filter((u) => u.status === 'active').length,
        totalUsers: users.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
