import { useState, type FormEvent } from 'react';
import Brand from './Brand';
import { errorMessage, requestJson } from './api/request';
import paperStudy from './assets/paper-study.webp';

type Props = { initialMessage: string; onAuthenticated: (token: string) => void };

export default function AuthScreen({ initialMessage, onAuthenticated }: Props) {
  const [register, setRegister] = useState(false);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(initialMessage);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await requestJson<{ access_token: string }>(`/api/auth/${register ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      onAuthenticated(result.access_token);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setRegister(!register);
    setMessage('');
    setPassword('');
    setVisible(false);
  }

  return <main className="auth-layout">
    <section className="auth-side" aria-labelledby="auth-title">
      <header><Brand /></header>
      <div className="auth-form">
        <h1 id="auth-title">{register ? 'Create an account' : 'Welcome back'}</h1>
        <p className="intro">{register ? 'Create your workspace to upload PDFs and read their extracted text.' : 'Sign in to your document workspace.'}</p>
        <form onSubmit={submit}>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete={register ? 'email' : 'username'} required placeholder="you@example.com"
            value={email} onChange={event => setEmail(event.target.value)} />
          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input id="password" type={visible ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'}
              required minLength={8} aria-describedby={register ? 'password-hint' : undefined}
              value={password} onChange={event => setPassword(event.target.value)} />
            <button type="button" className="visibility" onClick={() => setVisible(!visible)}
              aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? 'Hide' : 'Show'}</button>
          </div>
          {register && <small className="hint" id="password-hint">Use at least 8 characters.</small>}
          {message && <div className="feedback error" role="alert">{message}</div>}
          <button className="primary auth-submit" type="submit" disabled={busy}>
            {busy ? (register ? 'Creating account…' : 'Signing in…') : (register ? 'Create account' : 'Sign in')}
            <span className="arrow" aria-hidden="true">→</span>
          </button>
        </form>
        <p className="switch-mode">{register ? 'Already have an account?' : 'New to Document AI?'}{' '}
          <button type="button" disabled={busy} onClick={switchMode}>{register ? 'Sign in' : 'Create an account'}</button>
        </p>
      </div>
    </section>
    <div className="art-panel" aria-hidden="true">
      <img src={paperStudy} alt="" width="960" height="1080" fetchPriority="high" />
    </div>
  </main>;
}
