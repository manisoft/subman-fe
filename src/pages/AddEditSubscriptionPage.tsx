import React, { useEffect, useState } from 'react';
import styles from './AddEditSubscriptionPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Label, Card, CardHeader, CardFooter, Text, Spinner, Dropdown, Option } from '@fluentui/react-components';
import { ColorRegular, CalendarLtrRegular, SaveRegular, AddFilled } from '@fluentui/react-icons';

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

function AddEditSubscriptionPageContent({ token, user }: AddEditSubscriptionPageProps): React.ReactElement {
  const params = useParams<{ id?: string }>();
  const id = params.id;
  const isEdit = !!id;
  const navigate = useNavigate();
  const [tab, setTab] = useState<'popular' | 'custom'>(isEdit ? 'custom' : 'popular');
  const [popularServices, setPopularServices] = useState<any[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [popularError, setPopularError] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>(['Entertainment', 'Productivity', 'Education', 'Finance', 'Other']);
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#e5e7eb');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Theme detection: match User Dashboard
  useEffect(() => {
    const html = document.documentElement;
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    const listener = (e: MediaQueryListEvent) => {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
    };
  }, []);

  // Fetch subscription data for edit mode
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      setError('');
      apiRequest(`/subscriptions/${id}`, 'GET', undefined, token)
        .then((data) => {
          const sub = data as {
            name?: string;
            price?: string | number;
            billing_cycle?: string;
            category?: string;
            next_billing_date?: string;
            description?: string;
            logo?: string;
            website?: string;
            notes?: string;
            color?: string;
          };
          setName(sub.name || '');
          setPrice(sub.price ? String(sub.price) : '');
          setBillingCycle(sub.billing_cycle || 'monthly');
          setCategory(sub.category || '');
          // Ensure nextBillingDate is in 'YYYY-MM-DD' format for input[type=date]
          let dateValue = '';
          if (sub.next_billing_date) {
            const d = new Date(sub.next_billing_date);
            if (!isNaN(d.getTime())) {
              dateValue = d.toISOString().slice(0, 10);
            }
          }
          setNextBillingDate(dateValue);
          setDescription(sub.description || '');
          setLogo(sub.logo || '');
          setWebsite(sub.website || '');
          setNotes(sub.notes || '');
          setColor(sub.color || '#e5e7eb');
        })
        .catch(e => setError(e.message || 'Failed to load subscription'))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id, token]);

  // Fetch popular services only when switching to 'popular' tab
  useEffect(() => {
    if (tab === 'popular' && popularServices.length === 0 && !loadingPopular) {
      setLoadingPopular(true);
      setPopularError('');
      apiRequest('/popular-services', 'GET', undefined, token)
        .then((data) => setPopularServices(data as any[]))
        .catch(e => setPopularError(e.message))
        .finally(() => setLoadingPopular(false));
    }
  }, [tab, token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name,
        price: price ? parseFloat(price) : 0,
        billing_cycle: billingCycle,
        category,
        next_billing_date: nextBillingDate,
        description,
        logo,
        website,
        notes,
        color,
      };
      if (isEdit) {
        await apiRequest(`/subscriptions/${id}`, 'PUT', payload, token);
      } else {
        await apiRequest('/subscriptions', 'POST', payload, token);
      }
      navigate('/subscriptions');
    } catch (e: any) {
      setError(e.message || 'Failed to save subscription');
    } finally {
      setLoading(false);
    }
  }

  // ... (rest of the code remains the same)

  return (
    <>
      <div className={styles["addedit-card"]}>
        <div className={styles["addedit-card-content"]}>
          <div className={styles["tab-switcher"]}>
            <button
              type="button"
              className={`${styles["tab-btn"]} ${tab === 'popular' ? styles["active"] : ''}`}
              onClick={() => setTab('popular')}
              aria-selected={tab === 'popular'}
              style={{ outline: 'none' }}
            >
              Popular Services
            </button>
            <button
              type="button"
              className={`${styles['tab-btn']} ${tab === 'custom' ? styles['active'] : ''}`}
              onClick={() => setTab('custom')}
              aria-selected={tab === 'custom'}
              style={{ outline: 'none' }}
            >
              Custom Subscription
            </button>
          </div>
          <div style={{ minHeight: 420 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: tab === 'popular' ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: tab === 'popular' ? -40 : 40 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className={`${styles['tab-content']} ${tab === 'popular' ? styles['popular'] : styles['custom']}`}
              >
                {tab === 'popular' ? (
                  <>
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
                  </>
                ) : (
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
                        <Label htmlFor="sub-date">Next Billing Date</Label>
                        <Input
                          id="sub-date"
                          type="date"
                          value={nextBillingDate}
                          onChange={e => setNextBillingDate((e.target as HTMLInputElement).value)}
                          required
                          className={styles["themed-date-input"]}
                        />
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
                      <div className={styles["addedit-form-actions"]}>
                        {error && <Text style={{ color: 'var(--fluent-colorPaletteRedForeground1, red)' }}>{error}</Text>}
                        <Button style={{ marginRight: 16 }} appearance="subtle" type="button" onClick={() => navigate('/subscriptions')}>Cancel</Button>
                        <Button appearance="primary" type="submit" disabled={loading}>
                          {loading ? <Spinner size="tiny" /> : isEdit ? <><SaveRegular style={{marginRight: 6}} />Save</> : <><AddFilled style={{marginRight: 6}} />Add</>}
                        </Button>
                      </div>
                    </form>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
