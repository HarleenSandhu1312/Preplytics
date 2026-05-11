import { useState } from 'react';
import Topbar from '../../shared/Topbar';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { calcAvgTestScore, isCertUnlocked } from '../../utils/analytics';

const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const AwardIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

function downloadCertificate({ studentName, subject, avgScore, completedTopics, totalTopics, issueDate }) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;

  const html = `
    <html>
      <head>
        <title>Certificate - ${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; background: #f5f7fb; }
          .wrap { max-width: 900px; margin: 24px auto; background: #fff; border: 1px solid #dbe3ef; border-radius: 18px; overflow: hidden; }
          .head { background: linear-gradient(135deg,#1e2d4a 0%,#2563c8 100%); color: #fff; text-align: center; padding: 36px 24px; }
          .title { letter-spacing: 2px; font-size: 12px; opacity: 0.85; text-transform: uppercase; }
          .brand { font-size: 36px; font-weight: 800; margin-top: 8px; }
          .body { padding: 40px 28px; text-align: center; color: #12233d; }
          .name { font-size: 30px; font-weight: 700; margin: 12px 0; }
          .subj { display: inline-block; padding: 12px 22px; border-radius: 10px; border: 2px solid #c8daf7; background: #edf4ff; font-size: 28px; font-weight: 800; color: #2563c8; margin: 12px 0 20px; }
          .stats { display: flex; justify-content: center; gap: 34px; margin: 20px 0 8px; }
          .stat b { display: block; font-size: 28px; color: #2563c8; }
          .stat span { font-size: 12px; color: #556b86; }
          .foot { margin-top: 24px; font-size: 13px; color: #4c607a; }
          @media print { body { background: #fff; } .wrap { margin: 0; border: none; border-radius: 0; } }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="head">
            <div class="title">Certificate Of Completion</div>
            <div class="brand">PrepLytics</div>
          </div>
          <div class="body">
            <div>This certifies that</div>
            <div class="name">${studentName}</div>
            <div>has successfully completed the course</div>
            <div class="subj">${subject}</div>
            <div class="stats">
              <div class="stat"><b>${avgScore}%</b><span>Avg Test Score</span></div>
              <div class="stat"><b>${completedTopics}/${totalTopics}</b><span>Topics Completed</span></div>
              <div class="stat"><b>${new Date(issueDate).getFullYear()}</b><span>Year</span></div>
            </div>
            <div class="foot">Issued on ${issueDate}</div>
          </div>
        </div>
      </body>
    </html>
  `;

  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

