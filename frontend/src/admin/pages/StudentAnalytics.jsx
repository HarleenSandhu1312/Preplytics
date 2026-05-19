import { useState, useEffect } from 'react';
import Topbar from '../../shared/Topbar';
import { storage } from '../../utils/storage';
import api from '../../utils/api';

function ScoreCell({ score }) {
  if (!score && score !== 0) return <span className="score-cell none">—</span>;
  const cls = score >= 60 ? 'ok' : score >= 40 ? 'low' : 'danger';
  return <span className={`score-cell ${cls}`}>{score}%</span>;
}

export default function StudentAnalytics({ onNav }) {
  const subjects = storage.getSubjects() || {};
  const subKeys  = Object.keys(subjects);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const totalPossibleMarks = subKeys.length * 100;

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => {
        const data = res.data?.data || {};
        setRows(data.studentWisePerformance || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const normalizedRows = rows.map((r) => {
    const obtained = subKeys.reduce((sum, sid) => sum + (Number(r.scores?.[sid]) || 0), 0);
    const overall = totalPossibleMarks ? Math.round((obtained / totalPossibleMarks) * 100) : 0;
    return {
      ...r,
      obtained,
      overall,
    };
  });

  const avgPerformance = normalizedRows.length
    ? Math.round(normalizedRows.reduce((s, r) => s + r.overall, 0) / normalizedRows.length)
    : 0;

  const belowFifty = normalizedRows.filter(r => r.overall > 0 && r.overall < 50);
  const avgScores  = subKeys.map(sid => {
    const vals = normalizedRows.map(r => Number(r.scores?.[sid]) || 0);
    return { sid, avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0 };
  });

  return (
    <>
      <Topbar title="Student Analytics" onNav={onNav} />
      <div className="page-full">
        <div className="analytics-shell">
          <div className="analytics-headline">
            <div>
              <div className="analytics-title">Performance Insights</div>
              <div className="analytics-subtitle">
                Overall % per student = (sum of all subject scores / {totalPossibleMarks || 100}) * 100
              </div>
            </div>
          </div>

          <div className="analytics-kpi-grid">
            {[
              { val: normalizedRows.length, lbl: 'Total Students' },
              { val: normalizedRows.filter(r => r.overall >= 60).length, lbl: 'On Track (>=60%)' },
              { val: belowFifty.length, lbl: 'Below 50%' },
              { val: `${avgPerformance}%`, lbl: 'Class Average %' },
            ].map((s, i) => (
              <div key={i} className="analytics-kpi-card">
                <div className="analytics-kpi-val">{s.val}</div>
                <div className="analytics-kpi-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="empty-state"><p>Loading analytics...</p></div>
          ) : (
            <>
              <div className="admin-sec">
                <div className="admin-sec-hd"><span className="admin-sec-title">Subject Performance per Student</span></div>
                <div style={{ overflowX:'auto' }}>
                  <div className="analytics-table-wrap">
                    <div className="student-tbl-row admin-tbl-hd" style={{ gridTemplateColumns:`2.1fr 1.1fr 1fr ${subKeys.map(() => '1fr').join(' ')} 2fr` }}>
                      <span>Student</span><span>Total</span><span>Overall %</span>
                      {subKeys.map(sid => <span key={sid}>{subjects[sid]?.id || sid}</span>)}
                      <span>Weak Areas</span>
                    </div>
                    {normalizedRows.length === 0
                      ? <div className="empty-state"><p>No student data yet.</p></div>
                      : normalizedRows.map((r, i) => (
                        <div key={i} className="student-tbl-row analytics-row" style={{ gridTemplateColumns:`2.1fr 1.1fr 1fr ${subKeys.map(() => '1fr').join(' ')} 2fr` }}>
                          <div>
                            <div style={{ fontWeight:600, fontSize:13 }}>{r.name}</div>
                            <div style={{ fontSize:11, color:'var(--t2)' }}>{r.email}</div>
                          </div>
                          <span style={{ fontSize:12, fontWeight:700, color:'var(--t2)' }}>
                            {r.obtained}/{totalPossibleMarks}
                          </span>
                          <span className={`score-cell ${r.overall >= 60 ? 'ok' : r.overall > 0 ? 'low' : 'none'}`}>
                            {r.overall > 0 ? `${r.overall}%` : '0%'}
                          </span>
                          {subKeys.map(sid => <ScoreCell key={sid} score={r.scores[sid]} />)}
                          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                            {r.weakAreas.length === 0
                              ? <span style={{ fontSize:11, color:'var(--green)' }}>All good</span>
                              : r.weakAreas.map((w, wi) => <span key={wi} className="bdg bdg-yellow" style={{ fontSize:10 }}>{w}</span>)
                            }
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {belowFifty.length > 0 && (
                <div className="admin-sec">
                  <div className="admin-sec-hd">
                    <span className="admin-sec-title">Students Below 50%</span>
                    <span className="bdg bdg-red">{belowFifty.length} students</span>
                  </div>
                  <div className="admin-sec-body">
                    {belowFifty.map((r, i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
                        <div>
                          <div style={{ fontWeight:600 }}>{r.name}</div>
                          <div style={{ fontSize:11, color:'var(--t2)' }}>{r.email}</div>
                        </div>
                        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                          <span style={{ color:'var(--red)', fontWeight:700 }}>{r.obtained}/{totalPossibleMarks} ({r.overall}%)</span>
                          {r.weakAreas.length > 0 && <span className="bdg bdg-yellow" style={{ fontSize:10 }}>Weak: {r.weakAreas.join(', ')}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="admin-sec">
                <div className="admin-sec-hd"><span className="admin-sec-title">Subject-wise Average Scores</span></div>
                <div className="admin-sec-body">
                  <div className="analytics-subject-grid">
                    {avgScores.map(({ sid, avg }) => (
                      <div key={sid} className="analytics-subject-card">
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, alignItems:'center' }}>
                          <span style={{ fontSize:13, fontWeight:700 }}>{subjects[sid]?.icon} {sid}</span>
                          <span className={`score-chip ${avg >= 60 ? 'sc-great' : avg >= 40 ? 'sc-low' : 'sc-danger'}`}>{avg}%</span>
                        </div>
                        <div className="pb" style={{ height:6 }}>
                          <div className="pb-fill" style={{ width:`${avg}%`, height:6 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
