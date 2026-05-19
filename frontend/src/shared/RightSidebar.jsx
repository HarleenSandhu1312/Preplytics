import { useState } from 'react';
import { storage } from '../utils/storage';
import { calcStreakFromDateStrings } from '../utils/analytics';

/* ── SVG Icons ── */
const IcoFlame  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const IcoCal    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoBolt   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoTarget = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IcoBook   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoTest   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;

function actIcon(msg) {
  if (!msg) return <IcoBolt />;
  const m = msg.toLowerCase();
  if (m.includes('test') || m.includes('score')) return <IcoTest />;
  if (m.includes('topic') || m.includes('complet')) return <IcoBook />;
  return <IcoBolt />;
}
function actColor(msg) {
  if (!msg) return 'var(--blue-mid)';
  const m = msg.toLowerCase();
  if (m.includes('test') || m.includes('score')) return '#7c3aed';
  if (m.includes('topic') || m.includes('complet')) return '#16a34a';
  return 'var(--blue-mid)';
}

/* ── Mini Calendar ── */
function MiniCalendar({ markedDates = [] }) {
  const [cur, setCur] = useState(new Date());
  const y = cur.getFullYear(), mo = cur.getMonth();
  const today = new Date();
  const days  = new Date(y, mo + 1, 0).getDate();
  const first = new Date(y, mo, 1).getDay();
  const WDS   = ['Mo','Tu','We','Th','Fr','Sa','Su'];
  const adj   = (first + 6) % 7;
  const monthLabel = cur.toLocaleString('default', { month:'long' }) + ' ' + y;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <button onClick={() => setCur(new Date(y, mo-1, 1))} className="rs-cal-nav">‹</button>
        <span className="rs-cal-month">{monthLabel}</span>
        <button onClick={() => setCur(new Date(y, mo+1, 1))} className="rs-cal-nav">›</button>
      </div>
      <div className="rs-cal-grid">
        {WDS.map(d => <div key={d} className="rs-cal-wd">{d}</div>)}
        {Array(adj).fill(null).map((_,i) => <div key={`e${i}`}/>)}
        {Array(days).fill(null).map((_,i) => {
          const n  = i + 1;
          const isToday  = n === today.getDate() && mo === today.getMonth() && y === today.getFullYear();
          const ds = `${y}-${String(mo+1).padStart(2,'0')}-${String(n).padStart(2,'0')}`;
          const isMarked = markedDates.includes(ds);
          return (
            <div key={n} className={`rs-cal-day${isToday?' today':''}${isMarked?' marked':''}`}>{n}</div>
          );
        })}
      </div>
    </div>
  );
}

/* ── MAIN ── */
export default function RightSidebar({ user, studyData = {}, markedDates = [] }) {
  const streak = calcStreakFromDateStrings(markedDates);
  const goal   = user?.dailyGoal || 7;
  const goalPct = Math.min(100, Math.round((streak / goal) * 100));

  // Stats
  const allTests = Object.values(studyData).flatMap(d => (d.miniTests || []).filter(t => t.submitted));
  const lastTest = [...allTests].sort((a,b) => new Date(b.date) - new Date(a.date))[0];
  const doneTopics  = Object.values(studyData).reduce((s,d) => s + (d.topics||[]).filter(t=>t.status==='completed').length, 0);
  const totalTopics = Object.values(studyData).reduce((s,d) => s + (d.topics||[]).length, 0);

  // Activity log — each entry is either a string or {msg, time}
  let actLog = [];
  try { actLog = (storage.getActivityLog() || []).slice(0, 8); } catch(e) {}

  return (
    <aside className="right-sb">

      {/* Quick Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, paddingBottom:14, borderBottom:'1px solid var(--rs-border)' }}>
        {[
          { Icon:IcoFlame,  label:'Streak', val:`${streak}d`,                              col:'#f97316' },
          { Icon:IcoTarget, label:'Score',  val: lastTest ? `${lastTest.score}%` : '—',    col:'var(--blue-mid)' },
          { Icon:IcoBook,   label:'Topics', val:`${doneTopics}/${totalTopics}`,             col:'#16a34a' },
          { Icon:IcoTest,   label:'Tests',  val:`${allTests.length}`,                       col:'#7c3aed' },
        ].map((s,i) => (
          <div key={i} style={{ background:'var(--panel)', borderRadius:9, padding:'8px 10px', display:'flex', alignItems:'center', gap:7, border:'1px solid var(--border)' }}>
            <span style={{ color:s.col }}><s.Icon /></span>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:'var(--rs-t1,var(--t1))', lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:9, fontWeight:600, color:'var(--rs-t3,var(--t3))', textTransform:'uppercase', letterSpacing:0.5, marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="rs-block">
        <div className="rs-block-title" style={{ display:'flex', alignItems:'center', gap:5, marginBottom:10 }}>
          <IcoCal /> Calendar
        </div>
        <MiniCalendar markedDates={markedDates} />
      </div>

      {/* Study Streak */}
      <div className="rs-block">
        <div className="rs-block-title" style={{ display:'flex', alignItems:'center', gap:5, marginBottom:9 }}>
          <IcoFlame /> Study Streak
        </div>
        <div className="rs-streak-row">
          <span className="rs-streak-num">{streak} Day{streak !== 1 ? 's' : ''}</span>
          <span className="rs-streak-goal">Goal: {goal}</span>
        </div>
        <div className="rs-pb"><div className="rs-pb-fill" style={{ width:`${goalPct}%` }}/></div>
        <div style={{ display:'flex', gap:3, marginTop:8 }}>
          {Array(7).fill(null).map((_,i) => (
            <div key={i} style={{ flex:1, height:4, borderRadius:99, background: i < streak ? 'var(--blue-btn)' : 'var(--rs-border,var(--border))' }}/>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rs-block">
        <div className="rs-block-title" style={{ display:'flex', alignItems:'center', gap:5, marginBottom:11 }}>
          <IcoBolt /> Recent Activity
        </div>
        {actLog.length === 0 ? (
          <div style={{ fontSize:11, color:'var(--rs-t3,var(--t3))', textAlign:'center', padding:'10px 0', fontStyle:'italic' }}>
            No activity yet. Start studying!
          </div>
        ) : actLog.map((item, i) => {
          // handle both string entries and {msg, time} object entries safely
          const msg  = item && typeof item === 'object' ? (item.msg || '') : (item || '');
          const time = item && typeof item === 'object' ? item.time : null;
          const col  = actColor(msg);
          return (
            <div key={i} style={{ display:'flex', gap:8, padding:'7px 0', borderBottom: i < actLog.length-1 ? '1px solid var(--rs-border,var(--border))' : 'none', alignItems:'flex-start' }}>
              <div style={{ width:24, height:24, borderRadius:7, background:`${col}18`, color:col, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                {actIcon(msg)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight:500, color:'var(--rs-t1,var(--t1))', lineHeight:1.45 }}>{msg}</div>
                {time && <div style={{ fontSize:10, color:'var(--rs-t3,var(--t3))', marginTop:2 }}>{time}</div>}
              </div>
            </div>
          );
        })}
      </div>

    </aside>
  );
}
