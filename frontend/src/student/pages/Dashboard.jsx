import { useState } from 'react';
import Topbar from '../../shared/Topbar';
import RightSidebar from '../../shared/RightSidebar';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { storage } from '../../utils/storage';
import { calcOverall, getAlerts, calcCompletionPct, calcLastTestScore, calcStreakFromDateStrings } from '../../utils/analytics';

const IcoFire   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const IcoTarget = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue-mid)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IcoCheck  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoClip   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>;
const IcoArrow  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcoWarn   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoChevron = ({ open }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open?'rotate(180deg)':'', transition:'.18s' }}><polyline points="6 9 12 15 18 9"/></svg>;
const IcoRight  = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoX      = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

function CircleProgress({ pct = 0, size = 86, stroke = 7 }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#fff" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition:'stroke-dashoffset .6s ease' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:18, fontWeight:800, color:'#fff', lineHeight:1 }}>{pct}%</span>
        <span style={{ fontSize:8, color:'rgba(255,255,255,0.65)', fontWeight:600 }}>Overall</span>
      </div>
    </div>
  );
}

/* Subject card with DUAL metric bars: completion % + test score */
function SubjectCard({ name, data, onClick }) {
  const completionPct = calcCompletionPct(data);
  const testScore     = calcLastTestScore(data);
  const abbr = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hasTest = testScore > 0;
  const testCol = testScore >= 75 ? '#16a34a' : testScore >= 60 ? 'var(--blue-mid)' : testScore >= 40 ? '#d97706' : '#dc2626';
  const compCol = completionPct >= 100 ? '#16a34a' : 'var(--blue-mid)';

  return (
    <div onClick={onClick} style={{
      background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r)',
      padding:'13px 15px', display:'flex', alignItems:'center', gap:11, cursor:'pointer',
      boxShadow:'var(--sh)', transition:'transform .15s, box-shadow .15s, border-color .15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.borderColor='var(--blue-mid)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(37,99,200,0.12)'; }}
    onMouseLeave={e =>  { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='var(--sh)'; }}
    >
      <div style={{ width:36, height:36, borderRadius:9, background:'var(--blue-soft)', color:'var(--blue-mid)', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{abbr}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:5, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'var(--t1)' }}>{name}</div>
        {/* Completion bar */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
          <div style={{ flex:1, height:3, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
            <div style={{ width:`${completionPct}%`, height:'100%', background:compCol, borderRadius:99, transition:'width .5s' }}/>
          </div>
          <span style={{ fontSize:9, fontWeight:700, color:'var(--t3)', minWidth:26, textAlign:'right' }}>{completionPct}%</span>
        </div>
        {/* Test score bar */}
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ flex:1, height:3, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
            <div style={{ width:`${testScore}%`, height:'100%', background: hasTest ? testCol : 'transparent', borderRadius:99, transition:'width .5s' }}/>
          </div>
          <span style={{ fontSize:9, fontWeight:700, color: hasTest ? testCol : 'var(--t3)', minWidth:26, textAlign:'right' }}>{hasTest ? `${testScore}%` : '—'}</span>
        </div>
        {/* Legend */}
        <div style={{ display:'flex', gap:10, marginTop:3 }}>
          <span style={{ fontSize:8, color:'var(--t3)', display:'flex', alignItems:'center', gap:3 }}>
            <span style={{ width:6, height:2, background:compCol, borderRadius:1, display:'inline-block' }}/>Topics
          </span>
          <span style={{ fontSize:8, color:'var(--t3)', display:'flex', alignItems:'center', gap:3 }}>
            <span style={{ width:6, height:2, background: hasTest ? testCol : 'var(--border)', borderRadius:1, display:'inline-block' }}/>Test
          </span>
        </div>
      </div>
      <IcoArrow />
    </div>
  );
}

/* TestAnswerDetail */
function TestAnswerDetail({ testData }) {
  if (!testData?.questions || !testData?.answers) {
    return (
      <div style={{ background:'var(--panel)', borderBottom:'1px solid var(--border)', padding:'12px 18px' }}>
        <span style={{ fontSize:12, color:'var(--t3)', fontStyle:'italic' }}>Detailed answers not available for this test.</span>
      </div>
    );
  }
  const correct = testData.questions.filter(q => testData.answers[q.id] === q.ans).length;
  return (
    <div style={{ background:'var(--panel)', borderBottom:'1px solid var(--border)', padding:'14px 18px' }}>
      <div style={{ fontSize:12, fontWeight:700, marginBottom:10, color:'var(--t1)', display:'flex', gap:10, alignItems:'center' }}>
        Test Review
        <span style={{ fontWeight:500, color:'var(--t3)', fontSize:11 }}>{correct}/{testData.questions.length} correct</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {testData.questions.map((q, qi) => {
          const ua = testData.answers[q.id], isRight = ua === q.ans;
          return (
            <div key={qi} style={{ background:'var(--card)', borderRadius:'var(--r-sm)', padding:'9px 12px', borderLeft:`3px solid ${isRight?'#16a34a':'#dc2626'}` }}>
              <div style={{ display:'flex', gap:7, marginBottom:6, alignItems:'flex-start' }}>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:99, background:isRight?'rgba(22,163,74,0.1)':'rgba(220,38,38,0.08)', color:isRight?'#16a34a':'#dc2626', flexShrink:0 }}>
                  {isRight?'✓':'✗'} Q{qi+1}
                </span>
                <span style={{ fontSize:12, fontWeight:600, lineHeight:1.4, color:'var(--t1)' }}>{q.q}</span>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {q.opts.map((opt, oi) => {
                  const isCorrect=oi===q.ans, isWrong=oi===ua&&!isRight;
                  return (
                    <span key={oi} style={{ padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:600, border:'1.5px solid',
                      background:isCorrect?'rgba(22,163,74,0.1)':isWrong?'rgba(220,38,38,0.07)':'transparent',
                      borderColor:isCorrect?'#16a34a':isWrong?'#dc2626':'var(--border)',
                      color:isCorrect?'#16a34a':isWrong?'#dc2626':'var(--t3)' }}>
                      {isCorrect&&'✓ '}{isWrong&&'✗ '}{opt}
                    </span>
                  );
                })}
              </div>
              {q.exp && <div style={{ fontSize:10, color:'var(--blue-mid)', marginTop:4 }}>Explanation: {q.exp}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentTestsTable({ tests, studyData }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div className="data-tbl">
      <div className="tbl-row tbl-hd" style={{ gridTemplateColumns:'1.2fr 2fr 90px 110px 30px' }}>
        <span>Subject</span><span>Test Name</span><span>Score</span><span>Status</span><span></span>
      </div>
      {tests.slice(0,8).map((r, i) => {
        const subData = studyData[r.sub];
        const td = (r.questions&&r.answers) ? r : (subData?.miniTests||[]).find(t=>t.name===r.name&&t.submitted);
        const isExp = expanded===i;
        const scoreCol = r.score>=75?'#16a34a':r.score>=60?'var(--blue-mid)':r.score>=40?'#d97706':'#dc2626';
        const scoreBg  = r.score>=75?'rgba(22,163,74,0.1)':r.score>=60?'var(--blue-soft)':r.score>=40?'rgba(217,119,6,0.1)':'rgba(220,38,38,0.08)';
        return (
          <div key={i}>
            <div className="tbl-row" style={{ gridTemplateColumns:'1.2fr 2fr 90px 110px 30px', cursor:'pointer' }} onClick={()=>setExpanded(isExp?null:i)}>
              <span style={{ fontWeight:700, fontSize:13, color:'var(--t1)' }}>{r.sub}</span>
              <span style={{ color:'var(--t2)', fontSize:12 }}>{r.name}</span>
              <span><span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:6, background:scoreBg, color:scoreCol }}>{r.score}%</span></span>
              <span>
                <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99, display:'inline-flex', alignItems:'center', gap:4,
                  background:r.score>=60?'rgba(22,163,74,0.1)':'rgba(217,119,6,0.1)',
                  color:r.score>=60?'#16a34a':'#d97706' }}>
                  {r.score>=60?<><IcoRight/> Pass</>:<><IcoWarn/> Revise</>}
                </span>
              </span>
              <span style={{ display:'flex', justifyContent:'center' }}><IcoChevron open={isExp}/></span>
            </div>
            {isExp && <TestAnswerDetail testData={td}/>}
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard({ onNav }) {
  const { user } = useAuth();
  const { studyData } = useStudy();
  const [filterBy, setFilterBy] = useState('all');

  const overall = calcOverall(studyData);
  const alerts  = getAlerts(studyData);
  const completedTopics = Object.values(studyData).reduce((s,d)=>s+(d.topics||[]).filter(t=>t.status==='completed').length,0);
  const totalTopics     = Object.values(studyData).reduce((s,d)=>s+(d.topics||[]).length,0);
  const allTests = Object.entries(studyData).flatMap(([sub,d])=>(d.miniTests||[]).filter(t=>t.submitted).map(t=>({...t,sub}))).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const lastTest = allTests[0];
  const markedDates = storage.getActivityLog().map(e => (typeof e === 'object' ? e.time : e)?.slice?.(0, 10)).filter(Boolean);
  const streak = calcStreakFromDateStrings(markedDates);

  const statCards = [
    { Icon:IcoFire,   label:'STUDY STREAK',       val:streak,                          unit:'days', bg:'rgba(249,115,22,0.08)', border:'rgba(249,115,22,0.18)' },
    { Icon:IcoTarget, label:'FOCUS SCORE',         val:`${overall}%`,                   unit:'',     bg:'var(--blue-softer)',    border:'rgba(37,99,200,0.15)' },
    { Icon:IcoCheck,  label:'COMPLETED LECTURES',  val:`${completedTopics}/${totalTopics}`, unit:'', bg:'rgba(22,163,74,0.07)',  border:'rgba(22,163,74,0.2)' },
    { Icon:IcoClip,   label:'LAST TEST SCORE',     val: lastTest?`${lastTest.score}%`:'—', unit:'', bg:'rgba(124,58,237,0.07)', border:'rgba(124,58,237,0.18)' },
  ];

  const filtered = Object.entries(studyData).filter(([, d]) => {
    const cp = calcCompletionPct(d), ts = calcLastTestScore(d);
    if (filterBy==='weak')   return (ts>0&&ts<60)||(ts===0&&cp<60);
    if (filterBy==='strong') return (ts>0&&ts>=75)||(ts===0&&cp>=75);
    if (filterBy==='new')    return cp===0&&ts===0;
    return true;
  });

  return (
    <>
      <Topbar title="Dashboard" studyData={studyData} onNav={onNav} />
      <div className="page-with-rs">
        <div className="page-main">

          {/* Greeting banner */}
          <div style={{ background:'linear-gradient(135deg,#1e2d4a 0%,var(--blue-btn) 100%)', borderRadius:'var(--r-xl)', padding:'22px 28px', marginBottom:18, display:'flex', alignItems:'center', justifyContent:'space-between', overflow:'hidden', position:'relative' }}>
            <div style={{ position:'absolute', top:-30, right:160, width:180, height:180, background:'radial-gradient(circle,rgba(255,255,255,0.06),transparent 70%)', pointerEvents:'none' }}/>
            <div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.55)', fontWeight:500, marginBottom:4 }}>Welcome back</div>
              <div style={{ fontSize:22, fontWeight:800, color:'#fff', letterSpacing:-0.4, marginBottom:8 }}>{user?.name?.split(' ')[0] || 'Student'}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginBottom:14 }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</div>
              <button onClick={()=>onNav('study')} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', color:'#fff', padding:'8px 18px', borderRadius:99, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', backdropFilter:'blur(4px)' }}>
                Resume Study →
              </button>
            </div>
            <CircleProgress pct={overall} />
          </div>

          {/* Stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:11, marginBottom:18 }}>
            {statCards.map((s,i)=>(
              <div key={i} style={{ background:'var(--card)', border:`1px solid ${s.border}`, borderRadius:'var(--r)', padding:'14px 16px', boxShadow:'var(--sh)', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><s.Icon/></div>
                <div>
                  <div style={{ fontSize:20, fontWeight:800, color:'var(--t1)', letterSpacing:-0.4, lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:9, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:0.7, marginTop:3 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Alert */}
          {alerts.length>0 && (
            <div style={{ background:'rgba(217,119,6,0.07)', border:'1px solid rgba(217,119,6,0.25)', borderRadius:'var(--r-sm)', padding:'10px 14px', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ color:'#d97706' }}><IcoWarn/></span>
              <span style={{ fontSize:12, color:'var(--t1)' }}><strong>{alerts.length} subject{alerts.length>1?'s':''}</strong> need attention: {alerts.map(a=>a.subject).join(', ')}</span>
            </div>
          )}

          {/* Subjects */}
          <div style={{ marginBottom:18 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ fontSize:15, fontWeight:800, color:'var(--t1)' }}>My Subjects</div>
              <div style={{ display:'flex', gap:5 }}>
                {['all','weak','strong','new'].map(f=>(
                  <button key={f} onClick={()=>setFilterBy(f)} style={{ padding:'4px 12px', borderRadius:99, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', border:'1.5px solid', transition:'.14s',
                    background: filterBy===f ? 'var(--blue-btn)' : 'var(--card)',
                    borderColor: filterBy===f ? 'var(--blue-btn)' : 'var(--border)',
                    color: filterBy===f ? '#fff' : 'var(--t2)' }}>
                    {f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ fontSize:11, color:'var(--t3)', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Top bar = topic completion %. Bottom bar = last test score.
            </div>
            {filtered.length===0
              ? <div style={{ padding:20, textAlign:'center', color:'var(--t3)', fontSize:13 }}>No subjects match this filter.</div>
              : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
                  {filtered.map(([name, data])=>(
                    <SubjectCard key={name} name={name} data={data} onClick={()=>onNav('study',name)}/>
                  ))}
                </div>
            }
          </div>

          {/* Recent Tests */}
          {allTests.length>0 && (
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:'var(--t1)', marginBottom:10 }}>Recent Tests</div>
              <RecentTestsTable tests={allTests} studyData={studyData}/>
            </div>
          )}

        </div>
        <RightSidebar user={user} studyData={studyData} markedDates={markedDates}/>
      </div>
    </>
  );
}
