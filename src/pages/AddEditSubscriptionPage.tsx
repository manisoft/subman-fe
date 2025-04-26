import React, { useEffect, useState } from 'react';
import styles from './AddEditSubscriptionPage.module.css';
import { Button, Input, Label, Card, CardHeader, CardFooter, Text, Spinner, Dropdown, Option } from '@fluentui/react-components';
import { ColorRegular, CalendarLtrRegular } from '@fluentui/react-icons';

import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { apiRequest } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QuickAddSubscriptionModal, { QuickAddSubscriptionModalFields } from '../components/QuickAddSubscriptionModal';


type DropdownOnChangeData = { optionValue?: string }; // Best practice for Fluent UI v9

interface AddEditSubscriptionPageProps {
  token: string;
  user: any;
}

const BILLING_CYCLES = [
  { key: 'weekly', text: 'Weekly' },
  { key: 'biweekly', text: 'Bi-Weekly' },
  { key: 'monthly', text: 'Monthly' },
  { key: 'quarterly', text: 'Quarterly' },
  { key: 'yearly', text: 'Yearly' },
];

export default function AddEditSubscriptionPage({ token, user }: AddEditSubscriptionPageProps) {
  // Render header at the top
  return (
    <div className={styles["addedit-bg"]}>
      <Header user={user} />
      <div className={styles["addedit-container"]}>
        <AddEditSubscriptionPageContent token={token} user={user} />
      </div>
      <div className={styles["addedit-footer-fixed"]}>
        <Footer />
      </div>
    </div>
  );
}

