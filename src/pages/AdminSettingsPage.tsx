import * as React from 'react';
import { AdminNav } from '../components/AdminNav';
import { Spinner, Text, Input, Button, Dropdown, Option, Label, FluentProvider, webLightTheme, webDarkTheme, tokens, ToggleButton } from '@fluentui/react-components';
import { apiRequest } from '../api';

export default function AdminSettingsPage({ token, user, onLogout }: { token: string; user: any; onLogout: () => void }) {
    const [version, setVersion] = React.useState('');
    const [theme, setTheme] = React.useState('light');
    const [releaseDate, setReleaseDate] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    // Theme state from localStorage or system
    const getInitialMode = () => {
        const stored = localStorage.getItem('colorMode');
        if (stored === 'light' || stored === 'dark') return stored;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    const [colorMode, setColorMode] = React.useState<'light' | 'dark'>(getInitialMode);

    // Sync theme with localStorage and system
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

    // Theme toggle handler
    const handleThemeToggle = () => {
        const newMode = colorMode === 'dark' ? 'light' : 'dark';
        setColorMode(newMode);
        localStorage.setItem('colorMode', newMode);
    };

    React.useEffect(() => {
        setLoading(true);
        setError('');
        apiRequest<{ version: string; release_date: string }>(`/admin/version-history`, 'GET', undefined, token)
            .then(data => {
                setVersion(data.version || '');
                setReleaseDate(data.release_date ? data.release_date.slice(0, 10) : '');
            })
            .catch(e => setError(e.message || 'Failed to fetch version history'))
            .finally(() => setLoading(false));
    }, [token]);

    const handleSave = () => {
        setSaving(true);
        setError('');
        setSuccess('');
        apiRequest(`/admin/version-history`, 'PUT', { version, release_date: releaseDate }, token)
            .then(() => {
                setSuccess('Version history updated successfully.');
            })
            .catch(e => setError(e.message || 'Failed to update version history'))
            .finally(() => setSaving(false));
    };

    return (
        <FluentProvider theme={colorMode === 'dark' ? webDarkTheme : webLightTheme} style={{ minHeight: '100vh', background: tokens.colorNeutralBackground1 }}>
            <div style={{ display: 'flex', minHeight: '100vh', background: tokens.colorNeutralBackground1 }}>
                <AdminNav selected="/admin/settings" onLogout={onLogout} />
                <main style={{ flex: 1, padding: '5vw 4vw', maxWidth: 500, width: '100%', boxSizing: 'border-box' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 24 }}>Admin Settings</h1>
                    {/* Theme Section */}
                    <section style={{ marginBottom: 32, padding: 24, borderRadius: 8, background: tokens.colorNeutralBackground2 }}>
                        <Label htmlFor="theme-toggle" style={{ marginBottom: 12, display: 'block' }}>App Theme</Label>
                        <ToggleButton
                            id="theme-toggle"
                            checked={colorMode === 'dark'}
                            onClick={handleThemeToggle}
                            appearance="primary"
                        >
                            {colorMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </ToggleButton>
                        <Text style={{ marginLeft: 16, color: tokens.colorNeutralForeground2 }}>
                        </Text>
                    </section>
                    {/* Version/Release Section */}
                    {loading ? <Spinner size="large" /> : (
                        <form onSubmit={e => { e.preventDefault(); handleSave(); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Label htmlFor="app-version">App Version</Label>
                            <Input id="app-version" value={version} onChange={e => setVersion((e.target as HTMLInputElement).value)} required style={{ marginBottom: 8 }} />
                            <Label htmlFor="app-release-date">Release Date</Label>
                            <Input id="app-release-date" type="date" value={releaseDate} onChange={e => setReleaseDate((e.target as HTMLInputElement).value)} required style={{ marginBottom: 8 }} />
                            {error && <Text style={{ color: tokens.colorPaletteRedForeground1 }}>{error}</Text>}
                            {success && <Text style={{ color: tokens.colorPaletteGreenForeground1 }}>{success}</Text>}
                            <div style={{ marginTop: 8 }}>
                                <Button appearance="primary" type="submit" disabled={saving} style={{ width: '100%' }}>{saving ? <Spinner size="tiny" /> : 'Save Settings'}</Button>
                            </div>
                        </form>
                    )}
                </main>
            </div>
        </FluentProvider >
    );
}