import { useState } from 'react';
import Topbar from '../../shared/Topbar';
import { storage } from '../../utils/storage';

export default function TopicsManager({ onNav }) {
  const [subjects, setSubjects] = useState(() => storage.getSubjects() || {});
  const [topicsAll, setTopicsAll] = useState(() => storage.getTopics() || {});
  const [activeSub, setActiveSub]   = useState(() => Object.keys(storage.getSubjects() || {})[0] || '');
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm] = useState({ name: '', difficulty: 'Medium', importance: 'High' });
  const [err, setErr]   = useState('');

  const topics = topicsAll[activeSub] || [];
  const notes  = storage.getNotes();
  const tests  = storage.getTests();

  const save = () => {
    setErr('');
    if (!form.name.trim()) { setErr('Topic name is required'); return; }
    let updated;
    if (editing) {
      updated = topics.map(t => t.id === editing ? { ...t, ...form } : t);
    } else {
      const newTopic = { id: `${activeSub}-${Date.now()}`, name: form.name, difficulty: form.difficulty, importance: form.importance, notesCount: 0, hasTest: false };
      updated = [...topics, newTopic];
    }
    const all = { ...topicsAll, [activeSub]: updated };
    storage.saveTopics(all);
    setTopicsAll(all);
    storage.logActivity(`Topic "${form.name}" ${editing ? 'updated' : 'added'} to ${activeSub}`);
    setShowModal(false); setEditing(null);
    setForm({ name: '', difficulty: 'Medium', importance: 'High' });
  };

  const del = (tid) => {
    const t = topics.find(t => t.id === tid);
    if (!window.confirm(`Delete topic "${t?.name}"?`)) return;
    const updated = topics.filter(t => t.id !== tid);
    const all = { ...topicsAll, [activeSub]: updated };
    storage.saveTopics(all);
    setTopicsAll(all);
    storage.logActivity(`Topic "${t?.name}" deleted from ${activeSub}`);
  };

  const openEdit = (t) => {
    setForm({ name: t.name, difficulty: t.difficulty, importance: t.importance });
    setEditing(t.id);
    setShowModal(true);
  };

  return (
    <>
      <Topbar title="Topics Manager" onNav={onNav} />
      <div className="page-full">
        {/* Subject selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {Object.entries(subjects).map(([sid, s]) => (
            <button key={sid}
              style={{ padding: '7px 16px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${activeSub === sid ? 'var(--blue)' : 'var(--border)'}`, background: activeSub === sid ? 'var(--blue)' : 'var(--card)', color: activeSub === sid ? '#fff' : 'var(--t2)', transition: '0.13s' }}
              onClick={() => setActiveSub(sid)}>
              {s.icon} {sid}
            </button>
          ))}
        </div>

        {!activeSub ? (
          <div className="empty-state"><p>No subjects available. Add subjects first.</p></div>
        ) : (
          <div className="admin-sec">
            <div className="admin-sec-hd">
              <span className="admin-sec-title">Topics in {subjects[activeSub]?.name}</span>
              <button className="btn btn-p" onClick={() => { setForm({ name: '', difficulty: 'Medium', importance: 'High' }); setEditing(null); setShowModal(true); }}>
                + Add Topic
              </button>
            </div>
            <div>
              <div className="admin-tbl-hd admin-tbl-row" style={{ gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 1.5fr' }}>
                <span>Topic Name</span><span>Difficulty</span><span>Importance</span><span>Notes</span><span>Test?</span><span>Actions</span>
              </div>
              {topics.length === 0 ? (
                <div className="empty-state"><p>No topics yet. Add the first topic.</p></div>
              ) : topics.map(t => {
                const nc = notes.filter(n => n.subject === activeSub && n.topic === t.name).length;
                const ht = tests.some(ts => ts.subject === activeSub && ts.topic === t.name);
                return (
                  <div key={t.id} className="admin-tbl-row" style={{ gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 1.5fr' }}>
                    <span style={{ fontWeight: 600 }}>{t.name}</span>
                    <span><span className={`diff-badge diff-${t.difficulty?.toLowerCase()}`}>{t.difficulty}</span></span>
                    <span><span className={`imp-badge imp-${t.importance?.toLowerCase()}`}>{t.importance}</span></span>
                    <span>{nc}</span>
                    <span style={{ color: ht ? 'var(--green)' : 'var(--t3)', fontWeight: 600 }}>{ht ? 'Yes' : 'No'}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-sm p" onClick={() => openEdit(t)}>Edit</button>
                      <button className="btn-sm danger" onClick={() => del(t.id)}>Del</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <span className="modal-title">{editing ? 'Edit Topic' : 'Add New Topic'}</span>
              <button className="modal-x" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {err && <div style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red)', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: 12, marginBottom: 12 }}>{err}</div>}
            <div className="form-grid one">
              <div className="ff">
                <label>Topic Name</label>
                <input className="finp" placeholder="e.g. Arrays & Strings" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="ff">
                <label>Difficulty</label>
                <select className="finp" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                </select>
              </div>
              <div className="ff">
                <label>Exam Importance</label>
                <select className="finp" value={form.importance} onChange={e => setForm({ ...form, importance: e.target.value })}>
                  <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-p" onClick={save}>{editing ? 'Save Changes' : 'Add Topic'}</button>
              <button className="btn btn-g" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
