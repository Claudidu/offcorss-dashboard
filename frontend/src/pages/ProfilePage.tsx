import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { gql } from '../api/graphql';
import { USER_FIELDS, useAuth, type User } from '../auth/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO');
}

function Row({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center pv2 bb b--near-white">
      <dt className="w-100 w-30-ns gray">
        {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : label}
      </dt>
      <dd className="ml0 w-100 w-70-ns">{children}</dd>
    </div>
  );
}

const readOnlyClass = 'db pa2 bg-near-white mid-gray';
const inputClass = 'field';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', lastName: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!user) return null; // el layout protegido ya garantiza que exista
  const u: User = user;

  function startEditing() {
    setForm({ name: u.name, lastName: u.lastName, email: u.email });
    setError(null);
    setSaved(false);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = {
      name: form.name.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
    };
    // Validación en el navegador: respuesta inmediata al usuario.
    // El backend vuelve a validar: es la que da seguridad.
    if (!input.name || !input.lastName) {
      setError('Name y Last Name son obligatorios');
      return;
    }
    if (!EMAIL_RE.test(input.email)) {
      setError('Email no válido');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const data = await gql<{ updateMe: User }>(
        `mutation UpdateMe($input: UpdateMeInput!) { updateMe(input: $input) { ${USER_FIELDS} } }`,
        { input },
      );
      setUser(data.updateMe); // actualiza también el nombre de la barra
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="pa3 pa4-ns">
      <section className="mw7 center ba b--light-gray pa3 pa4-ns">
        <h1 className="f3 mt0 oc-navy">{editing ? 'Editar perfil' : 'Mi perfil'}</h1>

        {saved && !editing && <p role="status" className="dark-green">Cambios guardados ✓</p>}

        {!editing ? (
          <>
            <dl className="mt0">
              <Row label="Username">{u.username}</Row>
              <Row label="Create Date">{formatDate(u.createdAt)}</Row>
              <Row label="Name">{u.name}</Row>
              <Row label="Last Name">{u.lastName}</Row>
              <Row label="Email">{u.email}</Row>
              <Row label="User Type">{u.userType}</Row>
            </dl>
            <div className="flex items-center mt3">
              <button type="button" onClick={startEditing} className="btn btn-secondary mr3">
                Editar
              </button>
              <Link to="/reporte" className="link oc-blue">Ver reporte →</Link>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} noValidate>
            <dl className="mt0">
              <Row label="Username"><span className={readOnlyClass}>{u.username}</span></Row>
              <Row label="Create Date"><span className={readOnlyClass}>{formatDate(u.createdAt)}</span></Row>
              <Row label="Name" htmlFor="name">
                <input id="name" className={inputClass} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Row>
              <Row label="Last Name" htmlFor="lastName">
                <input id="lastName" className={inputClass} value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </Row>
              <Row label="Email" htmlFor="email">
                <input id="email" type="email" className={inputClass} value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Row>
              <Row label="User Type"><span className={readOnlyClass}>{u.userType}</span></Row>
            </dl>

            {error && <p role="alert" className="dark-red">⚠ {error}</p>}

            <div className="flex items-center mt3">
              <button type="submit" disabled={saving} className="btn btn-primary mr3">
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
              <button type="button" onClick={cancel} disabled={saving} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}