// Separated the content for clarity and to avoid double rendering
function AddEditSubscriptionPageContent({ token, user }: AddEditSubscriptionPageProps): React.ReactElement {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  const [quickAddError, setQuickAddError] = useState('');
  const location = useLocation();
  const [tab, setTab] = useState<'popular' | 'custom'>('popular');
  const [popularServices, setPopularServices] = useState<any[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [popularError, setPopularError] = useState('');

  // Prefill from location.state if present
  const prefill = location.state || {};

  // If user comes from Popular tab with prefill, show quick modal
  useEffect(() => {
    if (tab === 'popular' && prefill && prefill.name && prefill.logo && prefill.color && prefill.category) {
      setQuickAddOpen(true);
    } else {
      setQuickAddOpen(false);
    }
    // eslint-disable-next-line
  }, [tab, prefill]);

  useEffect(() => {
    if (tab === 'popular') {
      setLoadingPopular(true);
      setPopularError('');
      apiRequest('/popular-services', 'GET', undefined, token)
        .then((data) => setPopularServices(data as any[]))
        .catch(e => setPopularError(e.message))
        .finally(() => setLoadingPopular(false));
    }
  }, [tab, token]);

  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const isEdit = !!id;

  const [name, setName] = useState(prefill.name || '');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  // If prefill.category is an array, join it for display
  const initialCategory = Array.isArray(prefill.category)
    ? prefill.category.join(', ')
    : prefill.category || '';
  const [category, setCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<string[]>(['Entertainment', 'Productivity', 'Education', 'Finance', 'Other']);
  const [description, setDescription] = useState('');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [color, setColor] = useState(prefill.color || '#e5e7eb');
  const [logo, setLogo] = useState(prefill.logo || '');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch categories and set default if adding
    apiRequest<string[]>('/categories', 'GET', undefined, token).then(cats => {
      let updatedCats = cats.includes('Other') ? cats : [...cats, 'Other'];
      setCategories(updatedCats);
      // Set default category to 'Other' if adding and not set
      if (!isEdit && (!category || !updatedCats.includes(category))) {
        setCategory('Other');
      }
    });
    // If editing, fetch subscription and set all fields
    if (isEdit) {
      setLoading(true);
    }
  }, [token, isEdit, id]);

  useEffect(() => {
    if (isEdit) {
      apiRequest<any>(`/subscriptions/${id}`, 'GET', undefined, token)
        .then(sub => {
          setName(sub.name);
          setPrice(sub.price);
          setBillingCycle(sub.billing_cycle);
          setCategory(sub.category || 'Other');
          setDescription(sub.description || '');
          // Ensure nextBillingDate is a string in 'YYYY-MM-DD' format for <input type='date'>
          if (sub.next_billing_date) {
            const date = new Date(sub.next_billing_date);
            if (!isNaN(date.valueOf())) {
              // Convert to YYYY-MM-DD
              setNextBillingDate(date.toISOString().substring(0, 10));
            } else {
              setNextBillingDate('');
            }
          } else {
            setNextBillingDate('');
          }
          setColor(sub.color || '#0063B1');
          setLogo(sub.logo || '');
          setWebsite(sub.website || '');
          setNotes(sub.notes || '');
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, token]);

  const handleQuickAddSave = async (fields: QuickAddSubscriptionModalFields) => {
    setQuickAddLoading(true);
    setQuickAddError('');
    try {
      // Map modal fields to backend API fields
      const data = {
        name: fields.name,
        price: fields.price,
        billing_cycle: fields.billingCycle,
        category: fields.category,
        description: fields.description || '',
        next_billing_date: fields.nextBillingDate,
        color: fields.color,
        logo: fields.logo,
        website: fields.website || '',
        notes: fields.notes || '',
      };
      await apiRequest('/subscriptions', 'POST', data, token);
      setQuickAddOpen(false);
      navigate('/dashboard'); // Or to subscriptions list
    } catch (err: any) {
      setQuickAddError(err.message);
    } finally {
      setQuickAddLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setError('Please select a category.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = {
        name, price, billing_cycle: billingCycle, category, description, next_billing_date: nextBillingDate, color, logo, website, notes,
      };
      if (isEdit) {
        await apiRequest(`/subscriptions/${id}`, 'PUT', data, token);
      } else {
        await apiRequest('/subscriptions', 'POST', data, token);
      }
      navigate('/subscriptions');
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Theme detection: match AuthPage
  useEffect(() => {
    const html = document.documentElement;
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  // Show quick modal if prefill from popular
  if (quickAddOpen && tab === 'popular') {
    return (
      <QuickAddSubscriptionModal
          open={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
          onSave={handleQuickAddSave as (fields: import('../components/QuickAddSubscriptionModal').QuickAddSubscriptionModalFields) => void}
          prefill={{
            name: prefill.name || '',
            logo: prefill.logo || '',
            color: prefill.color || '#e5e7eb',
            category: Array.isArray(prefill.category) ? prefill.category[0] || '' : typeof prefill.category === 'string' ? prefill.category : ''
          }}
          loading={quickAddLoading}
          error={quickAddError}
        />
    );
  }

  // Regular form follows if not quick add
  return (
    <>
      <div className={styles["addedit-card"]}>
        <div style={{ width: '100%', marginBottom: 32 }}>
        <div role="tablist" aria-orientation="horizontal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--fluent-colorNeutralBackground3)', borderRadius: 8, padding: 4, marginBottom: 24 }}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'popular'}
            className={tab === 'popular' ? styles.tabActive : styles.tab}
            onClick={() => setTab('popular')}
            style={{ fontWeight: 600, fontSize: 18, borderRadius: 6, padding: '8px 0', background: tab === 'popular' ? 'var(--fluent-colorNeutralBackground1)' : 'transparent', color: tab === 'popular' ? 'var(--fluent-colorNeutralForeground1)' : 'var(--fluent-colorNeutralForeground3)', boxShadow: tab === 'popular' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none', transition: 'all 0.18s' }}
          >
            Popular Services
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'custom'}
            className={tab === 'custom' ? styles.tabActive : styles.tab}
            onClick={() => setTab('custom')}
            style={{ fontWeight: 600, fontSize: 18, borderRadius: 6, padding: '8px 0', background: tab === 'custom' ? 'var(--fluent-colorNeutralBackground1)' : 'transparent', color: tab === 'custom' ? 'var(--fluent-colorNeutralForeground1)' : 'var(--fluent-colorNeutralForeground3)', boxShadow: tab === 'custom' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none', transition: 'all 0.18s' }}
          >
            Custom Subscription
          </button>
        </div>
      </div>
      {tab === 'popular' ? (
          <div style={{ marginTop: 24 }}>
            {loadingPopular ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, minHeight: 160 }}>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className={styles.skeleton} style={{ height: 140, borderRadius: 16 }} />
                ))}
              </div>
            ) : popularError ? (
              <Text style={{ color: 'var(--fluent-colorPaletteRedForeground1, red)' }}>{popularError}</Text>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                {popularServices.map((service, idx) => (
                  <React.Fragment key={service.id}>
                    {/* Use the new PopularServiceCard component */}
                    {/* @ts-ignore - PopularServiceCard is default export */}
                    {React.createElement(require('./PopularServiceCard').default, { service, index: idx })}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {tab === 'custom' && (
        <>
          <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 24, color: 'var(--fluent-colorNeutralForeground1)' }}>
            {isEdit ? 'Edit Subscription' : 'Add Subscription'}
          </div>
          <form className={styles["addedit-form"]} onSubmit={handleSubmit}>
            <div className={styles["addedit-form-col"]}>
              <Label htmlFor="sub-name">Name</Label>
              <Input id="sub-name" value={name} onChange={e => setName((e.target as HTMLInputElement).value)} required />
              <Label htmlFor="sub-price">Price ($)</Label>
              <Input id="sub-price" type="number" value={price} onChange={e => setPrice((e.target as HTMLInputElement).value)} required />
              <Label htmlFor="sub-billing">Billing Cycle</Label>
              <Dropdown
                id="sub-billing"
                value={billingCycle}
                placeholder="Select billing cycle"
                onOptionSelect={(_event: unknown, data: DropdownOnChangeData) => {
                  if (data.optionValue) {
                    setBillingCycle(data.optionValue);
                  }
                }}
              >
                {BILLING_CYCLES.map(c => (
                  <Option key={c.key} value={c.key}>{c.text}</Option>
                ))}
              </Dropdown>
              <Label htmlFor="sub-category">Category</Label>
              <Dropdown
                id="sub-category"
                value={category}
                onOptionSelect={(_event: unknown, data: DropdownOnChangeData) => {
                  const newValue = data.optionValue || 'Other';
                  setCategory(newValue);
                }}
              >
                {categories.map((cat: string) => (
                  <Option key={cat} value={cat}>{cat}</Option>
                ))}
              </Dropdown>
              <Label htmlFor="sub-date">Next Billing Date</Label>
              <Input
                id="sub-date"
                type="date"
                value={nextBillingDate}
                onChange={e => setNextBillingDate((e.target as HTMLInputElement).value)}
                required
                className={styles["themed-date-input"]}
              />
            </div>
            <div className={styles["addedit-form-col"]}>
              <Label htmlFor="sub-description">Description</Label>
              <Input id="sub-description" value={description} onChange={e => setDescription((e.target as HTMLInputElement).value)} />
              <Label htmlFor="sub-logo">Logo URL</Label>
              <Input id="sub-logo" value={logo} onChange={e => setLogo((e.target as HTMLInputElement).value)} />
              <Label htmlFor="sub-website">Website</Label>
              <Input id="sub-website" value={website} onChange={e => setWebsite((e.target as HTMLInputElement).value)} />
              <Label htmlFor="sub-notes">Notes</Label>
              <Input id="sub-notes" value={notes} onChange={e => setNotes((e.target as HTMLInputElement).value)} />
              <Label htmlFor="sub-color" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Color</span>
                <ColorRegular style={{ marginLeft: 4, fontSize: 20 }} />
              </Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="color"
                  id="sub-color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  style={{ width: 48, height: 32, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                />
              </div>
            </div>
          </form>
          <div className={styles["addedit-form-actions"]}>
            {error && <Text style={{ color: 'var(--fluent-colorPaletteRedForeground1, red)' }}>{error}</Text>}
            <Button appearance="subtle" type="button" onClick={() => navigate('/subscriptions')}>Cancel</Button>
            <Button appearance="primary" type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner size="tiny" /> : isEdit ? 'Save' : 'Add'}
            </Button>
          </div>
        </>
      )}
    </div>
    </>
  );
}
