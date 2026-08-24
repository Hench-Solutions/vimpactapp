import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startSession } from '../../lib/session';
import { useVisual } from '../../lib/useVisual';
import { DEMO_ROLES } from '../../lib/mockData';
import logo from '../../assets/vimpact-logo.png';

export default function Login() {
  const visual = useVisual();
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
    // `role` will come back from the server instead of this picker.
    startSession({ username: username.trim(), role });
    navigate('/dashboard', { replace: true });
  }

  return visual === 'green'
    ? (
      <ModernLogin
        username={username} setUsername={setUsername}
        password={password} setPassword={setPassword}
        showPass={showPass} setShowPass={setShowPass}
        role={role} setRole={setRole}
        errors={errors} onSubmit={handleSubmit}
      />
    )
    : (
      <ClassicLogin
        username={username} setUsername={setUsername}
        password={password} setPassword={setPassword}
        showPass={showPass} setShowPass={setShowPass}
        role={role} setRole={setRole}
        errors={errors} onSubmit={handleSubmit}
      />
    );
}

// ───────────────────────── Design 1 · Classic ─────────────────────────
function ClassicLogin({ username, setUsername, password, setPassword, showPass, setShowPass, role, setRole, errors, onSubmit }) {
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
        <form className="login-card" onSubmit={onSubmit} noValidate>
          <h2>Welcome back</h2>
          <p className="login-sub">Sign in to continue</p>

          <label className="login-field">
            <span>User ID</span>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
            {errors.username && <em>{errors.username}</em>}
          </label>

          <label className="login-field">
            <span>Password</span>
            <div className="login-pass-wrap">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              <button type="button" className="login-pass-toggle" onClick={() => setShowPass((p) => !p)}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <em>{errors.password}</em>}
          </label>

          <label className="login-field login-field-demo">
            <span>Role <em className="login-demo-tag">demo only - comes from server later</em></span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {DEMO_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>

          <button type="submit" className="login-submit">Log In</button>
        </form>

        <p className="login-footer">© {new Date().getFullYear()} Vimpact Care Pvt. Ltd.</p>
      </div>
    </div>
  );
}

// ───────────────────────── Design 2 · Modern ─────────────────────────
function ModernLogin({ username, setUsername, password, setPassword, showPass, setShowPass, role, setRole, errors, onSubmit }) {
  return (
    <div className="mlogin-page">
      <span className="mlogin-blob mlogin-blob-a" />
      <span className="mlogin-blob mlogin-blob-b" />
      <span className="mlogin-blob mlogin-blob-c" />

      <form className="mlogin-card" onSubmit={onSubmit} noValidate>
        <img src={logo} className="mlogin-logo" alt="Vimpact Care Pvt. Ltd." />
        <h1 className="mlogin-title">Vimpact App</h1>
        <p className="mlogin-sub">Gate reconciliation, users &amp; reports - one workspace</p>

        <div className="mlogin-field">
          <input
            id="mlogin-user"
            type="text"
            placeholder=" "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
          />
          <label htmlFor="mlogin-user">User ID</label>
          {errors.username && <em>{errors.username}</em>}
        </div>

        <div className="mlogin-field">
          <input
            id="mlogin-pass"
            type={showPass ? 'text' : 'password'}
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <label htmlFor="mlogin-pass">Password</label>
          <button type="button" className="mlogin-eye" onClick={() => setShowPass((p) => !p)} aria-label="Toggle password visibility">
            {showPass ? '🙈' : '👁'}
          </button>
          {errors.password && <em>{errors.password}</em>}
        </div>

        <div className="mlogin-roles">
          <span className="mlogin-roles-label">Role <i>demo only</i></span>
          <div className="mlogin-chips">
            {DEMO_ROLES.map((r) => (
              <button
                type="button"
                key={r}
                className={`mlogin-chip ${role === r ? 'active' : ''}`}
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="mlogin-submit">Log In →</button>
        <p className="mlogin-footer">© {new Date().getFullYear()} Vimpact Care Pvt. Ltd.</p>
      </form>
    </div>
  );
}
