import { useState } from 'react';
import Topbar from '../../shared/Topbar';
import RightSidebar from '../../shared/RightSidebar';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { storage } from '../../utils/storage';
import { calcOverall, nextRevisionDays, isCertUnlocked, calcCompletionPct, calcLastTestScore } from '../../utils/analytics';

const IcoChart   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
const IcoActivity= () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IcoTarget  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IcoBrain   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
const IcoInfo    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoCheck   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoWarn    = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoChevron = ({ open }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform:open?'rotate(180deg)':'', transition:'.2s' }}><polyline points="6 9 12 15 18 9"/></svg>;

/* Dual-ring donut: outer = completion, inner = test score */
function DualDonut({ completionPct = 0, testScore = 0, size = 80 }) {
  const outerStroke = 6, innerStroke = 5;
  const outerR = (size - outerStroke) / 2;
  const innerR = outerR - outerStroke - 4;
  const outerCirc = 2 * Math.PI * outerR;
  const innerCirc = 2 * Math.PI * innerR;
  const outerOff  = outerCirc - (completionPct/100)*outerCirc;
  const innerOff  = innerCirc - (testScore/100)*innerCirc;
  const compCol = completionPct >= 100 ? '#16a34a' : 'var(--blue-mid)';
  const testCol = testScore >= 75 ? '#16a34a' : testScore >= 60 ? '#7c3aed' : testScore >= 40 ? '#d97706' : testScore > 0 ? '#dc2626' : 'var(--border)';

  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        {/* Outer track (completion) */}
        <circle cx={size/2} cy={size/2} r={outerR} fill="none" stroke="var(--border)" strokeWidth={outerStroke}/>
        <circle cx={size/2} cy={size/2} r={outerR} fill="none" stroke={compCol} strokeWidth={outerStroke}
          strokeDasharray={outerCirc} strokeDashoffset={outerOff} strokeLinecap="round" style={{ transition:'stroke-dashoffset .7s' }}/>
        {/* Inner track (test score) */}
        <circle cx={size/2} cy={size/2} r={innerR} fill="none" stroke="var(--border)" strokeWidth={innerStroke}/>
        <circle cx={size/2} cy={size/2} r={innerR} fill="none" stroke={testCol} strokeWidth={innerStroke}
          strokeDasharray={innerCirc} strokeDashoffset={innerOff} strokeLinecap="round" style={{ transition:'stroke-dashoffset .7s' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:11, fontWeight:800, color:compCol, lineHeight:1 }}>{completionPct}%</span>
        <span style={{ fontSize:9, fontWeight:700, color:testScore>0?testCol:'var(--t3)', marginTop:1 }}>{testScore>0?`${testScore}%`:'—'}</span>
      </div>
    </div>
  );
}