function CertificateModal({ studentName, subject, data, onClose }) {
  const completedTopics = data.topics?.filter(t => t.status === 'completed').length || 0;
  const totalTopics = data.topics?.length || 0;
  const tests = (data.miniTests || []).filter(t => t.submitted);
  const avgScore = tests.length ? Math.round(tests.reduce((s, t) => s + t.score, 0) / tests.length) : 0;
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.60)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={onClose}>
      <div style={{ background:'#ffffff', borderRadius:20, width:'100%', maxWidth:820, overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,0.25)', border:'1px solid #dbe5f4' }} onClick={e => e.stopPropagation()}>
        {/* Certificate header */}
        <div style={{ background:'linear-gradient(135deg,#0f2b5b 0%,#2563c8 100%)', padding:'30px 40px', textAlign:'center', position:'relative' }}>
          <div style={{ position:'absolute', top:16, right:16 }}>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:30, height:30, borderRadius:'50%', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
            <div style={{ width:56, height:56, background:'rgba(255,255,255,0.18)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
              <AwardIcon />
            </div>
          </div>
          <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.75)', textTransform:'uppercase', letterSpacing:3, marginBottom:6 }}>Certificate Of Completion</div>
          <div style={{ fontSize:34, fontWeight:800, color:'#fff', letterSpacing:-0.4 }}>PrepLytics</div>
        </div>

        {/* Certificate body */}
        <div style={{ padding:'36px 44px', textAlign:'center', background:'linear-gradient(180deg,#ffffff 0%,#f6f9ff 100%)' }}>
          <div style={{ fontSize:13, color:'#4e6484', marginBottom:10, letterSpacing:0.2 }}>This certifies that</div>
          <div style={{ fontSize:36, fontWeight:800, color:'#0f2b5b', marginBottom:8, letterSpacing:-0.6 }}>{studentName}</div>
          <div style={{ fontSize:14, color:'#4e6484', marginBottom:20 }}>has successfully completed the subject</div>
          <div style={{ background:'#edf4ff', border:'2px solid #bcd3f8', borderRadius:12, padding:'12px 28px', display:'inline-block', marginBottom:26 }}>
            <div style={{ fontSize:28, fontWeight:800, color:'#1d4ed8', letterSpacing:0.3 }}>{subject}</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:26 }}>
            <div style={{ textAlign:'center', background:'#fff', border:'1px solid #dbe5f4', borderRadius:10, padding:'12px 8px' }}>
              <div style={{ fontSize:28, fontWeight:800, color:'#1d4ed8' }}>{avgScore}%</div>
              <div style={{ fontSize:11, color:'#5d7392' }}>Avg Test Score</div>
            </div>
            <div style={{ textAlign:'center', background:'#fff', border:'1px solid #dbe5f4', borderRadius:10, padding:'12px 8px' }}>
              <div style={{ fontSize:28, fontWeight:800, color:'#1d4ed8' }}>{completedTopics}/{totalTopics}</div>
              <div style={{ fontSize:11, color:'#5d7392' }}>Topics Completed</div>
            </div>
            <div style={{ textAlign:'center', background:'#fff', border:'1px solid #dbe5f4', borderRadius:10, padding:'12px 8px' }}>
              <div style={{ fontSize:28, fontWeight:800, color:'#1d4ed8' }}>{today.split(' ').pop()}</div>
              <div style={{ fontSize:11, color:'#5d7392' }}>Year</div>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', gap:16, alignItems:'center', marginBottom:22 }}>
            <div style={{ textAlign:'left', flex:1 }}>
              <div style={{ width:180, borderTop:'1.5px solid #8aa7d1', marginBottom:4 }} />
              <div style={{ fontSize:11, color:'#5d7392' }}>Issued by PrepLytics</div>
            </div>
            <div style={{ fontSize:12, color:'#5d7392', fontWeight:600 }}>Issued on {today}</div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <button
              onClick={() => downloadCertificate({
                studentName,
                subject,
                avgScore,
                completedTopics,
                totalTopics,
                issueDate: today,
              })}
              style={{ padding:'10px 20px', background:'#ffffff', border:'1.5px solid #cddbf1', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:'#123c75' }}>
              <DownloadIcon /> Download PDF
            </button>
            <button onClick={onClose} style={{ padding:'10px 20px', background:'#2d72e0', border:'none', borderRadius:9, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer' }}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Certificates({ onNav }) {
  const { user } = useAuth();
  const { studyData } = useStudy();
  const [viewSubject, setViewSubject] = useState(null);

  const certificates = Object.entries(studyData).map(([name, data]) => {
    const topics = data.topics || [];
    const completedTopics = topics.filter(t => t.status === 'completed').length;
    const totalTopics = topics.length;
    const completionPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const avgTestScore = calcAvgTestScore(data);
    const isUnlocked = isCertUnlocked(data);
    return { name, data, completionPct, avgTestScore, isUnlocked, completedTopics, totalTopics, icon: '' };
  });

  const unlocked = certificates.filter(c => c.isUnlocked);
  const locked = certificates.filter(c => !c.isUnlocked);

  return (
    <>
      <Topbar title="Certificates" studyData={studyData} onNav={onNav} />
      <div className="page-full">

        {/* Summary */}
        <div style={{ display:'flex', gap:12, marginBottom:24 }}>
          {[
            { label:'Total Subjects', val: certificates.length, color:'#2563c8', bg:'rgba(37,99,200,0.08)' },
            { label:'Certificates Earned', val: unlocked.length, color:'#16a34a', bg:'rgba(22,163,74,0.08)' },
            { label:'In Progress', val: locked.length, color:'#d97706', bg:'rgba(217,119,6,0.08)' },
          ].map((s, i) => (
            <div key={i} style={{ flex:1, background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'16px 18px', boxShadow:'var(--sh)' }}>
              <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', textTransform:'uppercase', letterSpacing:0.4, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Unlocked */}
        {unlocked.length > 0 && (
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:15, fontWeight:800, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> Earned Certificates
              <span style={{ background:'rgba(22,163,74,0.1)', color:'#16a34a', fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:99 }}>{unlocked.length}</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {unlocked.map(c => (
                <div key={c.name} style={{ background:'var(--card)', border:'1.5px solid rgba(22,163,74,0.3)', borderRadius:'var(--r)', padding:'18px 22px', display:'flex', alignItems:'center', gap:18, boxShadow:'0 2px 12px rgba(22,163,74,0.08)', transition:'transform .15s,box-shadow .15s', cursor:'default' }}>
                  {/* Badge */}
                  <div style={{ width:54, height:54, background:'linear-gradient(135deg,#1e2d4a,#2563c8)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(37,99,200,0.3)' }}>
                    <span style={{ fontSize:26 }}>{c.icon}</span>
                  </div>
                  {/* Info */}
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:15, fontWeight:700 }}>{c.name}</span>
                      <span style={{ background:'rgba(22,163,74,0.1)', color:'#16a34a', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99 }}>✓ Earned</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--t3)', marginBottom:8 }}>
                      {c.completedTopics}/{c.totalTopics} topics · Avg Score: {c.avgTestScore}%
                    </div>
                    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                      <div style={{ flex:1, height:5, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                        <div style={{ width:`${c.completionPct}%`, height:'100%', background:'#16a34a', borderRadius:99 }}/>
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, color:'#16a34a', minWidth:32 }}>100%</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button onClick={() => setViewSubject(c)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'rgba(37,99,200,0.08)', border:'1.5px solid rgba(37,99,200,0.2)', borderRadius:9, fontSize:12, fontWeight:600, color:'var(--blue-mid)', cursor:'pointer' }}>
                      <EyeIcon /> View
                    </button>
                    <button
                      onClick={() => downloadCertificate({
                        studentName: user?.name || 'Student',
                        subject: c.name,
                        avgScore: c.avgTestScore,
                        completedTopics: c.completedTopics,
                        totalTopics: c.totalTopics,
                        issueDate: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
                      })}
                      style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'var(--blue-btn)', border:'none', borderRadius:9, fontSize:12, fontWeight:600, color:'#fff', cursor:'pointer' }}>
                      <DownloadIcon /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <div style={{ fontSize:15, fontWeight:800, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Locked Certificates
              <span style={{ background:'rgba(217,119,6,0.1)', color:'#d97706', fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:99 }}>{locked.length}</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {locked.map(c => (
                <div key={c.name} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'18px 22px', display:'flex', alignItems:'center', gap:18, boxShadow:'var(--sh)', opacity:0.85 }}>
                  {/* Icon faded */}
                  <div style={{ width:54, height:54, background:'var(--panel)', border:'2px dashed var(--border2)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--t3)' }}>
                    <LockIcon />
                  </div>
                  {/* Info */}
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:15, fontWeight:700 }}>{c.icon} {c.name}</span>
                      <span style={{ background:'var(--panel)', color:'var(--t3)', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, border:'1px solid var(--border)' }}>Locked</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--t3)', marginBottom:8 }}>
                      Complete course to unlock · {c.completedTopics}/{c.totalTopics} topics done
                      {c.avgTestScore > 0 && ` · Avg score: ${c.avgTestScore}%`}
                    </div>
                    {/* Requirements */}
                    <div style={{ display:'flex', gap:12, marginBottom:8 }}>
                      <span style={{ fontSize:11, display:'flex', alignItems:'center', gap:4, color: c.completionPct === 100 ? '#16a34a' : 'var(--t2)' }}>
                        {c.completionPct === 100 ? '✓' : '○'} 100% topics ({c.completionPct}% done)
                      </span>
                      <span style={{ fontSize:11, display:'flex', alignItems:'center', gap:4, color: c.avgTestScore >= 70 ? '#16a34a' : 'var(--t2)' }}>
                        {c.avgTestScore >= 70 ? '✓' : '○'} Test score ≥70% ({c.avgTestScore > 0 ? `${c.avgTestScore}%` : 'not attempted'})
                      </span>
                    </div>
                    <div style={{ flex:1, height:5, background:'var(--border)', borderRadius:99, overflow:'hidden', maxWidth:320 }}>
                      <div style={{ width:`${c.completionPct}%`, height:'100%', background: c.completionPct >= 70 ? 'var(--yellow)' : 'var(--blue-mid)', borderRadius:99 }}/>
                    </div>
                  </div>
                  <button onClick={() => onNav('study', c.name)} style={{ padding:'9px 16px', background:'var(--blue-soft)', border:'1.5px solid rgba(37,99,200,0.2)', borderRadius:9, fontSize:12, fontWeight:600, color:'var(--blue-mid)', cursor:'pointer', flexShrink:0 }}>
                    Continue →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {certificates.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--t3)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>No subjects yet</div>
            <div style={{ fontSize:13 }}>Start studying to earn certificates</div>
          </div>
        )}
      </div>

      {viewSubject && (
        <CertificateModal
          studentName={user?.name || 'Student'}
          subject={viewSubject.name}
          data={viewSubject.data}
          onClose={() => setViewSubject(null)}
        />
      )}
    </>
  );
}
