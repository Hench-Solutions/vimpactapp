import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startSession } from '../../lib/session';
import { DEMO_ROLES } from '../../lib/mockData';
import logo from '../../assets/vimpact-logo.png';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState(DEMO_ROLES[0]);
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!username.trim()) next.username = 'User ID is required';
    if (!password) next.password = 'Password is required';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    // No API call yet - UI only. Once /v1/Auth exists this becomes the
    // same fetch + startSession pattern already used in guard-pwa, and
    // `role` will come back from the server instead of this dropdown.
    startSession({ username: username.trim(), role });
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <img src={logo} className="login-logo" alt="Vimpact Care Pvt. Ltd." />
        <div className="login-panel-text">
          <h1>Vimpact App</h1>
          <p>One workspace for gate reconciliation, users, and reports.</p>
        </div>
      </div>

      <div className="login-formside">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <h2>Welcome back</h2>
          <p className="login-sub">Sign in to continue</p>

          <label className="login-field">
            <span>User ID</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
            {errors.username && <em>{errors.username}</em>}
          </label>

          <label className="login-field">
            <span>Password</span>
            <div className="login-pass-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="login-pass-toggle" onClick={() => setShowPass((p) => !p)}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <em>{errors.password}</em>}
          </label>

          <label className="login-field login-field-demo">
            <span>Role <em className="login-demo-tag">demo only - comes from server later</em></span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {DEMO_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>

          <button type="submit" className="login-submit">Log In</button>
        </form>

        <p className="login-footer">© {new Date().getFullYear()} Vimpact Care Pvt. Ltd.</p>
      </div>
    </div>
  );
}
