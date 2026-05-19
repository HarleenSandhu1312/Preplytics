import { useState, useEffect } from 'react';
import Topbar from '../../shared/Topbar';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';
import { storage } from '../../utils/storage';

export default function AdminSettings({ onNav }) {
  const { theme, toggle } = useTheme();
  const [users, setUsers]           = useState([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [form, setForm]             = useState({ name: '', email: '', password: '' });
  const [err, setErr]               = useState('');
  const [statusMsg, setStatusMsg]   = useState('');
  const [settings, setSettings]     = useState(() => storage.getSettings());
  const [pass, setPass]             = useState({ current: '', next: '', confirm: '' });
  const [passMsg, setPassMsg]       = useState('');

  useEffect(() => {
    api.get('/admin/users').then(res => setUsers(res.data.data || [])).catch(() => {});
  }, []);

  const saveSettings = () => {
    storage.saveSettings(settings);
    setStatusMsg('System settings saved.');
    setTimeout(() => setStatusMsg(''), 2200);
  };

  const addAdmin = async () => {
    setErr('');
    if (!form.name || !form.email || !form.password) { setErr('All fields required'); return; }
    try {
      const res = await api.post('/admin/users', { ...form, role: 'admin' });
      setUsers(prev => [...prev, res.data.data]);
      setShowAddAdmin(false);
      setForm({ name: '', email: '', password: '' });
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to add admin');
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm('Remove this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      setStatusMsg('User removed successfully.');
      setTimeout(() => setStatusMsg(''), 2200);
    } catch (e) {
      setStatusMsg(e.response?.data?.message || 'Failed to remove user');
      setTimeout(() => setStatusMsg(''), 2500);
    }
  };

  const changePassword = async () => {
    setPassMsg('');
    if (!pass.current || !pass.next || !pass.confirm) {
      setPassMsg('Please fill all password fields.');
      return;
    }
    if (pass.next !== pass.confirm) {
      setPassMsg('New password and confirm password must match.');
      return;
    }
    if (pass.next.length < 6) {
      setPassMsg('New password must be at least 6 characters.');
      return;
    }
    try {
      await api.put('/auth/change-password', { currentPassword: pass.current, newPassword: pass.next });
      setPass({ current: '', next: '', confirm: '' });
      setPassMsg('Password updated successfully.');
    } catch (e) {
      setPassMsg(e.response?.data?.message || 'Failed to change password.');
    }
  };

  const admins   = users.filter(u => u.role === 'admin');
  const students = users.filter(u => u.role !== 'admin');

  return (
    <>
      <Topbar title="Admin Settings" onNav={onNav} />
      <div className="page-full">
        {statusMsg && (
          <div style={{ marginBottom:12, padding:'9px 12px', borderRadius:'var(--r-sm)', fontSize:12, fontWeight:600, background:'var(--blue-soft)', color:'var(--blue-mid)', border:'1px solid rgba(37,99,200,0.22)' }}>
            {statusMsg}
          </div>
        )}

        <div className="admin-sec">
          <div className="admin-sec-hd"><span className="admin-sec-title">Appearance</span></div>
          <div className="admin-sec-body">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500 }}>Dark Mode</div>
                <div style={{ fontSize:11, color:'var(--t3)' }}>Toggle light/dark theme</div>
              </div>
              <label className="tgl"><input type="checkbox" checked={theme === 'dark'} onChange={toggle} /><span className="tgl-s" /></label>
            </div>
          </div>
        </div>

        <div className="admin-sec">
          <div className="admin-sec-hd"><span className="admin-sec-title">System Thresholds</span></div>
          <div className="admin-sec-body">
            <div className="form-grid">
              <div className="ff">
                <label>Alert Students Below (%)</label>
                <input className="finp" type="number" value={settings.failThreshold}
                  onChange={e => setSettings(s => ({ ...s, failThreshold: Number(e.target.value) }))} />
              </div>
              <div className="ff">
                <label>Default Revision Days</label>
                <input className="finp" type="number" value={settings.revDays}
                  onChange={e => setSettings(s => ({ ...s, revDays: Number(e.target.value) }))} />
              </div>
            </div>
            <div style={{ marginTop:14 }}>
              <button className="btn btn-p" onClick={saveSettings}>Save Settings</button>
            </div>
          </div>
        </div>

        <div className="admin-sec">
          <div className="admin-sec-hd"><span className="admin-sec-title">Update Password</span></div>
          <div className="admin-sec-body">
            {passMsg && (
              <div style={{ marginBottom:12, padding:'8px 12px', borderRadius:'var(--r-sm)', fontSize:12, fontWeight:600, background: passMsg.includes('success') ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)', color: passMsg.includes('success') ? '#16a34a' : '#dc2626', border:`1px solid ${passMsg.includes('success') ? '#16a34a' : '#dc2626'}` }}>
                {passMsg}
              </div>
            )}
            <div className="form-grid">
              <div className="ff"><label>Current Password</label><input className="finp" type="password" value={pass.current} onChange={(e) => setPass((p) => ({ ...p, current: e.target.value }))} /></div>
              <div className="ff"><label>New Password</label><input className="finp" type="password" value={pass.next} onChange={(e) => setPass((p) => ({ ...p, next: e.target.value }))} /></div>
              <div className="ff"><label>Confirm Password</label><input className="finp" type="password" value={pass.confirm} onChange={(e) => setPass((p) => ({ ...p, confirm: e.target.value }))} /></div>
            </div>
            <div style={{ marginTop:14 }}><button className="btn btn-p" onClick={changePassword}>Change Password</button></div>
          </div>
        </div>

        <div className="admin-sec">
          <div className="admin-sec-hd">
            <span className="admin-sec-title">Admin Accounts</span>
            <button className="btn btn-p" onClick={() => setShowAddAdmin(v => !v)}>+ Add Admin</button>
          </div>
          {showAddAdmin && (
            <div style={{ padding:'14px 19px', borderBottom:'1px solid var(--border)', background:'var(--panel)' }}>
              {err && <div style={{ color:'var(--red)', fontSize:12, marginBottom:8 }}>{err}</div>}
              <div className="form-grid">
                <div className="ff"><label>Name</label><input className="finp" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="ff"><label>Email</label><input className="finp" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="ff"><label>Password</label><input className="finp" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
              </div>
              <div className="form-actions" style={{ marginTop:10 }}>
                <button className="btn btn-p" onClick={addAdmin}>Add Admin</button>
                <button className="btn btn-g" onClick={() => setShowAddAdmin(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div>
            <div className="admin-tbl-hd admin-tbl-row" style={{ gridTemplateColumns:'2fr 2fr 1fr 1fr' }}>
              <span>Name</span><span>Email</span><span>Role</span><span>Action</span>
            </div>
            {admins.map((u) => (
              <div key={u._id} className="admin-tbl-row" style={{ gridTemplateColumns:'2fr 2fr 1fr 1fr' }}>
                <span style={{ fontWeight:600 }}>{u.name}</span>
                <span style={{ color:'var(--t2)', fontSize:12 }}>{u.email}</span>
                <span className="bdg bdg-blue">Admin</span>
                {admins.length > 1
                  ? <button className="btn-sm danger" onClick={() => removeUser(u._id)}>Remove</button>
                  : <span style={{ fontSize:11, color:'var(--t3)' }}>Primary</span>
                }
              </div>
            ))}
          </div>
        </div>

        <div className="admin-sec">
          <div className="admin-sec-hd">
            <span className="admin-sec-title">Registered Students ({students.length})</span>
          </div>
          <div>
            <div className="admin-tbl-hd admin-tbl-row" style={{ gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr' }}>
              <span>Name</span><span>Email</span><span>Branch</span><span>Exam</span><span>Action</span>
            </div>
            {students.length === 0 ? (
              <div style={{ color:'var(--t3)', fontSize:13, padding:'12px 0', textAlign:'center' }}>No students registered yet.</div>
            ) : students.map((u) => (
              <div key={u._id} className="admin-tbl-row" style={{ gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr' }}>
                <span style={{ fontWeight:600 }}>{u.name}</span>
                <span style={{ color:'var(--t2)', fontSize:12 }}>{u.email}</span>
                <span>{u.branch || '—'}</span>
                <span>{u.examTarget || '—'}</span>
                <button className="btn-sm danger" onClick={() => removeUser(u._id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
