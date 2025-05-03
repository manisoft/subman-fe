import React, { useState, useEffect } from 'react';
import { tokens } from '@fluentui/react-components';
import { Button, Input, Label, Text, Spinner } from '@fluentui/react-components';
import styles from './AuthPage.module.css';
import { login, register } from '../api';

import { useNavigate, useLocation } from 'react-router-dom';

interface AuthPageProps {
  onAuth: (token: string, user: any) => void;
  token?: string | null;
  user?: any;
}

export default function AuthPage({ onAuth, token, user }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const { token, user } = await login(email, password);
        onAuth(token, user);
      } else {
        await register(email, password, name);
        setMode('login');
        setError('Registration successful! Please log in.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Theme detection: prefers-color-scheme, fallback to light, only for unauthenticated users
  useEffect(() => {
    if (!token || !user) {
      const html = document.documentElement;
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
    // After login, theme will be set by SettingsPage based on user preferences
  }, [token, user]);

  // Handle Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Optionally: fetch user info or decode token here
      navigate('/dashboard');
    }
  }, [location, navigate]);

  return (
    <>
      <div className={styles['auth-bg']}>
        <div className={styles['auth-card']}>
          <img src="/logo.png" alt="SubMan Logo" className={styles['auth-logo']} />
          <div className={styles['auth-title']}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </div>
          <div className={styles['auth-subtitle']} style={{ color: 'var(--auth-subtitle-color)' }}>
            {mode === 'login' ? 'Track and manage your subscriptions smartly.' : 'Join SubMan and take control of your subscriptions.'}
          </div>
          <form className={styles['auth-form']} onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <Label htmlFor="auth-name" style={{ color: 'var(--auth-text-color)' }}>Name</Label>
                <Input id="auth-name" value={name} onChange={e => setName((e.target as HTMLInputElement).value)} required size="large" />
              </>
            )}
            <Label htmlFor="auth-email" style={{ color: 'var(--auth-text-color)' }}>Email</Label>
            <Input id="auth-email" type="email" value={email} onChange={e => setEmail((e.target as HTMLInputElement).value)} required size="large" />
            <Label htmlFor="auth-password" style={{ color: 'var(--auth-text-color)' }}>Password</Label>
            <Input id="auth-password" type="password" value={password} onChange={e => setPassword((e.target as HTMLInputElement).value)} required size="large" />
            {error && <Text style={{ color: error.startsWith('Registration') ? tokens.colorPaletteGreenForeground1 : tokens.colorPaletteRedForeground1, textAlign: 'center' }}>{error}</Text>}
            <div className={styles['auth-footer']}>
              <Button appearance="primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 40 }} size="large">
                {loading ? <Spinner size="tiny" /> : mode === 'login' ? 'Sign In' : 'Sign Up'}
              </Button>
            </div>
          </form>
          <Button
            appearance="primary"
            onClick={() => window.location.href = `${process.env.REACT_APP_API_URL || ''}/api/auth/google`}
            style={{ width: '100%', marginBottom: 16 }}
          >
            Sign in with Google
          </Button>
          <div style={{ marginTop: tokens.spacingVerticalL, textAlign: 'center', width: '100%' }}>
            <span style={{ color: 'var(--auth-subtitle-color)', fontSize: tokens.fontSizeBase200 }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <span
              className={styles['auth-link']}
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              tabIndex={0}
              role="button"
              style={{ marginLeft: 2 }}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </span>
            {/* Agreement text for Terms and Privacy */}
            <div style={{ marginTop: 24, fontSize: tokens.fontSizeBase200, color: 'var(--auth-subtitle-color)' }}>
              {mode === 'register'
                ? (
                  <>
                    By creating an account, you agree to our{' '}
                    <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className={styles['auth-link']}>Terms of Service</a>{' '}and{' '}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={styles['auth-link']}>Privacy Policy</a>.
                  </>
                )
                : (
                  <>
                    By continuing, you agree to our{' '}
                    <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className={styles['auth-link']}>Terms of Service</a>{' '}and{' '}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={styles['auth-link']}>Privacy Policy</a>.
                  </>
                )}
            </div>
          </div>
        </div>
      </div>
      <footer className={styles['auth-footer-global']}>
        © {new Date().getFullYear()} SubMan. All rights reserved.
      </footer>
    </>
  );
}
