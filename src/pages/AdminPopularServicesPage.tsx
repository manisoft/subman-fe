import * as React from 'react';
import { AdminNav } from '../components/AdminNav';
import { Card, CardHeader, Text, Button, Input, Spinner, Label, Dialog, DialogSurface, DialogBody, DialogTitle, DialogActions, Dropdown, Option, FluentProvider, webLightTheme, webDarkTheme, tokens } from '@fluentui/react-components';
import { apiRequest } from '../api';

export default function AdminPopularServicesPage({ token, user, onLogout }: { token: string; user: any; onLogout: () => void }) {
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

    // Data state
    const [services, setServices] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [editId, setEditId] = React.useState<number | null>(null);
    const [deleteId, setDeleteId] = React.useState<number | null>(null);
    const [form, setForm] = React.useState({ name: '', logo: '', color: '', categories: '' });
    const [saving, setSaving] = React.useState(false);

    const fetchServices = React.useCallback(() => {
        setLoading(true);
        setError('');
        apiRequest<any[]>('/popular-services', 'GET', undefined, token)
            .then(setServices)
            .catch(e => setError(e.message || 'Failed to fetch popular services'))
            .finally(() => setLoading(false));
    }, [token]);

    React.useEffect(() => { fetchServices(); }, [fetchServices]);

    const handleEdit = (service: any) => {
        setEditId(service.id);
        setForm({
            name: service.name || '',
            logo: service.logo || '',
            color: service.color || '#e5e7eb',
            categories: service.categories || '',
        });
        setSuccess('');
        setError('');
    };
    const handleAdd = () => {
        setEditId(0);
        setForm({ name: '', logo: '', color: '#e5e7eb', categories: '' });
        setSuccess('');
        setError('');
    };
    const handleDelete = (id: number) => {
        setDeleteId(id);
    };
    const handleDeleteConfirm = () => {
        if (!deleteId) return;
        setSaving(true);
        apiRequest(`/popular-services/${deleteId}`, 'DELETE', undefined, token)
            .then(() => {
                setSuccess('Service deleted.');
                setDeleteId(null);
                fetchServices();
            })
            .catch(e => setError(e.message || 'Delete failed'))
            .finally(() => setSaving(false));
    };
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (name === 'color') {
            setForm(f => ({ ...f, color: value || '#e5e7eb' }));
        } else if (name === 'categories') {
            setForm(f => ({ ...f, categories: value.toLowerCase() }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        const payload = { ...form };
        if (editId && editId > 0) {
            apiRequest(`/popular-services/${editId}`, 'PUT', payload, token)
                .then(() => {
                    setSuccess('Service updated.');
                    setEditId(null);
                    fetchServices();
                })
                .catch(e => setError(e.message || 'Update failed'))
                .finally(() => setSaving(false));
        } else {
            apiRequest('/popular-services', 'POST', payload, token)
                .then(() => {
                    setSuccess('Service added.');
                    setEditId(null);
                    fetchServices();
                })
                .catch(e => setError(e.message || 'Add failed'))
                .finally(() => setSaving(false));
        }
    };

    // Helper to convert a string to Title Case
    function toTitleCase(str: string): string {
        return str.replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    return (
        <FluentProvider theme={colorMode === 'dark' ? webDarkTheme : webLightTheme} style={{ minHeight: '100dvh', background: tokens.colorNeutralBackground1 }}>
            <div style={{ display: 'flex', minHeight: '100dvh', background: tokens.colorNeutralBackground1 }}>
                <AdminNav selected="/admin/popular-services" onLogout={onLogout} />
                <main style={{ flex: 1, padding: '5vw 4vw', maxWidth: 900, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 24 }}>Popular Services</h1>
                    <Button appearance="primary" onClick={handleAdd} style={{ maxWidth: 200, marginBottom: 24 }}>Add New Service</Button>
                    {loading ? <Spinner size="large" /> : error ? <Text style={{ color: tokens.colorPaletteRedForeground1 }}>{error}</Text> : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                            {services.map(service => (
                                <Card key={service.id} style={{ flex: '1 1 260px', minWidth: 260, maxWidth: 320, background: tokens.colorNeutralBackground2, position: 'relative' }}>
                                    <CardHeader header={<Text weight="semibold" size={400}>{service.name}</Text>} />
                                    <div style={{ margin: '12px 0' }}>
                                        <img src={service.logo} alt={service.name} style={{ width: 48, height: 48, borderRadius: 8, background: '#fff', objectFit: 'contain' }} />
                                    </div>
                                    <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>Color: <span style={{ background: service.color, padding: '2px 12px', borderRadius: 8, marginLeft: 8 }}>{service.color}</span></Text>
                                    <Text size={300} style={{ color: tokens.colorNeutralForeground2, display: 'block', marginTop: 8 }}>
                                        Categories: {service.categories.split(',').map((cat: string) => toTitleCase(cat.trim())).join(', ')}
                                    </Text>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                        <Button appearance="secondary" onClick={() => handleEdit(service)}>Edit</Button>
                                        <Button appearance="subtle" onClick={() => handleDelete(service.id)} style={{ color: tokens.colorPaletteRedForeground1 }}>Delete</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                    {/* Add/Edit Dialog */}
                    <Dialog open={editId !== null} modalType="alert" onOpenChange={(_e, data) => { if (!data.open) setEditId(null); }}>
                        <DialogSurface style={{ minWidth: 360, maxWidth: 480, width: '96vw' }}>
                            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 8 }}>
                                <DialogBody>
                                    <DialogTitle>{editId && editId > 0 ? 'Edit Service' : 'Add Service'}</DialogTitle>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <Label>Name</Label>
                                        <Input name="name" value={form.name} onChange={handleFormChange} required size="large" />
                                        <Label>Logo URL</Label>
                                        <Input name="logo" value={form.logo} onChange={handleFormChange} required size="large" />
                                        <Label>Color</Label>
                                        <input name="color" type="color" value={form.color || '#e5e7eb'} onChange={handleFormChange} style={{ width: 48, height: 36, border: 'none', background: 'none', padding: 0, cursor: 'pointer', marginBottom: 8 }} />
                                        <Label>Categories (comma separated)</Label>
                                        <Input name="categories" value={form.categories} onChange={e => setForm(f => ({ ...f, categories: e.target.value.toLowerCase() }))} size="large" placeholder="entertainment,shopping,..." />
                                    </div>
                                    {error && <Text style={{ color: tokens.colorPaletteRedForeground1 }}>{error}</Text>}
                                    {success && <Text style={{ color: tokens.colorPaletteGreenForeground1 }}>{success}</Text>}
                                </DialogBody>
                                <DialogActions>
                                    <Button appearance="secondary" onClick={() => setEditId(null)} type="button">Cancel</Button>
                                    <Button appearance="primary" type="submit" disabled={saving}>{saving ? <Spinner size="tiny" /> : 'Save'}</Button>
                                </DialogActions>
                            </form>
                        </DialogSurface>
                    </Dialog>
                    {/* Delete Dialog */}
                    <Dialog open={!!deleteId} modalType="alert" onOpenChange={(_e, data) => { if (!data.open) setDeleteId(null); }}>
                        <DialogSurface>
                            <DialogBody>
                                <DialogTitle>Delete Service</DialogTitle>
                                <Text>Are you sure you want to delete this service?</Text>
                                <DialogActions>
                                    <Button appearance="secondary" onClick={() => setDeleteId(null)} type="button">Cancel</Button>
                                    <Button appearance="primary" onClick={handleDeleteConfirm} disabled={saving} type="button">{saving ? <Spinner size="tiny" /> : 'Delete'}</Button>
                                </DialogActions>
                            </DialogBody>
                        </DialogSurface>
                    </Dialog>
                </main>
            </div>
        </FluentProvider>
    );
}