/* Horizontal bar chart for a list of subjects */
function SubjectBarChart({ entries, colorFn, label }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {entries.map(([name, val], i) => {
        const col = colorFn(val);
        const abbr = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:'var(--blue-soft)', color:'var(--blue-mid)', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{abbr}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:11, fontWeight:600, color:'var(--t1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'60%' }}>{name}</span>
                <span style={{ fontSize:11, fontWeight:700, color:col }}>{val>0?`${val}%`:'Not taken'}</span>
              </div>
              <div style={{ height:6, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                <div style={{ width:`${val}%`, height:'100%', background:col, borderRadius:99, transition:'width .6s' }}/>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TestDetail({ td }) {
  if (!td?.questions || !td?.answers) {
    return (
      <div style={{ background:'var(--panel)', borderBottom:'1px solid var(--border)', padding:'12px 18px' }}>
        <span style={{ fontSize:12, color:'var(--t3)', fontStyle:'italic' }}>Detailed answers not available for this test.</span>
      </div>
    );
  }
  const correct = td.questions.filter(q => td.answers[q.id] === q.ans).length;
  return (
    <div style={{ background:'var(--panel)', borderBottom:'1px solid var(--border)', padding:'14px 18px' }}>
      <div style={{ fontSize:12, fontWeight:700, marginBottom:10, color:'var(--t1)', display:'flex', gap:10, alignItems:'center' }}>
        Test Review <span style={{ fontWeight:500, color:'var(--t3)', fontSize:11 }}>{correct}/{td.questions.length} correct</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {td.questions.map((q, qi) => {
          const ua = td.answers[q.id], isRight = ua === q.ans;
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

export default function Progress({ onNav }) {
  const { user } = useAuth();
  const { studyData } = useStudy();
  const overall = calcOverall(studyData);
  const [expandedTest, setExpandedTest] = useState(null);

  const act = storage.getActivity(user?.email || '');
  const today = new Date();
  const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const weekChart = weekDays.map((day, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i));
    return { day, hours: act[d.toDateString()] || 0 };
  });
  const maxH = Math.max(...weekChart.map(d => d.hours), 1);
  const totalHrs = weekChart.reduce((s, d) => s + d.hours, 0);

  const allTests = Object.entries(studyData)
    .flatMap(([sub, d]) => (d.miniTests||[]).filter(t=>t.submitted).map(t=>({...t,sub,subData:d})))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const weakTopics = Object.entries(studyData)
    .flatMap(([sub, d]) => (d.topics||[]).filter(t=>t.status!=='completed').slice(0,3).map(t=>({sub, topic:t.name})))
    .slice(0, 8);

  const belowSixty = Object.entries(studyData).filter(([,d])=>d.overallScore>0&&d.overallScore<60).length;

  // Data for the two bar charts
  const completionEntries = Object.entries(studyData).map(([name,d]) => [name, calcCompletionPct(d)]);
  const testScoreEntries  = Object.entries(studyData).map(([name,d]) => [name, calcLastTestScore(d)]);

  const compColor = v => v>=100?'#16a34a':v>=60?'var(--blue-mid)':v>=30?'#d97706':'#dc2626';
  const testColor = v => v>=75?'#16a34a':v>=60?'#7c3aed':v>=40?'#d97706':v>0?'#dc2626':'var(--border)';

  return (
    <>
      <Topbar title="Analytics" studyData={studyData} onNav={onNav} />
      <div className="page-with-rs">
        <div className="page-main">

          {/* Top stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:11, marginBottom:18 }}>
            {[
              { label:'Overall Prep',    val:`${overall}%`,                       sub:'avg across subjects', col:'var(--blue-mid)', bg:'var(--blue-softer)' },
              { label:'Subjects',        val:`${Object.keys(studyData).length}`,   sub:'total enrolled',      col:'#7c3aed', bg:'rgba(124,58,237,0.07)' },
              { label:'Needs Attention', val:`${belowSixty}`,                      sub:'below 60%',           col:belowSixty>0?'#d97706':'#16a34a', bg:belowSixty>0?'rgba(217,119,6,0.07)':'rgba(22,163,74,0.07)' },
              { label:'Tests Taken',     val:`${allTests.length}`,                sub:'mini tests',           col:'var(--blue-mid)', bg:'var(--blue-softer)' },
            ].map((s,i)=>(
              <div key={i} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'16px 18px', boxShadow:'var(--sh)' }}>
                <div style={{ fontSize:24, fontWeight:800, color:s.col, letterSpacing:-0.4, marginBottom:2 }}>{s.val}</div>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)', marginBottom:1 }}>{s.label}</div>
                <div style={{ fontSize:11, color:'var(--t3)' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ── TWO CHARTS SIDE BY SIDE ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13, marginBottom:14 }}>

            {/* Chart 1: Topic Completion */}
            <div className="prog-sec" style={{ marginBottom:0 }}>
              <div className="prog-sec-title">
                <IcoChart /> Topic Completion %
              </div>
              <div style={{ fontSize:11, color:'var(--t3)', marginBottom:12 }}>
                How much of each subject's syllabus is covered
              </div>
              {completionEntries.length === 0
                ? <div style={{ color:'var(--t3)', fontSize:13, textAlign:'center', padding:16 }}>No subjects yet.</div>
                : <SubjectBarChart entries={completionEntries} colorFn={compColor} label="Completion"/>
              }
              <div style={{ display:'flex', gap:12, marginTop:12, flexWrap:'wrap' }}>
                {[['#16a34a','100%'],['var(--blue-mid)','60-99%'],['#d97706','30-59%'],['#dc2626','<30%']].map(([c,l])=>(
                  <span key={l} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'var(--t3)' }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }}/>{l}
                  </span>
                ))}
              </div>
            </div>

            {/* Chart 2: Test Scores */}
            <div className="prog-sec" style={{ marginBottom:0 }}>
              <div className="prog-sec-title">
                <IcoBrain /> Last Test Score %
              </div>
              <div style={{ fontSize:11, color:'var(--t3)', marginBottom:12 }}>
                Most recent mini-test result per subject
              </div>
              {testScoreEntries.length === 0
                ? <div style={{ color:'var(--t3)', fontSize:13, textAlign:'center', padding:16 }}>No subjects yet.</div>
                : <SubjectBarChart entries={testScoreEntries} colorFn={testColor} label="Test Score"/>
              }
              <div style={{ display:'flex', gap:12, marginTop:12, flexWrap:'wrap' }}>
                {[['#16a34a','≥75%'],['#7c3aed','60-74%'],['#d97706','40-59%'],['#dc2626','<40%']].map(([c,l])=>(
                  <span key={l} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'var(--t3)' }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }}/>{l}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Subject donut grid (dual ring) */}
          <div className="prog-sec">
            <div className="prog-sec-title"><IcoChart /> Subject Overview</div>
            <div style={{ fontSize:11, color:'var(--t3)', marginBottom:12 }}>
              Outer ring = topic completion · Inner ring = last test score
            </div>
            {Object.keys(studyData).length===0
              ? <div style={{ color:'var(--t3)', fontSize:13, padding:16 }}>No subjects yet.</div>
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:11 }}>
                  {Object.entries(studyData).map(([name,d])=>{
                    const cp = calcCompletionPct(d), ts = calcLastTestScore(d);
                    const done = (d.topics||[]).filter(t=>t.status==='completed').length;
                    const total = (d.topics||[]).length;
                    const certOk = isCertUnlocked(d);
                    return (
                      <div key={name} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'14px', boxShadow:'var(--sh)', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                        <DualDonut completionPct={cp} testScore={ts} />
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:12, fontWeight:700, marginBottom:2, color:'var(--t1)' }}>{name}</div>
                          <div style={{ fontSize:10, color:'var(--t3)', marginBottom:3 }}>{done}/{total} topics done</div>
                          {ts>0
                            ? <div style={{ fontSize:10, color:'var(--t2)' }}>Test: <strong style={{ color: testColor(ts) }}>{ts}%</strong></div>
                            : <div style={{ fontSize:10, color:'var(--t3)', fontStyle:'italic' }}>No test yet</div>
                          }
                        </div>
                        {certOk
                          ? <span style={{ fontSize:9, fontWeight:700, background:'rgba(22,163,74,0.1)', color:'#16a34a', padding:'2px 8px', borderRadius:99 }}>Certificate Earned</span>
                          : <span style={{ fontSize:9, color:'var(--t3)', textAlign:'center', lineHeight:1.4 }}>{cp<100?`${cp}% topics done`:'Need test >70%'}</span>
                        }
                      </div>
                    );
                  })}
                </div>
            }
          </div>

          {/* Weekly study activity */}
          <div className="prog-sec">
            <div className="prog-sec-title"><IcoActivity /> Weekly Study Activity</div>
            <div className="chart-wrap">
              {weekChart.map((d,i)=>(
                <div key={i} className="chart-col">
                  <div className="chart-top">{d.hours>0?`${d.hours}h`:''}</div>
                  <div className="chart-bar" style={{ height:`${(d.hours/maxH)*110}px` }}/>
                  <div className="chart-lbl">{d.day}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:10, fontSize:12, color:'var(--t2)', textAlign:'right' }}>
              Total this week: <strong>{totalHrs}h</strong>
            </div>
          </div>

          {/* Pending topics */}
          <div className="prog-sec">
            <div className="prog-sec-title"><IcoTarget /> Pending Topics</div>
            {weakTopics.length===0
              ? <div style={{ textAlign:'center', padding:18, color:'#16a34a', fontSize:13 }}>All topics completed!</div>
              : weakTopics.map((w,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ background:'var(--blue-soft)', color:'var(--blue-mid)', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99 }}>{w.sub}</span>
                    <span style={{ fontSize:12, flex:1, color:'var(--t1)' }}>{w.topic}</span>
                    <span style={{ fontSize:11, color:'var(--t3)' }}>Pending</span>
                  </div>
                ))
            }
          </div>

          {/* Test history */}
          <div className="prog-sec">
            <div className="prog-sec-title"><IcoBrain /> Test History</div>
            <div style={{ fontSize:11, color:'var(--t3)', marginBottom:10 }}>Click a row to review answers</div>
            <div className="data-tbl">
              <div className="tbl-row tbl-hd" style={{ gridTemplateColumns:'1fr 2fr 85px 100px 1fr 30px' }}>
                <span>Subject</span><span>Test</span><span>Score</span><span>Status</span><span>Date</span><span></span>
              </div>
              {allTests.length===0
                ? <div style={{ padding:18, textAlign:'center', color:'var(--t3)', fontSize:13 }}>No tests taken yet.</div>
                : allTests.map((r,i)=>{
                    const days = nextRevisionDays(r.score);
                    const due = new Date(r.date); due.setDate(due.getDate()+days);
                    const isExp = expandedTest===i;
                    const td = (r.questions&&r.answers)?r:(r.subData?.miniTests||[]).find(t=>t.name===r.name&&t.submitted);
                    const scoreCol = r.score>=75?'#16a34a':r.score>=60?'var(--blue-mid)':r.score>=40?'#d97706':'#dc2626';
                    const scoreBg  = r.score>=75?'rgba(22,163,74,0.1)':r.score>=60?'var(--blue-soft)':r.score>=40?'rgba(217,119,6,0.1)':'rgba(220,38,38,0.08)';
                    return (
                      <div key={i}>
                        <div className="tbl-row" style={{ gridTemplateColumns:'1fr 2fr 85px 100px 1fr 30px', cursor:'pointer' }}
                          onClick={()=>setExpandedTest(isExp?null:i)}>
                          <span style={{ fontWeight:700, color:'var(--t1)' }}>{r.sub}</span>
                          <span style={{ color:'var(--t2)', fontSize:12 }}>{r.name}</span>
                          <span><span style={{ fontSize:12, fontWeight:700, padding:'2px 9px', borderRadius:6, background:scoreBg, color:scoreCol }}>{r.score}%</span></span>
                          <span>
                            <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:99, display:'inline-flex', alignItems:'center', gap:4,
                              background:r.score>=60?'rgba(22,163,74,0.1)':'rgba(217,119,6,0.1)',
                              color:r.score>=60?'#16a34a':'#d97706' }}>
                              {r.score>=60?<><IcoCheck/> Pass</>:<><IcoWarn/> Revise</>}
                            </span>
                          </span>
                          <span style={{ fontSize:11, color:'var(--t3)' }}>
                            {due.toLocaleDateString('en-IN',{month:'short',day:'numeric'})}
                            <span style={{ opacity:.5 }}> (rev in {days}d)</span>
                          </span>
                          <span style={{ display:'flex', justifyContent:'center' }}><IcoChevron open={isExp}/></span>
                        </div>
                        {isExp && <TestDetail td={td}/>}
                      </div>
                    );
                  })
              }
            </div>
          </div>

        </div>
        <RightSidebar user={user} studyData={studyData} />
      </div>
    </>
  );
}
