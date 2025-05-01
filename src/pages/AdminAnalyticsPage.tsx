import * as React from 'react';
import { AdminNav } from '../components/AdminNav';
import { Card, CardHeader, Text, FluentProvider, webLightTheme, webDarkTheme, tokens, Spinner } from '@fluentui/react-components';
import { apiRequest } from '../api';

export default function AdminAnalyticsPage({ token, user, onLogout }: { token: string; user: any; onLogout: () => void }) {
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

    const [totalUsers, setTotalUsers] = React.useState<number | null>(null);
    const [recentUsers, setRecentUsers] = React.useState<number | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        setLoading(true);
        setError('');
        Promise.all([
            apiRequest<{ total: number }>('/admin/analytics/total-users', 'GET', undefined, token),
            apiRequest<{ total: number }>('/admin/analytics/last-7-days-users', 'GET', undefined, token)
        ]).then(([total, recent]) => {
            setTotalUsers(total.total);
            setRecentUsers(recent.total);
        }).catch(e => setError(e.message || 'Failed to fetch analytics'))
            .finally(() => setLoading(false));
    }, [token]);

    return (
        <FluentProvider theme={colorMode === 'dark' ? webDarkTheme : webLightTheme} style={{ minHeight: '100dvh', background: tokens.colorNeutralBackground1 }}>
            <div style={{ display: 'flex', minHeight: '100dvh', background: tokens.colorNeutralBackground1 }}>
                <AdminNav selected="/admin/analytics" onLogout={onLogout} />
                <main style={{ flex: 1, padding: '5vw 4vw', maxWidth: 700, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 24 }}>Analytics</h1>
                    {loading ? <Spinner size="large" /> : error ? <Text style={{ color: tokens.colorPaletteRedForeground1 }}>{error}</Text> : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
                            <Card style={{ flex: 1, minWidth: 260, background: tokens.colorNeutralBackground2 }}>
                                <CardHeader
                                    header={<Text weight="semibold" size={400}>Total Users</Text>}
                                />
                                <Text size={700} weight="bold" style={{ fontSize: 40, margin: '16px 0' }}>{totalUsers}</Text>
                                <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>All registered users</Text>
                            </Card>
                            <Card style={{ flex: 1, minWidth: 260, background: tokens.colorNeutralBackground2 }}>
                                <CardHeader
                                    header={<Text weight="semibold" size={400}>New Users (Last 7 Days)</Text>}
                                />
                                <Text size={700} weight="bold" style={{ fontSize: 40, margin: '16px 0' }}>{recentUsers}</Text>
                                <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>Registered in the last 7 days</Text>
                            </Card>
                        </div>
                    )}
                </main>
            </div>
        </FluentProvider>
    );
}