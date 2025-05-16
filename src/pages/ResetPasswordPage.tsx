import React, { useState, useEffect } from 'react';
import { Button, Input, Label, Text, Spinner } from '@fluentui/react-components';
import styles from './AuthPage.module.css';
import { apiRequest } from '../api';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!token) {
            setError('Invalid or missing token.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await apiRequest('/auth/reset-password', 'POST', { token, password });
            setSuccess(true);
            setTimeout(() => navigate('/auth'), 2000);
        } catch (err: any) {
            setError(err.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Theme detection: prefers-color-scheme, fallback to light, only for unauthenticated users
    useEffect(() => {
        const html = document.documentElement;
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }, []);

    return (
        <>
            <div className={styles['auth-bg']}>
                <div className={styles['auth-card']}>
                    <img src="/android/android-launchericon-192-192.png" alt="SubMan Logo" className={styles['auth-logo']} />
                    <div className={styles['auth-title']}>Reset Password</div>
                    <div className={`${styles['auth-subtitle']} ${styles.authSubtitle}`}>
                        Enter your new password below. Password must be at least 6 characters.
                    </div>
                    <form className={styles['auth-form']} onSubmit={handleSubmit}>
                        {success ? (
                            <Text style={{ color: 'var(--color-success, #16a34a)', textAlign: 'center', background: 'transparent' }}>
                                Password reset successful! Redirecting to login...
                            </Text>
                        ) : (
                            <>
                                <Label htmlFor="password" style={{ color: 'var(--auth-text-color)' }}>New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(_e, d) => setPassword(d.value)}
                                    required
                                    size="large"
                                    style={{ marginBottom: 12, background: 'var(--fluent-colorNeutralBackground1)', color: 'var(--fluent-colorNeutralForeground1)' }}
                                />
                                <Label htmlFor="confirm" style={{ color: 'var(--auth-text-color)' }}>Confirm Password</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={confirm}
                                    onChange={(_e, d) => setConfirm(d.value)}
                                    required
                                    size="large"
                                    style={{ marginBottom: 16, background: 'var(--fluent-colorNeutralBackground1)', color: 'var(--fluent-colorNeutralForeground1)' }}
                                />
                                {error && <Text style={{ color: 'var(--color-error, #dc2626)', textAlign: 'center', background: 'transparent' }}>{error}</Text>}
                                <Button appearance="primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 12 }} size="large">
                                    {loading ? <Spinner size="tiny" /> : 'Reset Password'}
                                </Button>
                            </>
                        )}
                    </form>
                    <div className={styles.authBackToSignIn}>
                        <a href="/auth" className={styles['auth-link']}>
                            Back to Sign In
                        </a>
                    </div>
                </div>
            </div>
            <footer className={styles['auth-footer-global']}>
                © {new Date().getFullYear()} SubMan. All rights reserved.
            </footer>
        </>
    );
}
