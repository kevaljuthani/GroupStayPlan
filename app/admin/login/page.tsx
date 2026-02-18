'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function onSubmit(formData: FormData) {
    setError('');
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: String(formData.get('username') ?? ''),
        password: String(formData.get('password') ?? '')
      })
    });

    if (!response.ok) {
      setError('Invalid credentials. Update .env.local and retry.');
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <main className="container" style={{ maxWidth: 480 }}>
      <section className="panel">
        <h1>Admin login</h1>
        <p className="small">Credentials are currently configured through environment variables.</p>
        <form action={onSubmit}>
          <label>
            Username
            <input required name="username" />
          </label>
          <label>
            Password
            <input required type="password" name="password" />
          </label>
          {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
          <button className="primary" type="submit">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
