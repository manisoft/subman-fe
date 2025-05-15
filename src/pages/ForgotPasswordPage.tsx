import React, { useState, useEffect } from 'react';
import { Button, Input, Label, Text, Spinner } from '@fluentui/react-components';
import styles from './AuthPage.module.css';
import { apiRequest } from '../api';


export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await apiRequest('/auth/request-password-reset', 'POST', { email });
            setSent(true);
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
                    <img src="/logo.png" alt="SubMan Logo" className={styles['auth-logo']} />
                    <div className={styles['auth-title']}>Forgot Password</div>
                    <div className={`${styles['auth-subtitle']} ${styles.authSubtitle}`}>
                        Enter your email address and we'll send you a link to reset your password.
                    </div>
                    <form className={styles['auth-form']} onSubmit={handleSubmit}>
                        {sent ? (
                            <Text style={{ color: 'var(--color-success, #16a34a)', textAlign: 'center', background: 'transparent' }}>
                                If this email is registered, you will receive a password reset link.
                            </Text>
                        ) : (
                            <>
                                <Label htmlFor="email" style={{ color: 'var(--auth-text-color)' }}>Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(_e, d) => setEmail(d.value)}
                                    required
                                    size="large"
                                    style={{ marginBottom: 16, background: 'var(--fluent-colorNeutralBackground1)', color: 'var(--fluent-colorNeutralForeground1)' }}
                                />
                                {error && <Text style={{ color: 'var(--color-error, #dc2626)', textAlign: 'center', background: 'transparent' }}>{error}</Text>}
                                <Button appearance="primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 12 }} size="large">
                                    {loading ? <Spinner size="tiny" /> : 'Send Reset Link'}
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
