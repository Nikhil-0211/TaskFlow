import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, FolderKanban, TrendingUp, Zap, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const stats = data?.stats || {};
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="slide-up">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your tasks and projects</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><FolderKanban size={22} /></div>
          <div className="stat-value">{stats.totalProjects || 0}</div>
          <div className="stat-label">Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><ListTodo size={22} /></div>
          <div className="stat-value">{stats.totalTasks || 0}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Clock size={22} /></div>
          <div className="stat-value">{stats.inProgress || 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle2 size={22} /></div>
          <div className="stat-value">{stats.done || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><AlertTriangle size={22} /></div>
          <div className="stat-value">{stats.overdue || 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Zap size={22} /></div>
          <div className="stat-value">{stats.highPriority || 0}</div>
          <div className="stat-label">High Priority</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Project Progress */}
        {data?.tasksByProject?.length > 0 && (
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} /> Project Progress
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {data.tasksByProject.map(p => (
                <div key={p.project.id}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                    <Link to={`/projects/${p.project.id}`} style={{ fontSize: '14px', fontWeight: 600 }}>{p.project.name}</Link>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.done}/{p.total} done</span>
                  </div>
                  <div className="project-progress">
                    <div className="project-progress-bar" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overdue Tasks */}
        {data?.overdueTasks?.length > 0 && (
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
              <AlertTriangle size={18} /> Overdue Tasks
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.overdueTasks.map(t => (
                <div key={t.id} className="task-card" style={{ cursor: 'default' }}>
                  <div className="task-card-title">{t.title}</div>
                  <div className="task-card-meta">
                    <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                    <span className="task-card-due overdue"><Calendar size={12} /> Due {formatDate(t.dueDate)}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.project?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Tasks */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} /> Recent Tasks
          </h3>
          {data?.recentTasks?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.recentTasks.slice(0, 5).map(t => (
                <div key={t.id} className="task-card" style={{ cursor: 'default' }}>
                  <div className="task-card-title">{t.title}</div>
                  <div className="task-card-meta">
                    <span className={`badge badge-${t.status.toLowerCase().replace('_', '-')}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                    <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                    {t.assignee && (
                      <span className="task-card-assignee">
                        <span className="mini-avatar">{t.assignee.name[0]}</span>
                        {t.assignee.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px' }}>
              <p>No tasks yet. Create a project and add tasks!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
