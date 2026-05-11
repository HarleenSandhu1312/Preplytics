import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAlerts } from '../utils/analytics';

export default function Topbar({ title, onSearch, studyData = {}, onNav }) {
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const ref = useRef(null);
  const alerts = getAlerts(studyData);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const roleLabel = user?.role === 'admin' ? 'Administrator' : 'Student';
  const profilePage = user?.role === 'admin' ? 'admin-profile' : 'profile';

  return (
    <div className="topbar">
      <div className="topbar-l">
        {title && <h1 className="topbar-title">{title}</h1>}
        {onSearch && (
          <div className="search-wrap">
            <span className="search-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input className="search-inp" placeholder="Search subjects..." onChange={e => onSearch(e.target.value)} />
          </div>
        )}
      </div>

      <div className="topbar-r">
        {/* Notification bell */}
        <div className="notif-wrap" ref={ref}>
          <button className="notif-btn" onClick={() => setShowNotif(v => !v)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {alerts.length > 0 && <span className="notif-badge">{alerts.length}</span>}
          </button>

          {showNotif && (
            <div className="notif-drop">
              <div className="notif-hd">
                <span>Notifications</span>
                <button className="notif-x" onClick={() => setShowNotif(false)}>✕</button>
              </div>
              {alerts.length === 0 ? (
                <div className="notif-empty">All caught up!</div>
              ) : (
                <>
                  {alerts.map((a, i) => (
                    <div key={i} className={`notif-li ${a.urgency === 'critical' ? 'crit' : 'warn'}`}
                      onClick={() => { setShowNotif(false); onNav && onNav('planner'); }}>
                      <span style={{ width:7, height:7, borderRadius:'50%', background: a.urgency==='critical' ? '#dc2626' : '#d97706', display:'inline-block', marginRight:4 }}/>
                      <div>
                        <div className="ni-t">{a.subject} needs revision</div>
                        <div className="ni-s">Score: {a.score}% — due in {a.daysUntil}d</div>
                      </div>
                    </div>
                  ))}
                  <div className="notif-foot" onClick={() => { setShowNotif(false); onNav && onNav('planner'); }}>
                    View Planner →
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Avatar + name + role — like the reference */}
        <button className="topbar-user" onClick={() => onNav && onNav(profilePage)} title="Profile">
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user?.name || 'User'}</span>
            <span className="topbar-user-role">{roleLabel}</span>
          </div>
          <div className="topbar-avatar">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </button>
      </div>
    </div>
  );
}
