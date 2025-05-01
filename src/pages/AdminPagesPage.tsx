import * as React from 'react';
import { AdminNav } from '../components/AdminNav';
import { Spinner, Text, Input, Button, Dropdown, Option, Label, Textarea, FluentProvider, webLightTheme, webDarkTheme, tokens } from '@fluentui/react-components';
import { apiRequest } from '../api';
import { makeStyles, shorthands } from '@fluentui/react-components';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        minHeight: '100dvh',
        background: tokens.colorNeutralBackground1,
    },
    main: {
        flex: 1,
        padding: '5vw 4vw',
        maxWidth: '800px',
        width: '100%',
        boxSizing: 'border-box',
        ...shorthands.overflow('auto'),
        minHeight: 0,
        '@media (max-width: 600px)': {
            padding: '16px 4vw',
            maxWidth: '100%',
        },
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
    },
    dropdown: {
        width: '220px',
        marginLeft: '24px',
        '@media (max-width: 600px)': {
            width: '100%',
        },
    },
    textarea: {
        marginBottom: '24px',
        '@media (max-width: 600px)': {
            minHeight: '180px',
        },
    },
});

export default function AdminPagesPage({ token, user, onLogout }: { token: string; user: any; onLogout: () => void }) {
    const [pages, setPages] = React.useState<any[]>([]);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
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
    React.useEffect(() => {
        const listener = (e: MediaQueryListEvent) => {
            setColorMode(e.matches ? 'dark' : 'light');
        };
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener('change', listener);
        return () => mq.removeEventListener('change', listener);
    }, []);
    React.useEffect(() => {
        const stored = localStorage.getItem('colorMode');
        if (stored === 'light' || stored === 'dark') setColorMode(stored);
    }, []);

    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/auth';
    };

    const fetchPages = React.useCallback(() => {
        setLoading(true);
        setError('');
        apiRequest<any[]>(`/admin/pages`, 'GET', undefined, token)
            .then(data => setPages(data))
            .catch(e => setError(e.message || 'Failed to fetch pages'))
            .finally(() => setLoading(false));
    }, [token]);

    React.useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    React.useEffect(() => {
        if (selectedId) {
            const page = pages.find((p: any) => String(p.id) === String(selectedId));
            setTitle(page?.title || '');
            setContent(page?.content || '');
            setSuccess('');
            setError('');
        }
    }, [selectedId, pages]);

    const handleSave = () => {
        if (!selectedId) return;
        setSaving(true);
        setError('');
        setSuccess('');
        apiRequest(`/admin/pages/${selectedId}`, 'PUT', { title, content }, token)
            .then(data => {
                setSuccess('Page updated successfully.');
                fetchPages();
            })
            .catch(e => setError(e.message || 'Failed to update page'))
            .finally(() => setSaving(false));
    };

    const styles = useStyles();

    return (
        <FluentProvider theme={colorMode === 'dark' ? webDarkTheme : webLightTheme} style={{ minHeight: '100dvh', background: tokens.colorNeutralBackground1 }}>
            <div className={styles.container}>
                <AdminNav selected="/admin/pages" onLogout={onLogout} />
                <main className={styles.main}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 24 }}>Static Pages Editor</h1>
                    {loading ? <Spinner size="large" /> : error ? <Text style={{ color: tokens.colorPaletteRedForeground1 }}>{error}</Text> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            <div style={{ minWidth: 220 }}>
                                <Label>Select a page</Label>
                                <Dropdown
                                    value={selectedId || ''}
                                    onOptionSelect={(_e, d) => setSelectedId(d.optionValue as string)}
                                    className={styles.dropdown}
                                    placeholder="Choose page..."
                                >
                                    {pages.map((p: any) => (
                                        <Option key={p.id} value={String(p.id)}>{p.title || `Page #${p.id}`}</Option>
                                    ))}
                                </Dropdown>
                            </div>
                            {selectedId && (
                                <form className={styles.form} onSubmit={e => { e.preventDefault(); handleSave(); }}>
                                    <Label htmlFor="page-title">Title</Label>
                                    <Input id="page-title" value={title} onChange={e => setTitle((e.target as HTMLInputElement).value)} required style={{ marginBottom: 16 }} />
                                    <Label htmlFor="page-content">Content</Label>
                                    <Textarea id="page-content" value={content} onChange={e => setContent((e.target as HTMLTextAreaElement).value)} rows={12} className={styles.textarea} />
                                    {error && <Text style={{ color: tokens.colorPaletteRedForeground1 }}>{error}</Text>}
                                    {success && <Text style={{ color: tokens.colorPaletteGreenForeground1 }}>{success}</Text>}
                                    <div style={{ marginTop: 16 }}>
                                        <Button appearance="primary" type="submit" disabled={saving} style={{ width: '100%' }}>{saving ? <Spinner size="tiny" /> : 'Save Page'}</Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </FluentProvider>
    );
}