import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudyProvider } from './context/StudyContext';
import { ThemeProvider } from './context/ThemeContext';

import Login    from './student/pages/Login';
import Register from './student/pages/Register';
import Sidebar  from './shared/Sidebar';

import Dashboard from './student/pages/Dashboard';
import Study     from './student/pages/Study';
import Planner   from './student/pages/Planner';
import Progress  from './student/pages/Progress';
import Profile       from './student/pages/Profile';
import Certificates from './student/pages/Certificates';
import Settings  from './student/pages/Settings';

import AdminDashboard   from './admin/pages/AdminDashboard';
import AdminProfile     from './admin/pages/AdminProfile';
import SubjectsManager  from './admin/pages/SubjectsManager';
import TopicsManager    from './admin/pages/TopicsManager';
import NotesManager     from './admin/pages/NotesManager';
import TestManager      from './admin/pages/TestManager';
import StudentAnalytics from './admin/pages/StudentAnalytics';
import AdminSettings    from './admin/pages/AdminSettings';

function AppInner() {
  const { user } = useAuth();
  const [authPage, setAuthPage] = useState(null);
  const [page, setPage]         = useState('dashboard');
  const [studySub, setStudySub] = useState(null);

  const navigate = (p, subject = null) => {
    setPage(p); if (subject) setStudySub(subject); setAuthPage(null);
  };

  if (authPage === 'login')    return <Login    onGoRegister={() => setAuthPage('register')} onBack={() => setAuthPage(null)} onSuccess={() => setAuthPage(null)} />;
  if (authPage === 'register') return <Register onGoLogin={() => setAuthPage('login')}       onBack={() => setAuthPage(null)} onSuccess={() => setAuthPage(null)} />;

  if (!user) {
    return (
      <div className="app">
        <GuestSidebar page={page} onLogin={() => setAuthPage('login')} />
        <div className="main-wrap">
          <GuestLanding onLogin={() => setAuthPage('login')} onRegister={() => setAuthPage('register')} />
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (user.role === 'admin') {
      switch (page) {
        case 'admin-dashboard': case 'dashboard': return <AdminDashboard onNav={navigate} />;
        case 'subjects':       return <SubjectsManager onNav={navigate} />;
        case 'topics':         return <TopicsManager onNav={navigate} />;
        case 'notes':          return <NotesManager onNav={navigate} />;
        case 'tests':          return <TestManager onNav={navigate} />;
        case 'analytics':      return <StudentAnalytics onNav={navigate} />;
        case 'admin-settings': return <AdminSettings onNav={navigate} />;
        case 'admin-profile':  return <AdminProfile onNav={navigate} />;
        default:               return <AdminDashboard onNav={navigate} />;
      }
    }
    switch (page) {
      case 'dashboard': return <Dashboard onNav={navigate} />;
      case 'study':     return <Study onNav={navigate} initialSubject={studySub} />;
      case 'planner':   return <Planner onNav={navigate} />;
      case 'progress':  return <Progress onNav={navigate} />;
      case 'profile':   return <Profile onNav={navigate} />;
      case 'settings':      return <Settings onNav={navigate} />;
      case 'certificates':  return <Certificates onNav={navigate} />;
      default:          return <Dashboard onNav={navigate} />;
    }
  };

  const sbPage = user.role === 'admin' && page === 'dashboard' ? 'admin-dashboard' : page;
  return (
    <div className="app">
      <Sidebar page={sbPage} onNav={navigate} />
      <div className="main-wrap">{renderPage()}</div>
    </div>
  );
}

/* SVG icons for guest sidebar */
const IcoHome = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoBook = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoSignIn = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;

function GuestSidebar({ page, onLogin }) {
  const ITEMS = [
    { id:'dashboard', Icon:IcoHome, label:'Dashboard' },
    { id:'study',     Icon:IcoBook, label:'Study'     },
  ];
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <span className="sb-wordmark">Prep<span>Lytics</span></span>
      </div>
      <nav className="sb-nav">
        {ITEMS.map(it => (
          <button key={it.id} className={`sb-item ${page===it.id?'active':''}`} title={it.label}>
            <span className="sb-icon"><it.Icon /></span>
            <span className="sb-label">{it.label}</span>
          </button>
        ))}
      </nav>
      <div className="sb-bottom">
        <button className="sb-item" onClick={onLogin} title="Sign In"
          style={{ background:'var(--blue-btn)', color:'#fff', borderRadius:11 }}>
          <span className="sb-icon"><IcoSignIn /></span>
          <span className="sb-label">Sign In</span>
        </button>
      </div>
    </aside>
  );
}

