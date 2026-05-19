import { useState, useEffect } from 'react';
import Topbar from '../../shared/Topbar';
import { storage } from '../../utils/storage';
import { calcOverall } from '../../utils/analytics';
import api from '../../utils/api';

export default function AdminDashboard({ onNav }) {
  const subjects    = storage.getSubjects() || {};
  const topics      = storage.getTopics()   || {};
  const notes       = storage.getNotes()    || [];
  const tests       = storage.getTests()    || [];
  const actLog      = storage.getActivityLog();
  const totalTopics = Object.values(topics).reduce((s, ts) => s + ts.length, 0);

  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get('/admin/users').then(res => {
      setStudents((res.data.data || []).filter(u => u.role !== 'admin'));
    }).catch(() => {});
  }, []);

  const avgPerf = (() => {
    const scores = [];
    students.forEach(u => {
      const d = storage.getStudy(u.email);
      if (d) scores.push(calcOverall(d));
    });
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  })();

  const belowFifty = students.filter(u => {
    const d = storage.getStudy(u.email);
    return d && calcOverall(d) > 0 && calcOverall(d) < 50;
  });

  const stats = [
    { svgIcon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, val: Object.keys(subjects).length, lbl: 'Total Subjects' },
    { svgIcon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>, val: totalTopics, lbl: 'Total Topics' },
    { svgIcon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, val: notes.length, lbl: 'Notes Files' },
    { svgIcon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, val: tests.length, lbl: 'Tests Created' },
    { svgIcon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, val: students.length, lbl: 'Students' },
    { svgIcon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>, val: `${avgPerf}%`, lbl: 'Avg Performance' },
  ];

  return (
    <>
      <Topbar title="Admin Dashboard" onNav={onNav} />
      <div className="page-full">
        <div className="admin-stat-grid">
          {stats.map((s, i) => (
            <div key={i} className="admin-stat">
              <div className="admin-stat-icon">{s.svgIcon}</div>
              <div className="admin-stat-val">{s.val}</div>
              <div className="admin-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:20 }}>
          {/* At-risk students */}
          <div style={{ background:'var(--card)', border:'1.5px solid var(--border)', borderRadius:'var(--r)', padding:'18px 20px' }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Students Needing Attention</div>
            {belowFifty.length === 0
              ? <div style={{ fontSize:12, color:'var(--t3)' }}>No students below 50% — great progress!</div>
              : belowFifty.map((u, i) => {
                  const d = storage.getStudy(u.email);
                  const pct = d ? Math.round(calcOverall(d)) : 0;
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ fontSize:12, fontWeight:600 }}>{u.name}</div>
                      <span style={{ fontSize:11, padding:'2px 8px', background:'rgba(220,38,38,0.08)', color:'#dc2626', borderRadius:99 }}>{pct}%</span>
                    </div>
                  );
                })}
          </div>

          {/* Activity log */}
          <div style={{ background:'var(--card)', border:'1.5px solid var(--border)', borderRadius:'var(--r)', padding:'18px 20px' }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Recent Activity</div>
            {actLog.length === 0
              ? <div style={{ fontSize:12, color:'var(--t3)' }}>No activity yet.</div>
              : actLog.slice(0, 8).map((a, i) => (
                  <div key={i} style={{ display:'flex', gap:8, padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ fontSize:12, fontWeight:500, flex:1 }}>{a.msg}</div>
                    <div style={{ fontSize:10, color:'var(--t3)', flexShrink:0 }}>{a.time}</div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </>
  );
}
