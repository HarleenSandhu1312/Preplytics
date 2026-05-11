import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Topbar from '../../shared/Topbar';
import { storage } from '../../utils/storage';

const ICONS = [];

export default function SubjectsManager({ onNav }) {
  const [subjects, setSubjects] = useState(() => storage.getSubjects() || {});
  const [topics, setTopics]   = useState(() => storage.getTopics()   || {});
  const [students, setStudents] = useState([]);
  useEffect(() => {
    api.get('/admin/users').then(res => setStudents((res.data.data || []).filter(u => u.role !== 'admin'))).catch(() => {});
  }, []);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm] = useState({ id: '', name: '', icon: '', desc: '', weightage: '' });
  const [err, setErr]   = useState('');

  const save = () => {
    setErr('');
    if (!form.id.trim() || !form.name.trim()) { setErr('ID and Name are required'); return; }
    if (!editing && subjects[form.id]) { setErr('Subject ID already exists'); return; }
    const updated = { ...subjects, [form.id]: { id: form.id, name: form.name, icon: form.icon, desc: form.desc, weightage: Number(form.weightage) || 0 } };
    storage.saveSubjects(updated);
    if (!topics[form.id]) {
      const updTopics = { ...topics, [form.id]: [] };
      storage.saveTopics(updTopics);
      setTopics(updTopics);
    }
    setSubjects(updated);
    storage.logActivity(`Subject "${form.name}" ${editing ? 'updated' : 'added'} by admin`);
    setShowModal(false);
    setEditing(null);
    setForm({ id: '', name: '', icon: '', desc: '', weightage: '' });
  };

  const del = (sid) => {
    if (!window.confirm(`Delete subject "${subjects[sid]?.name}"?`)) return;
    const updated = { ...subjects };
    delete updated[sid];
    const updTopics = { ...topics };
    delete updTopics[sid];
    storage.saveSubjects(updated);
    storage.saveTopics(updTopics);
    storage.logActivity(`Subject "${subjects[sid]?.name}" deleted by admin`);
    setSubjects(updated);
    setTopics(updTopics);
  };

  const openEdit = (sid) => {
    const s = subjects[sid];
    setForm({ id: sid, name: s.name, icon: s.icon, desc: s.desc || '', weightage: s.weightage || '' });
    setEditing(sid);
    setShowModal(true);
  };

  const avgScore = (sid) => {
    const users = students;
    const scores = users.map(u => storage.getStudy(u.email)?.[sid]?.overallScore || 0).filter(v => v > 0);
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  };

  return (
    <>
      <Topbar title="Subjects Manager" onNav={onNav} />
      <div className="page-full">
        <div className="admin-sec">
          <div className="admin-sec-hd">
            <span className="admin-sec-title">All Subjects</span>
            <button className="btn btn-p" onClick={() => { setForm({ id: '', name: '', icon: '', desc: '', weightage: '' }); setEditing(null); setShowModal(true); }}>
              + Add Subject
            </button>
          </div>
          <div>
            <div className="admin-tbl-hd admin-tbl-row" style={{ gridTemplateColumns: '2fr 3fr 1fr 1fr 1fr 1.5fr' }}>
              <span>Subject</span><span>Description</span><span>Topics</span><span>Weightage</span><span>Avg Score</span><span>Actions</span>
            </div>
            {Object.keys(subjects).length === 0 ? (
              <div className="empty-state"><p>No subjects yet. Add your first subject.</p></div>
            ) : Object.entries(subjects).map(([sid, s]) => {
              const tc = (topics[sid] || []).length;
              const avg = avgScore(sid);
              return (
                <div key={sid} className="admin-tbl-row" style={{ gridTemplateColumns: '2fr 3fr 1fr 1fr 1fr 1.5fr' }}>
                  <span style={{ fontWeight: 600 }}>{s.icon} {s.name}</span>
                  <span style={{ color: 'var(--t2)', fontSize: 12 }}>{s.desc || '—'}</span>
                  <span>{tc}</span>
                  <span>{s.weightage ? `${s.weightage}%` : '—'}</span>
                  <span className={`score-cell ${avg >= 60 ? 'ok' : avg > 0 ? 'low' : 'none'}`}>{avg > 0 ? `${avg}%` : '—'}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-sm p" onClick={() => openEdit(sid)}>Edit</button>
                    <button className="btn-sm danger" onClick={() => del(sid)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <span className="modal-title">{editing ? 'Edit Subject' : 'Add New Subject'}</span>
              <button className="modal-x" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {err && <div style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red)', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: 12, marginBottom: 12 }}>{err}</div>}
            <div className="form-grid">
              <div className="ff">
                <label>Subject ID (no spaces)</label>
                <input className="finp" placeholder="e.g. DSA" value={form.id} disabled={!!editing}
                  onChange={e => setForm({ ...form, id: e.target.value.replace(/\s/g, '') })} />
              </div>
              <div className="ff">
                <label>Subject Name</label>
                <input className="finp" placeholder="e.g. Data Structures" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="ff">
                <label>Icon (emoji)</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                  {ICONS.map(ic => (
                    <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                      style={{ background: form.icon === ic ? 'var(--blue-soft)' : 'var(--panel)', border: `1px solid ${form.icon === ic ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 16 }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ff">
                <label>Weightage (%)</label>
                <input className="finp" type="number" placeholder="e.g. 25" value={form.weightage}
                  onChange={e => setForm({ ...form, weightage: e.target.value })} />
              </div>
              <div className="ff span2">
                <label>Description</label>
                <input className="finp" placeholder="Short description" value={form.desc}
                  onChange={e => setForm({ ...form, desc: e.target.value })} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-p" onClick={save}>{editing ? 'Save Changes' : 'Add Subject'}</button>
              <button className="btn btn-g" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
