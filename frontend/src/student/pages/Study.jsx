import { useState, useEffect } from 'react';
import Topbar from '../../shared/Topbar';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { storage } from '../../utils/storage';
import MiniTest from '../components/MiniTest';

/* ── SVG Icons ─────────────────────────────────────────── */
const IcoArrow  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcoBack   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const IcoBook   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoPDF    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>;
const IcoBrain  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
const IcoWarn   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoInfo   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoCheck  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoEdit   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoEye    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoDL     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoNote   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IcoClose  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

/* ── Helpers ─────────────────────────────────────────────── */
function PBar({ value, height = 5 }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  return <div className="pb" style={{ height }}><div className="pb-fill" style={{ width:`${pct}%`, height }}/></div>;
}

function PdfViewer({ note, onClose }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div style={{ background:'var(--card)', borderRadius:'var(--r-lg)', width:'90vw', height:'88vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'var(--sh3)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800 }}>{note.title}</div>
            <div style={{ fontSize:12, color:'var(--t2)', marginTop:2 }}>{note.subject} → {note.topic}</div>
          </div>
          <button style={{ background:'var(--panel)', border:'1px solid var(--border)', color:'var(--t1)', borderRadius:8, padding:'7px 14px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:5 }} onClick={onClose}>
            <IcoClose /> Close
          </button>
        </div>
        <div style={{ flex:1, overflow:'hidden' }}>
          <embed src={note.pdfData} type="application/pdf" width="100%" height="100%" style={{ display:'block' }}/>
        </div>
      </div>
    </div>
  );
}

/* ── SUBJECT GRID — step 1 (matches the reference image) ── */
function SubjectGrid({ studyData, onSelect }) {
  const entries = Object.entries(studyData);

  return (
    <div style={{ padding:'24px 28px', maxWidth:1180, margin:'0 auto', width:'100%' }}>
      {/* Header */}
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:-0.4, marginBottom:4 }}>Select a Subject</h1>
        <p style={{ fontSize:13, color:'var(--t3)' }}>Click any subject to view topics, notes, and take tests</p>
      </div>

      {/* Clean responsive grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:10, marginBottom:20 }}>
        {entries.map(([name, d]) => {
          const sc   = d.overallScore || 0;
          const done = (d.topics || []).filter(t => t.status === 'completed').length;
          const tot  = (d.topics || []).length;
          const hasProgress = sc > 0 || done > 0;
          // 2-letter abbreviation badge
          const abbr = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          const barColor = sc >= 75 ? '#16a34a' : sc >= 40 ? 'var(--blue-mid)' : '#9ca3af';

          return (
            <div key={name}
              onClick={() => onSelect(name)}
              style={{
                background:'var(--card)', border:'1px solid var(--border)', borderRadius:12,
                padding:'14px 16px', display:'flex', alignItems:'center', gap:12,
                cursor:'pointer', transition:'border-color .13s, box-shadow .13s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--blue-mid)'; e.currentTarget.style.boxShadow='0 2px 12px rgba(37,99,200,0.10)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; }}
            >
              {/* 2-letter badge */}
              <div style={{ width:38, height:38, borderRadius:9, background:'var(--blue-soft)', color:'var(--blue-mid)', fontSize:12, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, letterSpacing:0.3 }}>
                {abbr}
              </div>

              {/* Subject name */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--t1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom: hasProgress ? 5 : 0 }}>
                  {name}
                </div>
                {/* Progress bar — only when there is progress */}
                {hasProgress && (
                  <div style={{ height:4, background:'var(--border)', borderRadius:99, overflow:'hidden', maxWidth:80 }}>
                    <div style={{ width:`${sc}%`, height:'100%', background:barColor, borderRadius:99, transition:'width .5s' }}/>
                  </div>
                )}
              </div>

              {/* Score + arrow — only when there is progress */}
              {hasProgress ? (
                <>
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--t2)', minWidth:38, textAlign:'right', flexShrink:0 }}>
                    {sc} %
                  </span>
                  <span style={{ color:'var(--t3)', flexShrink:0 }}><IcoArrow /></span>
                </>
              ) : (
                <span style={{ color:'var(--border2)', flexShrink:0 }}><IcoArrow /></span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--t3)' }}>
        <IcoInfo />
        Completion % depends on lecture and DPP progress!
      </div>
    </div>
  );
}

