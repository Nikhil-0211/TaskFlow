import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Plus, FolderKanban, Users, ListTodo, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = () => {
    api.get('/projects').then(res => setProjects(res.data.projects)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(fetchProjects, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setCreating(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="slide-up">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Projects</h1>
            <p>Manage your team projects</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="card-grid">
          {projects.map(p => (
            <div key={p.id} className="card project-card" onClick={() => navigate(`/projects/${p.id}`)}>
              <div className="project-card-header">
                <h3>{p.name}</h3>
                <span className={`badge badge-${p.myRole?.toLowerCase()}`}>{p.myRole}</span>
              </div>
              {p.description && <div className="project-card-desc">{p.description}</div>}
              <div className="project-card-footer">
                <div className="project-card-stats">
                  <span><Users size={14} /> {p.memberCount}</span>
                  <span><ListTodo size={14} /> {p.taskStats.total}</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {p.taskStats.done}/{p.taskStats.total} done
                </span>
              </div>
              <div className="project-progress">
                <div className="project-progress-bar"
                  style={{ width: `${p.taskStats.total > 0 ? (p.taskStats.done / p.taskStats.total) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <div className="empty-icon"><FolderKanban size={48} /></div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create Project
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>New Project</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="project-name">Project Name</label>
                <input id="project-name" className="form-input" placeholder="My Project"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
              </div>
              <div className="form-group">
                <label htmlFor="project-desc">Description (optional)</label>
                <textarea id="project-desc" className="form-textarea" placeholder="What's this project about?"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <div className="spinner" /> : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
