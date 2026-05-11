import { useState, useRef } from 'react';
import Topbar from '../../shared/Topbar';
import { storage } from '../../utils/storage';

export default function NotesManager({ onNav }) {
  const [subjects]  = useState(() => storage.getSubjects() || {});
  const [topicsAll] = useState(() => storage.getTopics()   || {});
  const [notes, setNotes]     = useState(() => storage.getNotes());
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm] = useState({ subject:'', topic:'', title:'', description:'', tags:'' });
  const [pdfData, setPdfData]   = useState(null);  // base64
  const [pdfName, setPdfName]   = useState('');
  const [filterSub, setFilterSub] = useState('');
  const [err, setErr]             = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // ── PDF file picker → convert to base64 ──
  const handleFilePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setErr('Only PDF files are allowed'); return; }
    if (file.size > 10 * 1024 * 1024) { setErr('PDF must be under 10 MB'); return; }
    setErr('');
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPdfData(ev.target.result); // full data: URI  "data:application/pdf;base64,..."
      setPdfName(file.name);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    setErr('');
    if (!form.subject || !form.topic || !form.title.trim()) {
      setErr('Subject, Topic and Title are required');
      return;
    }
    if (!editing && !pdfData) { setErr('Please upload a PDF file'); return; }

    const entry = {
      ...form,
      uploadedOn: new Date().toLocaleDateString(),
      id: editing || `note-${Date.now()}`,
      pdfData:  pdfData  || (editing ? notes.find(n => n.id === editing)?.pdfData  : null),
      pdfName:  pdfName  || (editing ? notes.find(n => n.id === editing)?.pdfName  : 'document.pdf'),
    };

    const updated = editing
      ? notes.map(n => n.id === editing ? entry : n)
      : [...notes, entry];

    storage.saveNotes(updated);
    setNotes(updated);
    storage.logActivity(`PDF "${form.title}" ${editing ? 'updated' : 'uploaded'} to ${form.subject} → ${form.topic}`);
    closeModal();
  };

  const del = (id) => {
    const n = notes.find(n => n.id === id);
    if (!window.confirm(`Delete "${n?.title}"?`)) return;
    const updated = notes.filter(n => n.id !== id);
    storage.saveNotes(updated);
    setNotes(updated);
    storage.logActivity(`PDF "${n?.title}" deleted`);
  };

  const openEdit = (n) => {
    setForm({ subject:n.subject, topic:n.topic, title:n.title, description:n.description || '', tags:n.tags || '' });
    setPdfData(null); setPdfName('');
    setEditing(n.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false); setEditing(null);
    setForm({ subject:'', topic:'', title:'', description:'', tags:'' });
    setPdfData(null); setPdfName(''); setErr('');
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── Open PDF in new tab ──
  const viewPdf = (n) => {
    if (!n.pdfData) { alert('No PDF data stored for this entry.'); return; }
    const w = window.open();
    w.document.write(`
      <html><head><title>${n.title}</title></head>
      <body style="margin:0;background:#333">
        <embed src="${n.pdfData}" type="application/pdf" width="100%" height="100%" style="position:fixed;inset:0"/>
      </body></html>
    `);
  };

  const displayed = filterSub ? notes.filter(n => n.subject === filterSub) : notes;
  const topicsForSub = form.subject ? (topicsAll[form.subject] || []) : [];
  const existingPdf = editing ? notes.find(n => n.id === editing) : null;

  return (
    <>
      <Topbar title="Notes & PDFs" onNav={onNav} />
      <div className="page-full">

        {/* Upload area */}
        <div className="admin-sec" style={{ marginBottom:18 }}>
          <div className="admin-sec-hd">
            <span className="admin-sec-title">Upload PDF Notes</span>
            <button className="btn btn-p" onClick={() => { setEditing(null); setShowModal(true); }}>+ Upload PDF</button>
          </div>
          <div className="admin-sec-body">
            <div className="upload-area" onClick={() => { setEditing(null); setShowModal(true); }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--blue-mid)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:10}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:5 }}>Click to upload a PDF file</div>
              <div style={{ fontSize:13, color:'var(--t3)' }}>Associate PDFs with subject and topic · Max 10 MB per file</div>
            </div>
          </div>
        </div>

        {/* Notes table */}
        <div className="admin-sec">
          <div className="admin-sec-hd">
            <span className="admin-sec-title">All PDFs ({notes.length})</span>
            <select style={{ padding:'7px 11px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, fontSize:13, color:'var(--t1)', fontFamily:'inherit' }}
              value={filterSub} onChange={e => setFilterSub(e.target.value)}>
              <option value="">All Subjects</option>
              {Object.entries(subjects).map(([sid, s]) => <option key={sid} value={sid}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <div className="admin-tbl-hd admin-tbl-row" style={{ gridTemplateColumns:'2.5fr 1fr 1.2fr 1.2fr 1.5fr' }}>
              <span>Title</span><span>Subject</span><span>Topic</span><span>Uploaded</span><span>Actions</span>
            </div>
            {displayed.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">—</div>
                <p style={{ fontSize:16 }}>No PDFs uploaded yet.</p>
                <p style={{ fontSize:13, marginTop:6 }}>Click "Upload PDF" to add study materials for students.</p>
              </div>
            ) : displayed.map(n => (
              <div key={n.id} className="admin-tbl-row" style={{ gridTemplateColumns:'2.5fr 1fr 1.2fr 1.2fr 1.5fr' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <div style={{ width:34, height:34, background:'var(--blue-soft)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>{n.title}</div>
                      <div style={{ fontSize:12, color:'var(--t3)' }}>{n.pdfName || 'document.pdf'}</div>
                      {n.tags && <div style={{ fontSize:11, color:'var(--t3)' }}>{n.tags}</div>}
                    </div>
                  </div>
                </div>
                <span className="bdg bdg-blue" style={{ fontSize:11 }}>{n.subject}</span>
                <span style={{ fontSize:13, color:'var(--t2)' }}>{n.topic}</span>
                <span style={{ fontSize:13, color:'var(--t2)' }}>{n.uploadedOn}</span>
                <div style={{ display:'flex', gap:6 }}>
                  {n.pdfData && (
                    <button className="btn-sm p" onClick={() => viewPdf(n)}>View</button>
                  )}
                  <button className="btn-sm g" onClick={() => openEdit(n)}>Edit</button>
                  <button className="btn-sm danger" onClick={() => del(n.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-bg" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <span className="modal-title">{editing ? 'Edit PDF Note' : 'Upload PDF Note'}</span>
              <button className="modal-x" onClick={closeModal}>✕</button>
            </div>
            {err && <div style={{ background:'var(--red-bg)', color:'var(--red)', border:'1px solid var(--red)', padding:'10px 13px', borderRadius:'var(--r-sm)', fontSize:13, marginBottom:14 }}>⚠ {err}</div>}

            {/* PDF upload section */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>
                PDF File {editing && '(leave blank to keep existing)'}
              </label>

              {/* Drop/click zone */}
              <div
                className="upload-area"
                style={{ padding:'20px', marginBottom:0 }}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  style={{ display:'none' }}
                  onChange={handleFilePick}
                />
                {uploading ? (
                  <div style={{ fontSize:14, color:'var(--blue)' }}>⏳ Converting PDF...</div>
                ) : pdfData ? (
                  <div style={{ fontSize:13, color:'var(--green)', fontWeight:700 }}>✓ {pdfName}</div>
                ) : existingPdf?.pdfName ? (
                  <div>
                    <div style={{ fontSize:13, color:'var(--green)', marginBottom:4 }}>Current: {existingPdf.pdfName}</div>
                    <div style={{ fontSize:12, color:'var(--t3)' }}>Click to replace with a new PDF</div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize:28, marginBottom:8 }}>📂</div>
                    <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Click to select PDF file</div>
                    <div style={{ fontSize:12 }}>PDF only · Max 10 MB</div>
                  </>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="ff">
                <label>Subject</label>
                <select className="finp" value={form.subject} onChange={e => setForm({ ...form, subject:e.target.value, topic:'' })}>
                  <option value="">Select Subject</option>
                  {Object.entries(subjects).map(([sid, s]) => <option key={sid} value={sid}>{s.name}</option>)}
                </select>
              </div>
              <div className="ff">
                <label>Topic</label>
                <select className="finp" value={form.topic} onChange={e => setForm({ ...form, topic:e.target.value })} disabled={!form.subject}>
                  <option value="">Select Topic</option>
                  {topicsForSub.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
              <div className="ff span2">
                <label>Title</label>
                <input className="finp" placeholder="e.g. DSA Complete Notes" value={form.title} onChange={e => setForm({ ...form, title:e.target.value })} />
              </div>
              <div className="ff span2">
                <label>Description (optional)</label>
                <textarea className="finp" rows={3} placeholder="Brief description of what this PDF covers..." value={form.description} onChange={e => setForm({ ...form, description:e.target.value })} style={{ resize:'vertical' }} />
              </div>
              <div className="ff span2">
                <label>Tags (comma separated)</label>
                <input className="finp" placeholder="e.g. important, exam, chapter-1" value={form.tags} onChange={e => setForm({ ...form, tags:e.target.value })} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-p" onClick={save}>
                {editing ? 'Save Changes' : '📤 Upload PDF Note'}
              </button>
              <button className="btn btn-g" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
