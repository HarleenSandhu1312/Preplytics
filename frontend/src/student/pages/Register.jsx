import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const pwStrength = (p) => {
  if (!p) return null;
  if (p.length < 6) return 'weak';
  if (p.match(/[A-Z]/) && p.match(/[0-9]/)) return 'strong';
  return 'mid';
};

export default function Register({ onGoLogin, onBack, onSuccess }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    examTarget: '', branch: '', semester: '',
    acceptedTerms: false,
  });
  const [errors, setErrors]   = useState({});
  const [serverErr, setServerErr] = useState('');
  const [loading, setLoading] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim())  errs.name = 'Name is required';
    if (!form.email)        errs.email = 'Email is required';
    if (!form.password)     errs.password = 'Password is required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) errs.confirm = "Passwords don't match";
    if (!form.examTarget)   errs.examTarget = 'Select exam target';
    if (!form.branch)       errs.branch = 'Select your branch';
    if (form.examTarget === 'Semester Exam' && !form.semester) errs.semester = 'Select semester';
    if (!form.acceptedTerms) errs.acceptedTerms = 'You must accept the Terms & Conditions';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setServerErr('');
    const err = await register(form);
    setLoading(false);

    if (err) {
      setServerErr(err);
    } else {
      onSuccess && onSuccess();
    }
  };

  const str = pwStrength(form.password);

  return (
    <div className="auth-page">
      <div className="auth-left">
        <button className="auth-left-back" onClick={onBack}>← Back to Dashboard</button>
        <div className="auth-brand">Prep<span>Lytics</span></div>
        <h1 className="auth-headline">Your Exam.<br />Your Strategy.</h1>
        <p className="auth-tagline">Set your target, track your subjects, and let the smart scheduler handle the rest.</p>
        <div className="auth-feats">
          <div className="auth-feat">GATE / Semester / Placement</div>
          <div className="auth-feat">Auto-generated Planner</div>
          <div className="auth-feat">Weak Topic Detection</div>
          <div className="auth-feat">PDF Notes from Admin</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <button className="auth-back-btn" onClick={onBack}>← Dashboard</button>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-sub">Start your focused exam prep today</p>

          <form onSubmit={submit}>
            <div className="fg">
              <label>Full Name</label>
              <input className={`ainp ${errors.name ? 'err' : ''}`} type="text" placeholder="Your full name"
                value={form.name} onChange={e => f('name', e.target.value)} />
              {errors.name && <span className="ferr">{errors.name}</span>}
            </div>
            <div className="fg">
              <label>Email Address</label>
              <input className={`ainp ${errors.email ? 'err' : ''}`} type="email" placeholder="you@example.com"
                value={form.email} onChange={e => f('email', e.target.value)} />
              {errors.email && <span className="ferr">{errors.email}</span>}
            </div>
            <div className="fg">
              <label>Password</label>
              <input className={`ainp ${errors.password ? 'err' : ''}`} type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={e => f('password', e.target.value)} />
              {str && (
                <div className={`pw-str ${str}`}>
                  <div className="pw-bar"><div className="pw-bar-f" /></div>
                  <span>{{ weak: 'Weak', mid: 'Fair', strong: 'Strong' }[str]}</span>
                </div>
              )}
              {errors.password && <span className="ferr">{errors.password}</span>}
            </div>
            <div className="fg">
              <label>Confirm Password</label>
              <input className={`ainp ${errors.confirm ? 'err' : ''}`} type="password" placeholder="Repeat password"
                value={form.confirm} onChange={e => f('confirm', e.target.value)} />
              {errors.confirm && <span className="ferr">{errors.confirm}</span>}
            </div>
            <div className="fg">
              <label>Exam Target</label>
              <select className={`ainp ${errors.examTarget ? 'err' : ''}`} value={form.examTarget} onChange={e => f('examTarget', e.target.value)}>
                <option value="">Select exam target</option>
                <option value="GATE">GATE</option>
                <option value="Semester Exam">Semester Exam</option>
                <option value="Placement Prep">Placement Prep</option>
              </select>
              {errors.examTarget && <span className="ferr">{errors.examTarget}</span>}
            </div>
            {form.examTarget === 'Semester Exam' && (
              <div className="fg">
                <label>Semester</label>
                <select className={`ainp ${errors.semester ? 'err' : ''}`} value={form.semester} onChange={e => f('semester', e.target.value)}>
                  <option value="">Select semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
                {errors.semester && <span className="ferr">{errors.semester}</span>}
              </div>
            )}
            <div className="fg">
              <label>Branch</label>
              <select className={`ainp ${errors.branch ? 'err' : ''}`} value={form.branch} onChange={e => f('branch', e.target.value)}>
                <option value="">Select branch</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Other">Other</option>
              </select>
              {errors.branch && <span className="ferr">{errors.branch}</span>}
            </div>

            {/* Terms & Conditions checkbox */}
            <div className="fg" style={{ marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontWeight: 400 }}>
                <input
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={e => f('acceptedTerms', e.target.checked)}
                  style={{ marginTop: 3, accentColor: 'var(--blue-btn, #3b82f6)', width: 16, height: 16, flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <span style={{ color: 'var(--blue-btn, #3b82f6)', textDecoration: 'underline', cursor: 'pointer' }}>
                    Terms & Conditions
                  </span>{' '}
                  and{' '}
                  <span style={{ color: 'var(--blue-btn, #3b82f6)', textDecoration: 'underline', cursor: 'pointer' }}>
                    Privacy Policy
                  </span>
                </span>
              </label>
              {errors.acceptedTerms && <span className="ferr">{errors.acceptedTerms}</span>}
            </div>

            {serverErr && <div className="auth-err">{serverErr}</div>}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>
          <p className="auth-switch">
            Already have an account? <span onClick={onGoLogin}>Sign In</span>
          </p>
        </div>
      </div>
    </div>
  );
}
