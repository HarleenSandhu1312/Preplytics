import { useState } from 'react';
import Topbar from '../../shared/Topbar';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { storage } from '../../utils/storage';
import { calcOverall, isCertUnlocked, calcStreakFromDateStrings } from '../../utils/analytics';

/* SVG icons */
const IcoEdit    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoAward   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoFire    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const IcoTarget  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue-mid)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IcoCheck   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoClip    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoLock    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoBolt    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

export default function Profile({ onNav }) {
  const { user, updateUser } = useAuth();
  const { studyData } = useStudy();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', examTarget: user?.examTarget || '',
    branch: user?.branch || '', dailyGoal: user?.dailyGoal || 2, phone: user?.phone || '',
  });

  const overall = calcOverall(studyData);
  const allTests = Object.values(studyData).flatMap(d => (d.miniTests || []).filter(t => t.submitted));
  const completedTopics = Object.values(studyData).reduce((s, d) => s + ((d.topics || []).filter(t => t.status === 'completed').length), 0);
  const totalTopics     = Object.values(studyData).reduce((s, d) => s + ((d.topics || []).length), 0);
  const actLog = storage.getActivityLog().slice(0, 8);
  const streak = user?.progress?.streak ?? 0;

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' })
    : 'Member';

  const save = () => { updateUser(form); setEditing(false); };

  return (
    <>
      <Topbar title="My Profile" studyData={studyData} onNav={onNav} />
      <div className="page-full">

        {/* ── PROFILE HEADER ── */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'24px 28px', marginBottom:16, boxShadow:'var(--sh)', display:'flex', alignItems:'flex-start', gap:20, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, background:'radial-gradient(circle,rgba(37,99,200,0.06),transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#1e2d4a,#2563c8)', color:'#fff', fontSize:26, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 16px rgba(37,99,200,0.28)' }}>
            {user?.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:4, flexWrap:'wrap' }}>
              <h2 style={{ fontSize:20, fontWeight:800, letterSpacing:-0.4 }}>{user?.name}</h2>
              <span style={{ background:'rgba(37,99,200,0.1)', color:'var(--blue-mid)', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:99, textTransform:'uppercase', letterSpacing:0.5 }}>
                {user?.role === 'admin' ? 'Administrator' : 'Student'}
              </span>
            </div>
            <div style={{ fontSize:13, color:'var(--t2)', marginBottom:9 }}>{user?.email}</div>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {user?.examTarget && <span style={{ background:'var(--blue-soft)', color:'var(--blue)', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:99 }}>{user.examTarget}</span>}
              {user?.branch && <span style={{ background:'var(--blue-soft)', color:'var(--blue)', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:99 }}>{user.branch}</span>}
              {user?.semester && <span style={{ background:'var(--blue-soft)', color:'var(--blue)', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:99 }}>Sem {user.semester}</span>}
              <span style={{ background:'var(--panel)', color:'var(--t3)', fontSize:11, padding:'3px 10px', borderRadius:99, border:'1px solid var(--border)' }}>Joined {joinDate}</span>
            </div>
          </div>
          <button className="btn btn-p" style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }} onClick={() => setEditing(e => !e)}>
            <IcoEdit /> {editing ? 'Cancel' : 'Edit Profile'}
          </button>
          <button className="btn btn-g" style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }} onClick={() => onNav('settings')}>
            <IcoLock /> Update Password
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="card card-p" style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}><IcoEdit /> Edit Profile</div>
            <div className="form-grid">
              <div className="ff"><label>Full Name</label><input className="finp" value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></div>
              <div className="ff"><label>Phone</label><input className="finp" placeholder="+91 XXXXXXXXXX" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} /></div>
              <div className="ff"><label>Exam Target</label>
                <select className="finp" value={form.examTarget} onChange={e => setForm({...form, examTarget:e.target.value})}>
                  <option value="">Select...</option>
                  <option>GATE</option><option>Semester Exam</option><option>Placement Prep</option><option>Other</option>
                </select>
              </div>
              <div className="ff"><label>Branch</label>
                <select className="finp" value={form.branch} onChange={e => setForm({...form, branch:e.target.value})}>
                  <option value="">Select...</option>
                  <option>CSE</option><option>IT</option><option>ECE</option><option>Mechanical</option>
                </select>
              </div>
              <div className="ff"><label>Daily Goal (hrs)</label><input className="finp" type="number" min="1" max="12" value={form.dailyGoal} onChange={e => setForm({...form, dailyGoal:e.target.value})} /></div>
            </div>
            <div className="form-actions"><button className="btn btn-p" onClick={save}>Save Changes</button></div>
          </div>
        )}

        {/* ── STAT CARDS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
          {[
            { Icon:IcoFire,   label:'Study Streak',   val:`${streak}`, unit:'days', bg:'#fff7ed' },
            { Icon:IcoTarget, label:'Overall Score',  val:`${overall}`,           unit:'%',    bg:'#eff6ff' },
            { Icon:IcoCheck,  label:'Topics Done',    val:`${completedTopics}`,   unit:`/${totalTopics}`, bg:'#f0fdf4' },
            { Icon:IcoClip,   label:'Tests Taken',    val:`${allTests.length}`,   unit:'total', bg:'#faf5ff' },
          ].map((s, i) => (
            <div key={i} className="db-stat-card" style={{ background:s.bg }}>
              <div className="db-stat-icon" style={{ background:'transparent' }}><s.Icon /></div>
              <div>
                <div className="db-stat-val">{s.val}<span className="db-stat-unit">{s.unit}</span></div>
                <div className="db-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── 2-col: progress + certificates ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          {/* Study Progress */}
          <div className="card card-p">
            <div style={{ fontSize:14, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--blue-mid)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
              Study Progress
            </div>
            {Object.entries(studyData).length === 0
              ? <div style={{ fontSize:13, color:'var(--t3)', textAlign:'center', padding:'20px 0' }}>No subjects yet</div>
              : Object.entries(studyData).map(([name, d]) => {
                  const topics = d.topics || [];
                  const pct = topics.length > 0 ? Math.round((topics.filter(t => t.status === 'completed').length / topics.length) * 100) : 0;
                  const abbr = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
                  return (
                    <div key={name} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <span style={{ width:22, height:22, borderRadius:6, background:'var(--blue-soft)', color:'var(--blue-mid)', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{abbr}</span>
                          <span style={{ fontSize:13, fontWeight:600 }}>{name}</span>
                        </div>
                        <span style={{ fontSize:12, fontWeight:700, color: pct >= 70 ? '#16a34a' : pct >= 40 ? 'var(--blue-mid)' : 'var(--yellow)' }}>{pct}%</span>
                      </div>
                      <div style={{ height:5, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', borderRadius:99, background: pct >= 70 ? '#16a34a' : pct >= 40 ? 'var(--blue-mid)' : '#d97706', transition:'width .5s' }}/>
                      </div>
                    </div>
                  );
                })
            }
          </div>

          {/* Certificates */}
          <div className="card card-p">
            <div style={{ fontSize:14, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:7, justifyContent:'space-between' }}>
              <span style={{ display:'flex', alignItems:'center', gap:7 }}><IcoAward /> Certificates</span>
              <button onClick={() => onNav('certificates')} style={{ fontSize:11, fontWeight:700, color:'var(--blue-mid)', background:'none', border:'none', cursor:'pointer' }}>See all →</button>
            </div>
            {Object.entries(studyData).length === 0
              ? <div style={{ fontSize:13, color:'var(--t3)', textAlign:'center', padding:'20px 0' }}>No subjects yet</div>
              : Object.entries(studyData).map(([name, d]) => {
                  const topics = d.topics || [];
                  const topicPct = topics.length > 0 ? Math.round((topics.filter(t => t.status === 'completed').length / topics.length) * 100) : 0;
                  const tests = (d.miniTests || []).filter(t => t.submitted);
                  const lastScore = tests.length ? tests[tests.length - 1].score : 0;
                  const unlocked = isCertUnlocked(d);
                  return (
                    <div key={name} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ width:32, height:32, borderRadius:8, background: unlocked ? 'rgba(22,163,74,0.1)' : 'var(--panel)', display:'flex', alignItems:'center', justifyContent:'center', color: unlocked ? '#16a34a' : 'var(--t3)', flexShrink:0 }}>
                        {unlocked ? <IcoAward /> : <IcoLock />}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, marginBottom:1 }}>{name}</div>
                        <div style={{ fontSize:11, color:'var(--t3)' }}>
                          {unlocked
                            ? `Last test: ${lastScore}%`
                            : topicPct < 100 ? `${topicPct}% complete` : `Need test >70% (got ${lastScore}%)`
                          }
                        </div>
                      </div>
                      {unlocked
                        ? <span style={{ fontSize:10, fontWeight:700, background:'rgba(22,163,74,0.1)', color:'#16a34a', padding:'2px 8px', borderRadius:99 }}>Earned</span>
                        : <button onClick={() => onNav('study', name)} style={{ fontSize:11, fontWeight:600, color:'var(--blue-mid)', background:'none', border:'none', cursor:'pointer' }}>Study →</button>
                      }
                    </div>
                  );
                })
            }
          </div>
        </div>

        {/* ── ACTIVITY ── */}
        <div className="card card-p">
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14, display:'flex', alignItems:'center', gap:7 }}>
            <IcoBolt /> Recent Activity
          </div>
          {actLog.length === 0
            ? <div style={{ fontSize:13, color:'var(--t3)', textAlign:'center', padding:'20px 0' }}>No activity yet. Start studying!</div>
            : actLog.map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'9px 0', borderBottom: i < actLog.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--blue-mid)', marginTop:5, flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:500 }}>{item.msg}</div>
                  <div style={{ fontSize:11, color:'var(--t3)', marginTop:1 }}>{item.time}</div>
                </div>
              </div>
            ))
          }
          </div>
    </div>
    </>
  );
}
