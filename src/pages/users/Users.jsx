import { useEffect, useState } from 'react';
import { fetchUserList, addUser, updateUser } from '../../lib/api';
import { MobileCardSkeleton, TableSkeleton } from '../../components/LoadingState';

const ROLES = [
  { value: 'Admin', label: 'Admin' },
  { value: 'OfficeStaff', label: 'Office Staff' },
  { value: 'Guard', label: 'Guard' },
];

const EMPTY_FORM = { Name: '', Mobile: '', Role: 'Admin', GateName: '', Designation: '', Email: '', Username: '', Password: '' };

function UserFormModal({ initial, onCancel, onSaved }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(initial ? {
    Name: initial.name, Mobile: initial.mobile, Role: initial.role,
    GateName: initial.gateName || '', Designation: initial.designation || '',
    Email: initial.email || '', Username: initial.username || '', Password: '',
  } : EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const canLogin = form.Role !== 'Guard'; // only Admin/OfficeStaff log into vimpactapp

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (canLogin && !form.Username.trim()) return setError('Username is required for this role.');
    if (canLogin && !isEdit && !form.Password) return setError('Password is required for this role.');

    setSaving(true);
    try {
      const payload = {
        Name: form.Name.trim(),
        Mobile: form.Mobile.trim(),
        Role: form.Role,
        GateName: form.Role === 'Guard' ? form.GateName.trim() || null : null,
        Designation: form.Designation.trim() || null,
        Email: form.Email.trim() || null,
        Username: canLogin ? form.Username.trim() : null,
        // Blank password on edit means "leave unchanged"; on add it's already required above.
        Password: canLogin && form.Password ? form.Password : null,
      };
      if (isEdit) await updateUser(initial.userId, payload);
      else await addUser(payload);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tag-modal-overlay" onClick={onCancel}>
      <div className="tag-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{isEdit ? 'Edit User' : 'Add User'}</h3>
        <p className="tag-modal-sub">Basic employee information and role.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="login-field">
            <span>Name</span>
            <input type="text" value={form.Name} onChange={(e) => set('Name', e.target.value)} autoFocus required />
          </label>

          <label className="login-field">
            <span>Mobile</span>
            <input
              type="text" inputMode="numeric" maxLength={10}
              value={form.Mobile} onChange={(e) => set('Mobile', e.target.value.replace(/\D/g, ''))}
              required
            />
          </label>

          <label className="login-field">
            <span>Role</span>
            <select value={form.Role} onChange={(e) => set('Role', e.target.value)}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>

          {form.Role === 'Guard' && (
            <label className="login-field">
              <span>Gate</span>
              <input type="text" value={form.GateName} onChange={(e) => set('GateName', e.target.value)} placeholder="e.g. Gate 1" />
            </label>
          )}

          <label className="login-field">
            <span>Designation</span>
            <input type="text" value={form.Designation} onChange={(e) => set('Designation', e.target.value)} placeholder="Optional" />
          </label>

          <label className="login-field">
            <span>Email</span>
            <input type="email" value={form.Email} onChange={(e) => set('Email', e.target.value)} placeholder="Optional" />
          </label>

          {canLogin && (
            <>
              <label className="login-field">
                <span>Username <em style={{ fontStyle: 'normal', color: 'var(--ink-faint)', fontWeight: 500 }}>for vimpactapp login</em></span>
                <input type="text" value={form.Username} onChange={(e) => set('Username', e.target.value)} autoComplete="off" />
              </label>

              <label className="login-field">
                <span>Password {isEdit && <em style={{ fontStyle: 'normal', color: 'var(--ink-faint)', fontWeight: 500 }}>leave blank to keep unchanged</em>}</span>
                <input type="password" value={form.Password} onChange={(e) => set('Password', e.target.value)} autoComplete="new-password" />
              </label>
            </>
          )}

          {error && <p className="login-field" style={{ color: 'var(--crit)' }}>{error}</p>}

          <div className="tag-modal-actions">
            <button type="button" className="btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalUser, setModalUser] = useState(undefined); // undefined = closed, null = add, object = edit

  async function load() {
    setLoading(true);
    setError('');
    try {
      setRows(await fetchUserList());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load();
  }, []);

  function handleSaved() {
    setModalUser(undefined);
    load();
  }

  return (
    <div className="table-page">
      <div className="table-toolbar">
        <button type="button" className="table-search-btn" onClick={() => setModalUser(null)}>+ Add User</button>
      </div>

      {error && <p className="page-banner page-banner-error">{error}</p>}

      {loading && (
        <>
          <TableSkeleton columns={7} rows={6} />
          <MobileCardSkeleton cards={3} />
        </>
      )}

      {!loading && !error && (
        <>
          <div className="table-wrap table-desktop">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="col-sno">S. No.</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Gate</th>
                  <th>Designation</th>
                  <th className="col-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="table-empty">No users yet.</td></tr>
                )}
                {rows.map((row, i) => (
                  <tr key={row.userId}>
                    <td className="col-sno">{i + 1}</td>
                    <td>{row.name}</td>
                    <td className="mono">{row.mobile}</td>
                    <td>{ROLES.find((r) => r.value === row.role)?.label || row.role}</td>
                    <td>{row.gateName || '—'}</td>
                    <td>{row.designation || '—'}</td>
                    <td className="col-action">
                      <button type="button" className="table-action-btn" onClick={() => setModalUser(row)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-card-list">
            {rows.length === 0 && (
              <p className="table-empty">No users yet.</p>
            )}
            {rows.map((row, i) => (
              <article className="mobile-card" key={row.userId}>
                <div className="mobile-card-top">
                  <span className="mobile-card-index">#{i + 1}</span>
                  <strong className="mobile-card-id">{row.name}</strong>
                </div>
                <dl className="mobile-card-meta">
                  <div><dt>Mobile</dt><dd className="mono">{row.mobile}</dd></div>
                  <div><dt>Role</dt><dd>{ROLES.find((r) => r.value === row.role)?.label || row.role}</dd></div>
                  <div><dt>Gate</dt><dd>{row.gateName || '—'}</dd></div>
                  <div><dt>Designation</dt><dd>{row.designation || '—'}</dd></div>
                </dl>
                <button type="button" className="table-action-btn mobile-card-action" onClick={() => setModalUser(row)}>
                  Edit
                </button>
              </article>
            ))}
          </div>
        </>
      )}

      {modalUser !== undefined && (
        <UserFormModal initial={modalUser} onCancel={() => setModalUser(undefined)} onSaved={handleSaved} />
      )}
    </div>
  );
}
