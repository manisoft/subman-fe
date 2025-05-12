import * as React from 'react';
import { AdminNav } from '../components/AdminNav';
import { Button, Text, FluentProvider, webLightTheme, webDarkTheme, tokens } from '@fluentui/react-components';
import { apiRequest } from '../api';
import styles from './AdminDashboardPage.module.css';

export default function AdminNotificationsPage({ token, onLogout }: { token: string; onLogout: () => void }) {
    // Theme state from localStorage or system
    const getInitialMode = () => {
        const stored = localStorage.getItem('colorMode');
        if (stored === 'light' || stored === 'dark') return stored;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    const [colorMode, setColorMode] = React.useState<'light' | 'dark'>(getInitialMode);
    React.useEffect(() => {
        const listener = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('colorMode')) {
                setColorMode(e.matches ? 'dark' : 'light');
            }
        };
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener('change', listener);
        return () => mq.removeEventListener('change', listener);
    }, []);
    React.useEffect(() => {
        const stored = localStorage.getItem('colorMode');
        if (stored === 'light' || stored === 'dark') setColorMode(stored);
    }, []);

    const [pushTitle, setPushTitle] = React.useState('');
    const [pushBody, setPushBody] = React.useState('');
    const [pushUrl, setPushUrl] = React.useState('');
    const [pushIcon, setPushIcon] = React.useState('');
    const [pushSending, setPushSending] = React.useState(false);
    const [pushResult, setPushResult] = React.useState<string | null>(null);

    const handleSendPush = async (e: React.FormEvent) => {
        e.preventDefault();
        setPushSending(true);
        setPushResult(null);
        try {
            const result = await apiRequest<{ status: string; sent: number; error?: string }>(
                '/admin/push-broadcast',
                'POST',
                {
                    title: pushTitle,
                    body: pushBody,
                    url: pushUrl || undefined,
                    icon: pushIcon || undefined
                },
                token
            );
            setPushResult(result.status === 'ok' ? `Notification sent to ${result.sent} devices.` : result.error || 'Unknown error');
        } catch (err: any) {
            setPushResult(err.message || 'Failed to send notification');
        } finally {
            setPushSending(false);
        }
    };

    return (
        <FluentProvider theme={colorMode === 'dark' ? webDarkTheme : webLightTheme} style={{ minHeight: '100dvh', background: tokens.colorNeutralBackground1 }}>
            <div className={styles.adminDashboardRoot}>
                <AdminNav selected="/admin/notifications" onLogout={onLogout} />
                <main className={styles.adminDashboardMain}>
                    <h1>Admin Notifications</h1>
                    <section className={styles.pushBroadcastSection}>
                        <h2 className={styles.pushBroadcastH2}>Send Push Notification to All Users</h2>
                        <form onSubmit={handleSendPush} className={styles.pushBroadcastForm}>
                            <label className={styles.pushBroadcastLabel}>
                                Title
                                <input type="text" value={pushTitle} onChange={e => setPushTitle(e.target.value)} required className={styles.pushBroadcastInput} />
                            </label>
                            <label className={styles.pushBroadcastLabel}>
                                Message
                                <textarea value={pushBody} onChange={e => setPushBody(e.target.value)} required rows={3} className={styles.pushBroadcastTextarea} />
                            </label>
                            <label className={styles.pushBroadcastLabelOptional}>
                                (Optional) URL to open on click
                                <input type="url" value={pushUrl} onChange={e => setPushUrl(e.target.value)} className={styles.pushBroadcastInput} />
                            </label>
                            <label className={styles.pushBroadcastLabelOptional}>
                                (Optional) Icon URL
                                <input type="url" value={pushIcon} onChange={e => setPushIcon(e.target.value)} className={styles.pushBroadcastInput} />
                            </label>
                            <Button appearance="primary" type="submit" disabled={pushSending || !pushTitle || !pushBody}>{pushSending ? 'Sending...' : 'Send Notification'}</Button>
                            {pushResult && <Text>{pushResult}</Text>}
                        </form>
                    </section>
                </main>
            </div>
        </FluentProvider>
    );
}