/* ── SUBJECT DETAIL — step 2 ── */
function SubjectDetail({ sub, data, studyData, onBack, onSelectSubject, markTopic, saveNote, saveTestResult }) {
  const [tab, setTab]       = useState('notes');
  const [editNote, setEditNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [viewingPdf, setViewingPdf] = useState(null);

  const allNotes = storage.getNotes();
  const subNotes = allNotes.filter(n => n.subject === sub);
  const allTests = storage.getTests();
  const subTests = allTests.filter(t => t.subject === sub);

  const completed = (data.topics || []).filter(t => t.status === 'completed').length;
  const total     = data.topics?.length || 0;
  const abbr = sub.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  const tabs = [
    { id:'notes',     Icon:IcoBook,  label:'Topics & Notes' },
    { id:'materials', Icon:IcoPDF,   label:'PDF Materials'  },
    { id:'minitest',  Icon:IcoBrain, label:'Mini Test'      },
    { id:'weak',      Icon:IcoWarn,  label:'Weak Topics'    },
  ];

  return (
    <div style={{ display:'flex', flex:1, height:'calc(100vh - var(--tbh))', overflow:'hidden' }}>
      {/* Left subject list — same as before but narrower */}
      <div className="study-left-sb">
        {/* Back button */}
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, width:'100%', padding:'8px 9px', marginBottom:10, background:'rgba(255,255,255,0.07)', border:'none', borderRadius:8, color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          <IcoBack /> All Subjects
        </button>
        <div className="sls-title">Subjects</div>
        {Object.entries(studyData).map(([name, d]) => {
          const sc = d.overallScore || 0;
          const abbr2 = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
          return (
            <button key={name}
              className={`sls-item ${sub === name ? 'active' : ''}`}
              onClick={() => onSelectSubject(name)}>
              {/* 2-letter icon instead of emoji */}
              <span style={{ width:22, height:22, borderRadius:5, background: sub === name ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{abbr2}</span>
              <span style={{ flex:1, fontSize:12, textAlign:'left', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</span>
              <span className={`sls-score ${sc > 0 && sc < 60 ? 'low' : sc >= 60 ? 'ok' : ''}`}>
                {sc > 0 ? `${sc}%` : ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main panel */}
      <div className="study-panel">
        {/* Subject header */}
        <div className="sub-header">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'var(--blue-soft)', color:'var(--blue-mid)', fontSize:14, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {abbr}
            </div>
            <div>
              <div className="sub-header-name" style={{ marginBottom:0 }}>{data.name || sub}</div>
              <div style={{ fontSize:11, color:'var(--t3)', marginTop:1 }}>{completed}/{total} topics completed</div>
            </div>
            <div style={{ marginLeft:'auto', textAlign:'right' }}>
              <div style={{ fontSize:20, fontWeight:800, color:'var(--blue-mid)', letterSpacing:-0.4 }}>{data.overallScore || 0}%</div>
              <div style={{ fontSize:10, color:'var(--t3)' }}>Last test score</div>
            </div>
          </div>
          <PBar value={data.overallScore} />
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom:14 }}>
          {tabs.map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}
              style={{ display:'flex', alignItems:'center', gap:5 }}>
              <t.Icon />{t.label}
            </button>
          ))}
        </div>

        {/* ── TOPICS & NOTES ── */}
        {tab === 'notes' && (
          <div>
            {(data.topics || []).map((topic, i) => (
              <div key={i} className={`topic-row ${topic.status === 'completed' ? 'done' : ''}`}>
                <div className="topic-l">
                  <span className={`t-dot ${topic.status === 'completed' ? 'done' : 'pend'}`}/>
                  <div style={{ flex:1 }}>
                    <div className="t-name">{topic.name}</div>
                    {(topic.difficulty || topic.importance) && (
                      <div style={{ display:'flex', gap:5, marginTop:4 }}>
                        {topic.difficulty && <span className={`diff-badge diff-${topic.difficulty.toLowerCase()}`}>{topic.difficulty}</span>}
                        {topic.importance && <span className={`imp-badge imp-${topic.importance.toLowerCase()}`}>{topic.importance}</span>}
                      </div>
                    )}
                    {editNote === topic.name ? (
                      <div className="note-row">
                        <input className="note-inp" value={noteText} autoFocus
                          onChange={e => setNoteText(e.target.value)}
                          placeholder="Add personal notes here..." />
                        <button className="btn-sm p" onClick={() => { saveNote(sub, topic.name, noteText); setEditNote(null); }}>Save</button>
                        <button className="btn-sm g" onClick={() => setEditNote(null)}><IcoClose /></button>
                      </div>
                    ) : topic.studentNotes ? (
                      <div className="t-note" style={{ display:'flex', alignItems:'center', gap:4 }}><IcoNote /> {topic.studentNotes}</div>
                    ) : null}
                  </div>
                </div>
                <div className="topic-r">
                  <button className="btn-sm g" onClick={() => { setEditNote(topic.name); setNoteText(topic.studentNotes || ''); }}
                    style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <IcoEdit /> {topic.studentNotes ? 'Edit' : 'Note'}
                  </button>
                  <button
                    className={`btn-sm ${topic.status === 'completed' ? 'ok' : 'p'}`}
                    onClick={() => markTopic(sub, topic.name, topic.status === 'completed' ? 'pending' : 'completed')}
                    style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <IcoCheck /> {topic.status === 'completed' ? 'Done' : 'Mark Done'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PDF MATERIALS ── */}
        {tab === 'materials' && (
          <div>
            {subNotes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon" style={{ display:'flex', justifyContent:'center', marginBottom:10 }}><IcoPDF /></div>
                <p style={{ fontSize:15, fontWeight:600, marginBottom:5 }}>No PDF materials yet</p>
                <p style={{ fontSize:13, color:'var(--t3)' }}>Admin will upload PDF notes here for {sub}.</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize:13, color:'var(--t2)', marginBottom:14 }}>
                  {subNotes.length} PDF{subNotes.length !== 1 ? 's' : ''} available for {sub}
                </p>
                {subNotes.map((note, i) => (
                  <div key={i} className="pdf-item">
                    <div className="pdf-icon-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}><IcoPDF /></div>
                    <div className="pdf-info">
                      <div className="pdf-title">{note.title}</div>
                      <div className="pdf-meta">
                        Topic: <strong>{note.topic}</strong> · {note.uploadedOn}
                        {note.pdfName && ` · ${note.pdfName}`}
                      </div>
                      {note.description && <div style={{ fontSize:12, color:'var(--t2)', marginTop:4 }}>{note.description}</div>}
                      {note.tags && (
                        <div style={{ display:'flex', gap:5, marginTop:5, flexWrap:'wrap' }}>
                          {note.tags.split(',').map((tag, ti) => (
                            <span key={ti} className="bdg bdg-blue" style={{ fontSize:11 }}>{tag.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="pdf-actions">
                      {note.pdfData ? (
                        <>
                          <button className="btn-sm p" onClick={() => setViewingPdf(note)} style={{ display:'flex', alignItems:'center', gap:4 }}>
                            <IcoEye /> View
                          </button>
                          <a href={note.pdfData} download={note.pdfName || `${note.title}.pdf`} className="btn-sm g" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                            <IcoDL /> Download
                          </a>
                        </>
                      ) : (
                        <span style={{ fontSize:12, color:'var(--t3)' }}>No file</span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── MINI TEST ── */}
        {tab === 'minitest' && (
          <MiniTest subject={sub} adminTests={subTests} onSave={(r) => saveTestResult(sub, r)} />
        )}

        {/* ── WEAK TOPICS ── */}
        {tab === 'weak' && (
          <div>
            {!data.weakTopics?.length ? (
              <div className="empty-state" style={{ color:'#16a34a' }}>
                <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}><IcoCheck /></div>
                <p style={{ fontSize:15, fontWeight:600 }}>No weak topics in {sub}!</p>
                <p style={{ fontSize:13, color:'var(--t3)', marginTop:5 }}>All topics are at 60% or above.</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize:13, color:'var(--t2)', marginBottom:14 }}>
                  These topics need attention — below 60% or not yet completed.
                </p>
                {data.weakTopics.slice(0, 10).map((t, i) => (
                  <div key={i} className="topic-row" style={{ borderLeft:'3px solid #d97706' }}>
                    <div style={{ flex:1, display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ color:'#d97706' }}><IcoWarn /></span>
                      <span style={{ fontSize:14, fontWeight:600 }}>{t}</span>
                    </div>
                    <button className="btn-sm p" onClick={() => setTab('minitest')} style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <IcoBrain /> Take Test
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {viewingPdf && <PdfViewer note={viewingPdf} onClose={() => setViewingPdf(null)} />}
    </div>
  );
}

/* ── MAIN EXPORT ─────────────────────────────────────────── */
export default function Study({ onNav, initialSubject }) {
  const { user } = useAuth();
  const { studyData, activeSubject, setActiveSubject, markTopic, saveNote, saveTestResult, syncSubjectsFromAdmin } = useStudy();
  // null = show grid, string = show subject detail
  const [selected, setSelected] = useState(initialSubject || null);

  useEffect(() => {
    syncSubjectsFromAdmin();
    if (initialSubject) {
      setSelected(initialSubject);
      setActiveSubject(initialSubject);
    }
  }, []);

  const handleSelect = (name) => {
    setSelected(name);
    setActiveSubject(name);
  };

  const handleBack = () => {
    setSelected(null);
  };

  const sub  = selected || activeSubject;
  const data = sub ? studyData[sub] : null;

  if (Object.keys(studyData).length === 0) {
    return (
      <>
        <Topbar title="Study" studyData={studyData} onNav={onNav} />
        <div style={{ padding:44, textAlign:'center', color:'var(--t3)', fontSize:15 }}>
          No subjects available yet. Ask your admin to add subjects.
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Study" studyData={studyData} onNav={onNav} />

      {/* STEP 1: Subject grid */}
      {!selected && (
        <div style={{ flex:1, overflowY:'auto' }}>
          <SubjectGrid studyData={studyData} onSelect={handleSelect} />
        </div>
      )}

      {/* STEP 2: Subject detail (topics, notes, test, etc.) */}
      {selected && data && (
        <SubjectDetail
          sub={sub}
          data={data}
          studyData={studyData}
          onBack={handleBack}
          onSelectSubject={handleSelect}
          markTopic={markTopic}
          saveNote={saveNote}
          saveTestResult={saveTestResult}
        />
      )}

      {selected && !data && (
        <div style={{ padding:40, textAlign:'center', color:'var(--t3)' }}>
          Subject not found. <button style={{ color:'var(--blue-mid)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }} onClick={handleBack}>Go back</button>
        </div>
      )}
    </>
  );
}
