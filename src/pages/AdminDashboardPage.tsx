import * as React from 'react';
import { AdminNav } from '../components/AdminNav';
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, Button, Spinner, Text, FluentProvider, webLightTheme, webDarkTheme, tokens } from '@fluentui/react-components';
import { apiRequest } from '../api';
import styles from './AdminDashboardPage.module.css';

export default function AdminDashboardPage({ token, user, onLogout }: { token: string; user: any; onLogout: () => void }) {
    const [users, setUsers] = React.useState<any[]>([]);
    const [total, setTotal] = React.useState(0);
    const [page, setPage] = React.useState(1);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const PAGE_SIZE = 100;

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

    React.useEffect(() => {
        setLoading(true);
        setError('');
        apiRequest<{ users: any[]; total: number }>(`/admin/users?page=${page}&limit=${PAGE_SIZE}`, 'GET', undefined, token)
            .then(data => {
                setUsers(data.users || []);
                setTotal(data.total || 0);
            })
            .catch(e => setError(e.message || 'Failed to fetch users'))
            .finally(() => setLoading(false));
    }, [page, token]);

    // --- Admin Push Notification Broadcast ---
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
                <AdminNav selected="/admin/dashboard" onLogout={onLogout} />
                <main className={styles.adminDashboardMain}>
                    <h1>Admin Dashboard</h1>
                    {/* Push Notification Broadcast Form */}
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
                    {loading ? <Spinner size="large" /> : error ? <Text style={{ color: 'red' }}>{error}</Text> : (
                        <>
                            <Table aria-label="User table">
                                <TableHeader>
                                    <TableRow>
                                        <TableHeaderCell>ID</TableHeaderCell>
                                        <TableHeaderCell>Name</TableHeaderCell>
                                        <TableHeaderCell>Email</TableHeaderCell>
                                        <TableHeaderCell>Role</TableHeaderCell>
                                        <TableHeaderCell>Created</TableHeaderCell>
                                        <TableHeaderCell>Updated</TableHeaderCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map(u => (
                                        <TableRow key={u.id}>
                                            <TableCell>{u.id}</TableCell>
                                            <TableCell>{u.name}</TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell>{u.role}</TableCell>
                                            <TableCell>{u.created_at}</TableCell>
                                            <TableCell>{u.updated_at}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
                                <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                                <Text>Page {page} of {Math.ceil(total / PAGE_SIZE) || 1}</Text>
                                <Button disabled={page * PAGE_SIZE >= total} onClick={() => setPage(page + 1)}>Next</Button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </FluentProvider>
    );
}