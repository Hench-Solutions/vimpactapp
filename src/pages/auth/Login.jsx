import { useState } from "react";

import { useNavigate } from "react-router-dom";

import logo from "../../assets/vimpact-logo.png";
import DesignToggle from "../../components/DesignToggle";
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from "../../components/Icons";
import { loginUser } from "../../lib/api";
import { homeForRole } from "../../lib/menus";
import { startSession } from "../../lib/session";
import { useVisual } from "../../lib/useVisual";

export default function Login() {
  const visual = useVisual();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!username.trim()) next.username = "Username is required";
    if (!password) next.password = "Password is required";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const user = await loginUser(username.trim(), password);
      startSession(user);
      navigate(homeForRole(user.role), { replace: true });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const formProps = {
    username,
    setUsername,
    password,
    setPassword,
    showPass,
    setShowPass,
    errors,
    formError,
    loading,
    onSubmit: handleSubmit,
  };

  return (
    <>
      <DesignToggle floating />
      {visual === "green" ?
        <ModernLogin {...formProps} />
      : <ClassicLogin {...formProps} />}
    </>
  );
}

function ClassicLogin({
  username,
  setUsername,
  password,
  setPassword,
  showPass,
  setShowPass,
  errors,
  formError,
  loading,
  onSubmit,
}) {
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
            <span>Username</span>
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
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-pass-toggle"
                onClick={() => setShowPass((p) => !p)}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <em>{errors.password}</em>}
          </label>

          {formError && (
            <p className="login-field" style={{ color: "var(--crit)" }}>
              {formError}
            </p>
          )}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Signing in…" : "Log In"}
          </button>
        </form>

        <p className="login-footer">
          © {new Date().getFullYear()} Vimpact Care Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}

function ModernLogin({
  username,
  setUsername,
  password,
  setPassword,
  showPass,
  setShowPass,
  errors,
  formError,
  loading,
  onSubmit,
}) {
  return (
    <div className="mlogin-page">
      <span className="mlogin-blob mlogin-blob-a" />
      <span className="mlogin-blob mlogin-blob-b" />
      <span className="mlogin-blob mlogin-blob-c" />

      <form className="mlogin-card" onSubmit={onSubmit} noValidate>
        <img src={logo} className="mlogin-logo" alt="Vimpact Care Pvt. Ltd." />
        <h1 className="mlogin-title">Vimpact App</h1>
        <p className="mlogin-sub">
          Gate reconciliation, users &amp; reports - one workspace
        </p>

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
          <label htmlFor="mlogin-user">Username</label>
          {errors.username && <em>{errors.username}</em>}
        </div>

        <div className="mlogin-field">
          <input
            id="mlogin-pass"
            type={showPass ? "text" : "password"}
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <label htmlFor="mlogin-pass">Password</label>
          <button
            type="button"
            className="mlogin-eye"
            onClick={() => setShowPass((p) => !p)}
            aria-label="Toggle password visibility"
          >
            {showPass ?
              <EyeOffIcon size={18} />
            : <EyeIcon size={18} />}
          </button>
          {errors.password && <em>{errors.password}</em>}
        </div>

        {formError && (
          <em style={{ display: "block", marginBottom: 12 }}>{formError}</em>
        )}

        <button type="submit" className="mlogin-submit" disabled={loading}>
          {loading ?
            "Signing in…"
          : <>
              Log In
              <ArrowRightIcon size={16} />
            </>
          }
        </button>
        <p className="mlogin-footer">
          © {new Date().getFullYear()} Vimpact Care Pvt. Ltd.
        </p>
      </form>
    </div>
  );
}
