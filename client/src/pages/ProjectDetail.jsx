import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, X, ArrowLeft, Users, Trash2, UserPlus, Calendar, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assigneeId: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const myRole = project?.members?.find(m => m.user.id === user?.id)?.role;
  const isAdmin = myRole === 'ADMIN';

  const fetchProject = () => {
    api.get(`/projects/${id}`).then(res => setProject(res.data.project)).catch(() => {
      toast.error('Project not found');
      navigate('/projects');
    }).finally(() => setLoading(false));
  };

  useEffect(fetchProject, [id]);

  const openNewTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assigneeId: '' });
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assigneeId: task.assigneeId || ''
    });
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      const payload = { ...taskForm, assigneeId: taskForm.assigneeId || null, dueDate: taskForm.dueDate || null };
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
        toast.success('Task updated');
      } else {
        await api.post(`/tasks/project/${id}`, payload);
        toast.success('Task created');
      }
      setShowTaskModal(false);
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setSaving(true);
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail, role: 'MEMBER' });
      toast.success('Member added!');
      setMemberEmail('');
      setShowMemberModal(false);
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!project) return null;

  const tasks = project.tasks || [];
  const columns = [
    { key: 'TODO', label: 'To Do', tasks: tasks.filter(t => t.status === 'TODO') },
    { key: 'IN_PROGRESS', label: 'In Progress', tasks: tasks.filter(t => t.status === 'IN_PROGRESS') },
    { key: 'DONE', label: 'Done', tasks: tasks.filter(t => t.status === 'DONE') },
  ];

  const getInitials = (n) => n?.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) || '?';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  const isOverdue = (d) => d && new Date(d) < new Date();

  return (
    <div className="slide-up">
      <div className="page-header">
        <button className="btn btn-ghost" onClick={() => navigate('/projects')} style={{ marginBottom: '12px' }}>
          <ArrowLeft size={16} /> Back to Projects
        </button>
        <div className="page-header-row">
          <div>
            <h1>{project.name}</h1>
            {project.description && <p>{project.description}</p>}
          </div>
          <div className="flex gap-8">
            {isAdmin && (
              <>
                <button className="btn btn-primary" onClick={openNewTask}><Plus size={16} /> Add Task</button>
                <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}><Trash2 size={14} /></button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="detail-layout">
        {/* Task Board */}
        <div>
          <div className="task-board">
            {columns.map(col => (
              <div key={col.key} className="task-column">
                <div className="task-column-header">
                  <h3>
                    <span className={`badge badge-${col.key.toLowerCase().replace('_', '-')}`}>{col.label}</span>
                  </h3>
                  <span className="count">{col.tasks.length}</span>
                </div>
                <div className="task-list">
                  {col.tasks.map(task => (
                    <div key={task.id} className="task-card" onClick={() => isAdmin ? openEditTask(task) : null}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="task-card-title">{task.title}</div>
                        {isAdmin && (
                          <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); handleDeleteTask(task.id); }}
                            style={{ padding: '2px', flexShrink: 0 }}>
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <div className="task-card-meta">
                        <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                        {task.dueDate && (
                          <span className={`task-card-due ${isOverdue(task.dueDate) && task.status !== 'DONE' ? 'overdue' : ''}`}>
                            <Calendar size={11} /> {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {task.assignee ? (
                          <span className="task-card-assignee">
                            <span className="mini-avatar">{getInitials(task.assignee.name)}</span>
                            {task.assignee.name}
                          </span>
                        ) : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unassigned</span>}
                        {/* Status quick change */}
                        {(isAdmin || task.assigneeId === user?.id) && task.status !== 'DONE' && (
                          <button className="btn btn-sm btn-secondary" onClick={e => {
                            e.stopPropagation();
                            handleStatusChange(task.id, task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE');
                          }} style={{ fontSize: '10px', padding: '3px 8px' }}>
                            {task.status === 'TODO' ? 'Start' : 'Complete'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {col.tasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Members */}
        <div className="detail-sidebar">
          <div className="card">
            <h3><Users size={16} /> Members ({project.members.length})</h3>
            {isAdmin && (
              <button className="btn btn-secondary btn-sm w-full" onClick={() => setShowMemberModal(true)} style={{ marginBottom: '12px' }}>
                <UserPlus size={14} /> Add Member
              </button>
            )}
            <div className="member-list">
              {project.members.map(m => (
                <div key={m.id} className="member-item">
                  <div className="member-info">
                    <div className="member-avatar">{getInitials(m.user.name)}</div>
                    <div>
                      <div className="member-name">{m.user.name}</div>
                      <div className="member-email">{m.user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span>
                    {isAdmin && m.user.id !== project.ownerId && (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveMember(m.user.id)}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="btn btn-ghost" onClick={() => setShowTaskModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input className="form-input" placeholder="Task title" value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} autoFocus />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-textarea" placeholder="Optional description" value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-select" value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-select" value={taskForm.status}
                    onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" className="form-input" value={taskForm.dueDate}
                  onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select className="form-select" value={taskForm.assigneeId}
                  onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project.members.map(m => (
                    <option key={m.user.id} value={m.user.id}>{m.user.name} ({m.user.email})</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" /> : (editingTask ? 'Update Task' : 'Create Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>Add Member</h2>
              <button className="btn btn-ghost" onClick={() => setShowMemberModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Email Address</label>
                <input className="form-input" type="email" placeholder="member@example.com"
                  value={memberEmail} onChange={e => setMemberEmail(e.target.value)} autoFocus />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" /> : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
