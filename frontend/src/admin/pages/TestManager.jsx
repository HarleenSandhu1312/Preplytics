import { useState } from 'react';
import Topbar from '../../shared/Topbar';
import { storage } from '../../utils/storage';

const emptyQ = () => ({ id: Date.now(), q: '', opts: ['', '', '', ''], ans: 0, exp: '' });

export default function TestManager({ onNav }) {
  const [subjects]  = useState(() => storage.getSubjects() || {});
  const [topicsAll] = useState(() => storage.getTopics()   || {});
  const [tests, setTests] = useState(() => storage.getTests());
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm] = useState({ subject: '', topic: '', name: '', passingPct: 60, revisionDays: 3, questions: [emptyQ()] });
  const [err, setErr]   = useState('');

  const topicsForSub = form.subject ? (topicsAll[form.subject] || []) : [];

  const save = () => {
    setErr('');
    if (!form.subject || !form.topic || !form.name.trim()) { setErr('Subject, Topic and Name are required'); return; }
    if (form.questions.some(q => !q.q.trim() || q.opts.some(o => !o.trim()))) { setErr('All questions and options are required'); return; }
    const entry = { ...form, id: editId || `test-${Date.now()}`, createdOn: new Date().toLocaleDateString() };
    let updated;
    if (editId) updated = tests.map(t => t.id === editId ? entry : t);
    else        updated = [...tests, entry];
    storage.saveTests(updated);
    setTests(updated);
    // Mark topic as having test
    const topics = { ...topicsAll };
    if (topics[form.subject]) {
      topics[form.subject] = topics[form.subject].map(t =>
        t.name === form.topic ? { ...t, hasTest: true } : t
      );
      storage.saveTopics(topics);
    }
    storage.logActivity(`Mini Test "${form.name}" created for ${form.subject} → ${form.topic}`);
    setShowModal(false); setEditId(null);
    setForm({ subject: '', topic: '', name: '', passingPct: 60, revisionDays: 3, questions: [emptyQ()] });
  };

  const del = (id) => {
    const t = tests.find(t => t.id === id);
    if (!window.confirm(`Delete test "${t?.name}"?`)) return;
    const updated = tests.filter(t => t.id !== id);
    storage.saveTests(updated);
    setTests(updated);
  };

  const openEdit = (t) => {
    setForm({ ...t });
    setEditId(t.id);
    setShowModal(true);
  };

  const addQ = () => setForm(f => ({ ...f, questions: [...f.questions, emptyQ()] }));
  const removeQ = (idx) => setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }));
  const updateQ = (idx, field, val) => {
    setForm(f => {
      const qs = [...f.questions];
      if (field.startsWith('opt')) {
        const optIdx = Number(field.replace('opt', ''));
        qs[idx] = { ...qs[idx], opts: qs[idx].opts.map((o, i) => i === optIdx ? val : o) };
      } else {
        qs[idx] = { ...qs[idx], [field]: val };
      }
      return { ...f, questions: qs };
    });
  };

  return (
    <>
      <Topbar title="Test Manager" onNav={onNav} />
      <div className="page-full">
        <div className="admin-sec">
          <div className="admin-sec-hd">
            <span className="admin-sec-title">All Tests ({tests.length})</span>
            <button className="btn btn-p" onClick={() => { setEditId(null); setForm({ subject: '', topic: '', name: '', passingPct: 60, revisionDays: 3, questions: [emptyQ()] }); setShowModal(true); }}>
              + Create Test
            </button>
          </div>
          <div>
            <div className="admin-tbl-hd admin-tbl-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.5fr' }}>
              <span>Test Name</span><span>Subject</span><span>Topic</span><span>Questions</span><span>Passing %</span><span>Actions</span>
            </div>
            {tests.length === 0 ? (
              <div className="empty-state"><div style={{color:'var(--t3)',fontSize:13,padding:'12px 0',textAlign:'center'}}>No tests yet.</div><p>No tests created yet.</p></div>
            ) : tests.map(t => (
              <div key={t.id} className="admin-tbl-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.5fr' }}>
                <span style={{ fontWeight: 600 }}>{t.name}</span>
                <span className="bdg bdg-blue" style={{ fontSize: 10 }}>{t.subject}</span>
                <span style={{ fontSize: 12, color: 'var(--t2)' }}>{t.topic}</span>
                <span>{t.questions?.length || 0}</span>
                <span>{t.passingPct}%</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-sm p" onClick={() => openEdit(t)}>Edit</button>
                  <button className="btn-sm danger" onClick={() => del(t.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <span className="modal-title">{editId ? 'Edit Test' : 'Create New Test'}</span>
              <button className="modal-x" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {err && <div style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red)', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: 12, marginBottom: 12 }}>{err}</div>}

            {/* Test metadata */}
            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div className="ff">
                <label>Subject</label>
                <select className="finp" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value, topic: '' })}>
                  <option value="">Select Subject</option>
                  {Object.entries(subjects).map(([sid, s]) => <option key={sid} value={sid}>{s.name}</option>)}
                </select>
              </div>
              <div className="ff">
                <label>Topic</label>
                <select className="finp" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} disabled={!form.subject}>
                  <option value="">Select Topic</option>
                  {topicsForSub.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
              <div className="ff span2">
                <label>Test Name</label>
                <input className="finp" placeholder="e.g. DSA Arrays Practice Test" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="ff">
                <label>Passing % (e.g. 60)</label>
                <input className="finp" type="number" value={form.passingPct} onChange={e => setForm({ ...form, passingPct: Number(e.target.value) })} />
              </div>
              <div className="ff">
                <label>Auto-revision if fail (days)</label>
                <input className="finp" type="number" value={form.revisionDays} onChange={e => setForm({ ...form, revisionDays: Number(e.target.value) })} />
              </div>
            </div>

            {/* Questions */}
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
              Questions ({form.questions.length})
            </div>
            {form.questions.map((q, idx) => (
              <div key={q.id} className="q-block">
                <div className="q-block-hd">
                  <span>Q{idx + 1}</span>
                  {form.questions.length > 1 && <button className="btn-sm danger" onClick={() => removeQ(idx)}>Remove</button>}
                </div>
                <div className="ff" style={{ marginBottom: 10 }}>
                  <input className="finp" placeholder="Question text" value={q.q} onChange={e => updateQ(idx, 'q', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 10 }}>
                  {q.opts.map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="radio" name={`ans-${idx}`} checked={q.ans === oi} onChange={() => updateQ(idx, 'ans', oi)} style={{ cursor: 'pointer' }} />
                      <input className="finp" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} style={{ flex: 1 }}
                        onChange={e => updateQ(idx, `opt${oi}`, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div className="ff">
                  <input className="finp" placeholder="Explanation (optional)" value={q.exp} onChange={e => updateQ(idx, 'exp', e.target.value)} />
                </div>
              </div>
            ))}

            <button className="btn btn-g" style={{ marginBottom: 14, width: '100%', justifyContent: 'center' }} onClick={addQ}>
              + Add Another Question
            </button>
            <div className="form-actions">
              <button className="btn btn-p" onClick={save}>{editId ? 'Save Changes' : 'Create Test'}</button>
              <button className="btn btn-g" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
