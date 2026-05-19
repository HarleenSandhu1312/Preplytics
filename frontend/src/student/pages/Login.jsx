import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Login({ onGoRegister, onBack, onSuccess }) {
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [serverErr, setServerErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setServerErr('');
    const err = await login(form.email, form.password);
    setLoading(false);

    if (err) {
      setServerErr(err);
    } else {
      onSuccess && onSuccess();
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <button className="auth-left-back" onClick={onBack}>← Back to Dashboard</button>
        <div className="auth-brand">Prep<span>Lytics</span></div>
        <h1 className="auth-headline">Smarter Prep.<br />Better Results.</h1>
        <p className="auth-tagline">AI-powered revision scheduling, topic tracking, and performance analytics for GATE, Semester & Placement prep.</p>
        <div className="auth-feats">
          <div className="auth-feat">Smart Revision Scheduling</div>
          <div className="auth-feat">Real-time Analytics</div>
          <div className="auth-feat">Adaptive Mini Tests</div>
          <div className="auth-feat">PDF Notes Library</div>
        </div>
        <div className="auth-creds">
          <div className="auth-creds-title">Demo Credentials</div>
          <p>
            <strong>Admin:</strong> admin@preplytics.com / admin123<br />
            <strong>Student:</strong> Register a new account
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <button className="auth-back-btn" onClick={onBack}>← Dashboard</button>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-sub">Sign in to continue your preparation</p>

          <form onSubmit={submit}>
            <div className="fg">
              <label>Email Address</label>
              <input
                className={`ainp ${errors.email ? 'err' : ''}`}
                type="email" placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <span className="ferr">{errors.email}</span>}
            </div>
            <div className="fg">
              <label>Password</label>
              <input
                className={`ainp ${errors.password ? 'err' : ''}`}
                type="password" placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && <span className="ferr">{errors.password}</span>}
            </div>
            {serverErr && <div className="auth-err">{serverErr}</div>}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <p className="auth-switch">
            No account? <span onClick={onGoRegister}>Register here</span>
          </p>
        </div>
      </div>
    </div>
  );
}
