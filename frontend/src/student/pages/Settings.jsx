import { useState } from 'react';
import Topbar from '../../shared/Topbar';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { storage } from '../../utils/storage';
import { initUserStudyData } from '../../utils/seed';
import api from '../../utils/api';

/* SVG icons */
const IcoUser   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoLock   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoBook   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoBell   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoAlert  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoSignOut = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

function Section({ icon: Icon, title, children, danger }) {
  return (
    <div style={{ background:'var(--card)', border:`1.5px solid ${danger ? 'rgba(220,38,38,0.4)' : 'var(--border)'}`, borderRadius:'var(--r)', padding:'20px 22px', marginBottom:14, boxShadow:'var(--sh)' }}>
      <div style={{ fontSize:13, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:8, color: danger ? '#dc2626' : 'var(--t1)' }}>
        <span style={{ width:28, height:28, borderRadius:8, background: danger ? 'rgba(220,38,38,0.08)' : 'var(--blue-soft)', color: danger ? '#dc2626' : 'var(--blue-mid)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon />
        </span>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, sub, children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:1 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:'var(--t3)' }}>{sub}</div>}
      </div>
      <div style={{ flexShrink:0, marginLeft:16 }}>{children}</div>
    </div>
  );
}

export default function Settings({ onNav }) {
  const { user, updateUser, logout } = useAuth();
  const { studyData } = useStudy();

  const [account, setAccount] = useState({ name:user?.name||'', email:user?.email||'', phone:user?.phone||'' });
  const [pass, setPass]       = useState({ current:'', newp:'', confirm:'' });
  const [passMsg, setPassMsg] = useState('');
  const [prefs, setPrefs]     = useState({ studyTime:user?.studyTime||'morning', dailyGoal:user?.dailyGoal||2, difficulty:user?.difficulty||'medium' });
  const [notifs, setNotifs]   = useState({ email:true, studyReminder:true, testReminder:true, weeklyReport:false });
  const [saved, setSaved]     = useState('');

  const saveFn = (key, data) => { updateUser(data); setSaved(key); setTimeout(() => setSaved(''), 2200); };

  // Change password via backend API
  const changePassword = async () => {
    if (!pass.current || !pass.newp || !pass.confirm) { setPassMsg('Please fill all fields.'); return; }
    if (pass.newp !== pass.confirm) { setPassMsg('Passwords do not match.'); return; }
    if (pass.newp.length < 6) { setPassMsg('Min 6 characters required.'); return; }
    try {
      await api.put('/auth/change-password', { currentPassword: pass.current, newPassword: pass.newp });
      setPass({ current:'', newp:'', confirm:'' });
      setPassMsg('✓ Password changed!');
    } catch (err) {
      setPassMsg(err.response?.data?.message || 'Failed to change password.');
    }
    setTimeout(() => setPassMsg(''), 3000);
  };

  const reset = () => {
    if (window.confirm('Reset all study progress? This cannot be undone.')) {
      const subjects = storage.getSubjects() || {};
      const topics   = storage.getTopics()   || {};
      storage.saveStudy(user.email, initUserStudyData(user.email, subjects, topics));
      window.location.reload();
    }
  };

  return (
    <>
      <Topbar title="Settings" studyData={studyData} onNav={onNav} />
      <div className="page-full">
          <div className="settings-layout settings-shell">
          <div className="settings-grid">
          <div className="settings-col">

          {/* 1. Account */}
          <Section icon={IcoUser} title="Account Settings">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11, marginBottom:14 }}>
              <div className="ff"><label>Full Name</label><input className="finp" value={account.name} onChange={e => setAccount({...account,name:e.target.value})} /></div>
              <div className="ff"><label>Email Address</label><input className="finp" value={account.email} disabled style={{ opacity:.6 }} /></div>
              <div className="ff"><label>Phone Number</label><input className="finp" placeholder="+91 XXXXXXXXXX" value={account.phone} onChange={e => setAccount({...account,phone:e.target.value})} /></div>
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>Profile Picture</div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#1e2d4a,#2563c8)', color:'#fff', fontSize:18, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{user?.name?.[0]?.toUpperCase()}</div>
                <button style={{ padding:'7px 13px', background:'var(--bg)', border:'1.5px solid var(--border)', borderRadius:8, fontSize:12, fontWeight:600, color:'var(--t2)', cursor:'pointer', fontFamily:'inherit' }}>Upload Photo</button>
              </div>
            </div>
            <button className="btn btn-p" onClick={() => saveFn('account', { name:account.name, phone:account.phone })}>
              {saved === 'account' ? '✓ Saved!' : 'Save Changes'}
            </button>
          </Section>

          {/* 2. Password */}
          <Section icon={IcoLock} title="Password & Security">
            {passMsg && (
              <div style={{ padding:'8px 12px', marginBottom:12, borderRadius:'var(--r-sm)', fontSize:12, fontWeight:600,
                background: passMsg.startsWith('✓') ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.07)',
                color: passMsg.startsWith('✓') ? '#16a34a' : '#dc2626', border:`1px solid ${passMsg.startsWith('✓') ? '#16a34a' : '#dc2626'}` }}>
                {passMsg}
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
              {[['current','Current Password'],['newp','New Password'],['confirm','Confirm New Password']].map(([k,l]) => (
                <div key={k} className="ff"><label>{l}</label><input className="finp" type="password" value={pass[k]} onChange={e => setPass({...pass,[k]:e.target.value})} /></div>
              ))}
            </div>
            <button className="btn btn-p" onClick={changePassword}>Change Password</button>
          </Section>
          </div>
          <div className="settings-col">

          {/* 3. Study Prefs */}
          <Section icon={IcoBook} title="Study Preferences">
            <Row label="Preferred Study Time" sub="When do you prefer to study?">
              <select className="finp" style={{ width:130, padding:'7px 10px' }} value={prefs.studyTime} onChange={e => setPrefs({...prefs,studyTime:e.target.value})}>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </Row>
            <Row label="Daily Study Goal" sub="Hours per day">
              <select className="finp" style={{ width:90, padding:'7px 10px' }} value={prefs.dailyGoal} onChange={e => setPrefs({...prefs,dailyGoal:Number(e.target.value)})}>
                {[1,2,3,4,5,6,8].map(h => <option key={h} value={h}>{h}h</option>)}
              </select>
            </Row>
            <div style={{ padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:9 }}>Difficulty Preference</div>
              <div style={{ display:'flex', gap:8 }}>
                {['easy','medium','hard'].map(d => (
                  <button key={d} onClick={() => setPrefs({...prefs,difficulty:d})} style={{ padding:'7px 16px', borderRadius:99, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid', borderColor:prefs.difficulty===d?'var(--blue-btn)':'var(--border)', background:prefs.difficulty===d?'var(--blue-btn)':'transparent', color:prefs.difficulty===d?'#fff':'var(--t2)', textTransform:'capitalize', fontFamily:'inherit' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginTop:14 }}><button className="btn btn-p" onClick={() => saveFn('prefs', prefs)}>{saved==='prefs'?'✓ Saved!':'Save Preferences'}</button></div>
          </Section>

          {/* 4. Notifications */}
          <Section icon={IcoBell} title="Notification Settings">
            {[
              { k:'email',         label:'Email Notifications',   sub:'Receive updates via email' },
              { k:'studyReminder', label:'Study Reminders',       sub:'Daily reminder to maintain your streak' },
              { k:'testReminder',  label:'Test Reminders',        sub:'Reminders for scheduled tests' },
              { k:'weeklyReport',  label:'Weekly Progress Report',sub:'Summary of your weekly progress' },
            ].map(n => (
              <Row key={n.k} label={n.label} sub={n.sub}>
                <label className="tgl">
                  <input type="checkbox" checked={notifs[n.k]} onChange={() => setNotifs(p => ({...p,[n.k]:!p[n.k]}))} />
                  <span className="tgl-s"/>
                </label>
              </Row>
            ))}
          </Section>

          </div>
          </div>

          {/* 6. Danger Zone */}
          <Section icon={IcoAlert} title="Account Actions" danger>
            <Row label="Reset Progress" sub="Clear all study progress and test history">
              <button className="btn-d" onClick={reset}>Reset Data</button>
            </Row>
            <Row label="Sign Out" sub="Log out of your account">
              <button className="btn-d" onClick={logout} style={{ display:'flex', alignItems:'center', gap:6 }}><IcoSignOut /> Sign Out</button>
            </Row>
            <div style={{ padding:'11px 0 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#dc2626' }}>Delete Account</div>
                <div style={{ fontSize:11, color:'var(--t3)', marginTop:1 }}>Permanently delete your account and all data</div>
              </div>
              <button style={{ padding:'7px 14px', background:'#dc2626', color:'#fff', border:'none', borderRadius:'var(--r-sm)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Delete</button>
            </div>
          </Section>
          </div>
          
    </div>
    </>
  );
}
