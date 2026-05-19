import { useState } from 'react';
import Topbar from '../../shared/Topbar';
import { useStudy } from '../../context/StudyContext';
import { storage } from '../../utils/storage';
import { getAlerts, nextRevisionDays } from '../../utils/analytics';

const WDS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/* ── Full-size calendar ── */
function BigCalendar({ events, onDayClick, selectedDay, curMonth, setCurMonth }) {
  const y = curMonth.getFullYear(), m = curMonth.getMonth();
  const today = new Date();
  const days  = new Date(y, m+1, 0).getDate();
  const first = new Date(y, m, 1).getDay();

  const eventsOnDay = (n) => {
    const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(n).padStart(2,'0')}`;
    return events.filter(e => e.date === ds);
  };

  return (
    <div className="big-cal">
      {/* Header */}
      <div className="big-cal-hd">
        <div className="big-cal-nav-row">
          <button className="big-cal-nav" onClick={() => setCurMonth(new Date(y, m-1, 1))}>‹</button>
          <h2 className="big-cal-title">{MONTHS[m]} {y}</h2>
          <button className="big-cal-nav" onClick={() => setCurMonth(new Date(y, m+1, 1))}>›</button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="big-cal-grid">
        {WDS.map(d => <div key={d} className="big-cal-wd">{d}</div>)}

        {/* Empty cells */}
        {Array(first).fill(null).map((_,i) => <div key={`e${i}`} className="big-cal-cell empty"/>)}

        {/* Day cells */}
        {Array(days).fill(null).map((_,i) => {
          const n = i+1;
          const isToday = n===today.getDate() && m===today.getMonth() && y===today.getFullYear();
          const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(n).padStart(2,'0')}`;
          const dayEvts = eventsOnDay(n);
          const isSel = selectedDay === ds;
          return (
            <div key={n} className={`big-cal-cell ${isToday?'today':''} ${isSel?'selected':''} ${dayEvts.length?'has-events':''}`}
              onClick={() => onDayClick(ds)}>
              <span className="big-cal-num">{n}</span>
              <div className="big-cal-evts">
                {dayEvts.slice(0,2).map((e,ei) => (
                  <div key={ei} className={`big-cal-evt ${e.type}`}>{e.title}</div>
                ))}
                {dayEvts.length > 2 && <div className="big-cal-more">+{dayEvts.length-2}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Task detail panel (right side) ── */
function TaskPanel({ events, selectedDay, onAddTask, onRemoveTask }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', time:'', type:'manual', notes:'' });

  const dayEvts = selectedDay ? events.filter(e => e.date === selectedDay) : [];
  const fmtDate = selectedDay ? new Date(selectedDay+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}) : '';

  const addTask = () => {
    if (!form.title.trim() || !selectedDay) return;
    onAddTask({ ...form, date: selectedDay, id: `task-${Date.now()}` });
    setForm({ title:'', time:'', type:'manual', notes:'' });
    setShowForm(false);
  };

  return (
    <div className="task-panel">
      {!selectedDay ? (
        <div className="task-panel-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--blue-mid)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>Select a day</div>
          <div style={{ fontSize:13, color:'var(--t3)' }}>Click any date on the calendar<br/>to view or add tasks</div>
        </div>
      ) : (
        <>
          <div className="task-panel-hd">
            <div>
              <div className="task-panel-date">{fmtDate}</div>
              <div className="task-panel-count">{dayEvts.length} task{dayEvts.length!==1?'s':''}</div>
            </div>
            <button className="task-add-btn" onClick={() => setShowForm(v=>!v)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add
            </button>
          </div>

          {showForm && (
            <div className="task-form">
              <input className="task-finp" placeholder="Task title..." value={form.title} onChange={e=>setForm({...form,title:e.target.value})} autoFocus />
              <input className="task-finp" type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} />
              <textarea className="task-finp" rows={2} placeholder="Notes (optional)" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{resize:'none'}} />
              <div style={{ display:'flex', gap:6, marginTop:4 }}>
                <button className="btn-sm p" style={{ flex:1 }} onClick={addTask}>Save Task</button>
                <button className="btn-sm g" onClick={()=>setShowForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="task-list">
            {dayEvts.length === 0 && !showForm && (
              <div style={{ textAlign:'center', padding:'24px 0', color:'var(--t3)', fontSize:13 }}>
                No tasks — click + Add to create one
              </div>
            )}
            {dayEvts.map((e, i) => (
              <div key={i} className={`task-card ${e.type}`}>
                <div className="task-card-top">
                  <span className={`task-type-dot ${e.type}`}/>
                  <span className="task-card-title">{e.title}</span>
                  <button className="task-del" onClick={() => onRemoveTask(e.id)}>×</button>
                </div>
                {e.time && <div className="task-card-time">⏰ {e.time}</div>}
                {e.score !== undefined && (
                  <div className="task-card-score">
                    Score: <strong style={{ color: e.score<60?'var(--yellow)':'var(--green)' }}>{e.score}%</strong>
                  </div>
                )}
                {e.notes && <div className="task-card-notes">{e.notes}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Planner({ onNav }) {
  const { studyData } = useStudy();
  const alerts = getAlerts(studyData);
  const actLog = storage.getActivityLog().map(l => l.msg);

  const [curMonth, setCurMonth]   = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [view, setView]           = useState('month'); // month | week | day

  /* ── Auto-generate events from study results ── */
  const autoEvents = Object.entries(studyData)
    .filter(([, d]) => d.overallScore > 0)
    .map(([name, d]) => {
      const days = nextRevisionDays(d.overallScore);
      const due  = new Date(); due.setDate(due.getDate() + days);
      const ds   = due.toISOString().split('T')[0];
      return {
        id:     `auto-${name}`,
        title:  `Revise ${name}`,
        date:   ds,
        type:   d.overallScore < 40 ? 'critical' : d.overallScore < 60 ? 'warning' : 'normal',
        score:  d.overallScore,
        notes:  `Current score: ${d.overallScore}%. Suggested revision.`,
        auto:   true,
      };
    });

  /* Today's alerts as today's events */
  const todayStr = new Date().toISOString().split('T')[0];
  const alertEvents = alerts.map(a => ({
    id:    `alert-${a.subject}`,
    title: `⚠ ${a.subject} — Needs Work`,
    date:  todayStr,
    type:  a.urgency === 'critical' ? 'critical' : 'warning',
    score: a.score,
    notes: a.weakTopics?.length ? `Weak: ${a.weakTopics.slice(0,3).join(', ')}` : '',
    auto:  true,
  }));

  /* Manual events from backend-backed storage */
  const [manualEvents, setManualEvents] = useState(() => storage.getManualEvents());

  const saveManual = (evts) => {
    setManualEvents(evts);
    storage.saveManualEvents(evts);
  };

  const allEvents = [...alertEvents, ...autoEvents, ...manualEvents];

  const addTask = (task) => saveManual([...manualEvents, task]);
  const removeTask = (id) => {
    if (id.startsWith('auto-') || id.startsWith('alert-')) return;
    saveManual(manualEvents.filter(e => e.id !== id));
  };

  /* Upcoming — next 7 days */
  const upcoming = allEvents
    .filter(e => e.date >= todayStr)
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(0,8);

  const markedDates = [...new Set(allEvents.map(e => e.date))];

  return (
    <>
      <Topbar title="Study Planner" studyData={studyData} onNav={onNav} />
      <div className="planner-page">
        {/* Left panel — calendar */}
        <div className="planner-cal-col">
          {/* View toggle like Image 2 */}
          <div className="planner-view-tabs">
            {['month','week','day'].map(v => (
              <button key={v} className={`planner-view-tab ${view===v?'active':''}`} onClick={()=>setView(v)}>
                {v.charAt(0).toUpperCase()+v.slice(1)}
              </button>
            ))}
          </div>

          <BigCalendar
            events={allEvents}
            selectedDay={selectedDay}
            onDayClick={setSelectedDay}
            curMonth={curMonth}
            setCurMonth={setCurMonth}
          />

          {/* Smart schedule rules */}
          <div className="planner-rules-card">
            <div className="planner-rules-title">🤖 Smart Schedule</div>
            <div className="planner-rules-list">
              {[
                ['≥ 75%','Revise in 10 days','var(--green)','var(--green-bg)'],
                ['60–74%','Revise in 5 days','var(--blue)','var(--blue-soft)'],
                ['40–59%','Revise in 3 days','var(--yellow)','var(--yellow-bg)'],
                ['< 40%','Revise in 1–2 days','var(--red)','var(--red-bg)'],
              ].map(([range,label,c,bg]) => (
                <div key={range} className="rule-row">
                  <span className="rule-tag" style={{ color:c, background:bg }}>{range}</span>
                  <span style={{ fontSize:12, color:'var(--t2)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — task detail + upcoming */}
        <div className="planner-right-col">
          <TaskPanel
            events={allEvents}
            selectedDay={selectedDay}
            onAddTask={addTask}
            onRemoveTask={removeTask}
          />

          {/* Upcoming list */}
          <div className="upcoming-card">
            <div className="upcoming-title">Upcoming Tasks</div>
            {upcoming.length === 0 ? (
              <div style={{ textAlign:'center', padding:'18px', color:'var(--t3)', fontSize:13 }}>
                Take mini tests to auto-schedule revisions!
              </div>
            ) : upcoming.map((e, i) => (
              <div key={i} className={`upcoming-row ${e.type}`}>
                <div className={`upcoming-dot ${e.type}`}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="upcoming-row-title">{e.title}</div>
                  <div className="upcoming-row-date">
                    {new Date(e.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                    {e.score !== undefined && <span> · {e.score}%</span>}
                  </div>
                </div>
                {e.auto && <span className="upcoming-auto-tag">Auto</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