function GuestLanding({ onLogin, onRegister }) {
  return (
    <div style={{ flex:1 }}>
      <div className="topbar">
        <div className="topbar-l">
          <div className="search-wrap">
            <span className="search-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            <input className="search-inp" placeholder="Search subjects..." readOnly />
          </div>
        </div>
        <div className="topbar-r">
          <button className="btn btn-g" onClick={onLogin}>Sign In</button>
          <button className="btn btn-p" onClick={onRegister}>Register Free</button>
          <button className="avatar-btn" onClick={onLogin}>?</button>
        </div>
      </div>
      <div style={{ padding:'26px 28px' }}>
        <div className="dash-hero" style={{ marginBottom:20 }}>
          <div style={{ zIndex:1 }}>
            <div className="dash-hero-sub">Welcome to PrepLytics</div>
            <h1 className="dash-hero-title">Smart Exam Preparation</h1>
            <p className="dash-hero-desc">Track subjects, take tests, auto-schedule revisions<br/>and monitor performance — all in one place.</p>
            <div className="dash-hero-btns">
              <button className="btn btn-p" onClick={onRegister}>Get Started Free →</button>
              <button className="btn btn-g" onClick={onLogin}>Sign In</button>
            </div>
          </div>
          <svg style={{flexShrink:0,zIndex:1,opacity:0.18}} width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        </div>
        <div className="dash-stats" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
          {[
            { icon:'', label:'Smart Scheduling', val:'Auto', unit:'revision', color:'var(--blue-mid)', bg:'var(--blue-soft)' },
            { icon:'', label:'Adaptive Tests',   val:'Per',  unit:'subject',  color:'#8b5cf6',        bg:'rgba(139,92,246,0.10)' },
            { icon:'', label:'Live Analytics',   val:'Real', unit:'time',     color:'var(--green)',   bg:'var(--green-bg)' },
          ].map((s,i) => (
            <div key={i} className="dash-stat">
              <div className="dash-stat-icon" style={{ background:s.bg, color:s.color }}>{s.icon}</div>
              <div className="dash-stat-body">
                <div className="dash-stat-label">{s.label}</div>
                <div className="dash-stat-val" style={{ fontSize:16 }}>{s.val} <span className="dash-stat-unit">{s.unit}</span></div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ margin:'20px 0 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 className="dash-section-title">Subjects Covered</h3>
          <button className="btn btn-p" style={{ padding:'6px 14px', fontSize:12 }} onClick={onRegister}>Enroll Free</button>
        </div>
        <div className="sub-grid">
          {[
            { name:'DSA',icon:'',t:7,d:'Arrays, Trees, DP' },{ name:'DBMS',icon:'',t:6,d:'SQL, Normalization' },
            { name:'OS',icon:'',t:6,d:'Memory, Scheduling' },{ name:'CN',icon:'',t:5,d:'TCP/IP, Protocols' },
            { name:'TOC',icon:'',t:5,d:'Automata, Grammars' },{ name:'Aptitude',icon:'',t:4,d:'Quant, Logical' },
          ].map((s,i) => (
            <div key={i} className="sub-card" style={{ cursor:'default' }}>
              <div className="sub-card-head">
                <div className="sub-icon-circle">{s.icon}</div>
                <span className="sub-score-badge">{s.t} topics</span>
              </div>
              <div className="sub-card-name">{s.name}</div>
              <div className="sub-card-meta">{s.d}</div>
              <div className="sub-card-bar"><div className="sub-card-bar-fill" style={{ width:'0%' }}/></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider><AuthProvider><StudyProvider><AppInner /></StudyProvider></AuthProvider></ThemeProvider>
  );
}
