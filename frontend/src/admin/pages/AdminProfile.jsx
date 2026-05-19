import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Topbar from '../../shared/Topbar';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
import { calcOverall } from '../../utils/analytics';

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export default function AdminProfile({ onNav }) {
  const [students, setStudents] = useState([]);
  useEffect(() => {
    api.get('/admin/users').then(res => setStudents((res.data.data || []).filter(u => u.role !== 'admin'))).catch(() => {});
  }, []);
  const { user } = useAuth();

  const subjects = storage.getSubjects() || {};
  const notes    = storage.getNotes()    || [];
  const tests    = storage.getTests()    || [];
  const actLog   = storage.getActivityLog();
  const totalTopics = Object.values(storage.getTopics() || {}).reduce((s, ts) => s + ts.length, 0);

  const avgScore = (() => {
    const scores = students.map(s => { const d = storage.getStudy(s.email); return d ? calcOverall(d) : 0; }).filter(x => x > 0);
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  })();

  const stats = [
    { icon:<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/></svg>, label:'Total Students', val: students.length, color:'#2563c8', bg:'rgba(37,99,200,0.08)' },
    { icon:<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z'/><path d='M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'/></svg>, label:'Total Subjects', val: Object.keys(subjects).length, color:'#7c3aed', bg:'rgba(124,58,237,0.08)' },
    { icon:<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/></svg>, label:'Notes Uploaded', val: notes.length, color:'#0e9f6e', bg:'rgba(14,159,110,0.08)' },
    { icon:<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='9 11 12 14 22 4'/><path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'/></svg>, label:'Tests Created', val: tests.length, color:'#e11d48', bg:'rgba(225,29,72,0.08)' },
    { icon:<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'/></svg>, label:'Total Topics', val: totalTopics, color:'#d97706', bg:'rgba(217,119,6,0.08)' },
    { icon:<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='18' y1='20' x2='18' y2='10'/><line x1='12' y1='20' x2='12' y2='4'/><line x1='6' y1='20' x2='6' y2='14'/><line x1='2' y1='20' x2='22' y2='20'/></svg>, label:'Avg Student Score', val:`${avgScore}%`, color:'#2563c8', bg:'rgba(37,99,200,0.08)' },
  ];

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long' })
    : 'Platform Admin';

  return (
    <>
      <Topbar title="Admin Profile" onNav={onNav} />
      <div className="page-full">

        {/* Header card */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginBottom:16, boxShadow:'var(--sh)', display:'flex', alignItems:'flex-start', gap:24, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-50, right:-50, width:220, height:220, background:'radial-gradient(circle,rgba(37,99,200,0.06),transparent 70%)', pointerEvents:'none' }}/>
          {/* Avatar */}
          <div style={{ width:80, height:80, borderRadius:20, background:'linear-gradient(135deg,#0f1d35,#1a4fa8)', color:'#fff', fontSize:28, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 8px 24px rgba(26,79,168,0.35)' }}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5, flexWrap:'wrap' }}>
              <h2 style={{ fontSize:22, fontWeight:800, letterSpacing:-0.4 }}>{user?.name}</h2>
              <span style={{ background:'rgba(37,99,200,0.12)', color:'var(--blue-mid)', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:99, textTransform:'uppercase', letterSpacing:0.5, display:'flex', alignItems:'center', gap:4 }}>
                <ShieldIcon /> Administrator
              </span>
            </div>
            <div style={{ fontSize:13, color:'var(--t2)', marginBottom:8 }}>{user?.email}</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ background:'var(--blue-soft)', color:'var(--blue)', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:99 }}>PrepLytics Admin</span>
              <span style={{ background:'var(--panel)', color:'var(--t3)', fontSize:11, fontWeight:500, padding:'3px 10px', borderRadius:99, border:'1px solid var(--border)' }}>Since {joinDate}</span>
              <span style={{ background:'rgba(22,163,74,0.1)', color:'#16a34a', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:99 }}>● Active</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'18px 20px', boxShadow:'var(--sh)', display:'flex', alignItems:'center', gap:14, transition:'transform .15s,box-shadow .15s' }}>
              <div style={{ width:48, height:48, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:24, fontWeight:800, letterSpacing:-0.4, color:s.color, lineHeight:1, marginBottom:3 }}>{s.val}</div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', textTransform:'uppercase', letterSpacing:0.4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Platform overview + activity */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {/* Student performance table */}
          <div className="card card-p">
            <div style={{ fontSize:14, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/></svg> Student Overview
              <button onClick={() => onNav('analytics')} style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color:'var(--blue)', background:'none', border:'none', cursor:'pointer' }}>View All →</button>
            </div>
            {students.length === 0
              ? <div style={{ fontSize:13, color:'var(--t3)', textAlign:'center', padding:'20px 0' }}>No students registered yet</div>
              : students.slice(0, 6).map((s, i) => {
                  const d = storage.getStudy(s.email);
                  const sc = d ? calcOverall(d) : 0;
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--blue-soft)', color:'var(--blue-mid)', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {s.name[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{s.name}</div>
                        <div style={{ fontSize:11, color:'var(--t3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.email}</div>
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, padding:'2px 9px', borderRadius:99, background: sc >= 70 ? 'rgba(22,163,74,0.1)' : sc >= 40 ? 'rgba(37,99,200,0.09)' : 'rgba(217,119,6,0.1)', color: sc >= 70 ? '#16a34a' : sc >= 40 ? 'var(--blue-mid)' : '#d97706' }}>
                        {sc > 0 ? `${sc}%` : '—'}
                      </span>
                    </div>
                  );
                })
            }
          </div>

          {/* Recent admin activity */}
          <div className="card card-p">
            <div style={{ fontSize:14, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/></svg> Recent Activity
            </div>
            {actLog.length === 0
              ? <div style={{ fontSize:13, color:'var(--t3)', textAlign:'center', padding:'20px 0' }}>No activity yet</div>
              : actLog.slice(0, 8).map((item, i) => {
                const msg = item && typeof item === 'object' ? item.msg : item;
                const time = item && typeof item === 'object' ? item.time : '';
                return (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'9px 0', borderBottom: i < Math.min(actLog.length, 8) - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--blue-mid)', marginTop:5, flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:'var(--t1)', lineHeight:1.5 }}>{msg}</div>
                    {time ? <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>{time}</div> : null}
                  </div>
                </div>
              )})
            }
          </div>
        </div>

        {/* Quick actions */}
        <div className="card card-p" style={{ marginTop:14 }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Quick Actions</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {[
              { label:'Add Subject', page:'subjects', icon:'subj' },
              { label:'Upload Notes', page:'notes', icon:'notes' },
              { label:'Create Test', page:'tests', icon:'test' },
              { label:'View Analytics', page:'analytics', icon:'anly' },
            ].map(a => (
              <button key={a.page} onClick={() => onNav(a.page)} style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 16px', background:'var(--blue-soft)', border:'1.5px solid rgba(37,99,200,0.2)', borderRadius:'var(--r-sm)', fontSize:13, fontWeight:600, color:'var(--blue-mid)', cursor:'pointer', fontFamily:'inherit', transition:'.13s' }}>
                {a.label}
              </button>
            ))}
            </div>
            </div>
            
    </div>
    </>
  );
}
