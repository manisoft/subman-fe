import React, { useEffect, useState, useContext } from 'react';
import styles from './AddEditSubscriptionPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Label, Text, Spinner, Dropdown, Option, Combobox } from '@fluentui/react-components';
import { ColorRegular, SaveRegular, AddFilled, Search24Regular } from '@fluentui/react-icons';

import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { apiRequest } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LanguageContext } from '../App';
import currencies from '../currencies.json';

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

const CATEGORIES = [
  { key: 'entertainment', text: 'Entertainment' },
  { key: 'shopping', text: 'Shopping' },
  { key: 'education', text: 'Education' },
  { key: 'finance', text: 'Finance' },
  { key: 'music', text: 'Music' },
  { key: 'utilities', text: 'Utilities' },
  { key: 'streaming', text: 'Streaming' },
  { key: 'software', text: 'Software' },
  { key: 'insurance', text: 'Insurance' },
  { key: 'other', text: 'Other' }
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
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const id = params.id;
  const isEdit = !!id;
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);
  // Prefill from location.state (PopularServiceCard)
  const state = location.state as {
    name?: string;
    logo?: string;
    color?: string;
    category?: string;
  } | undefined;
  const [tab, setTab] = useState<'popular' | 'custom'>(
    isEdit ? 'custom' : (state?.name || state?.logo || state?.color || state?.category ? 'custom' : 'popular')
  );
  const [popularServices, setPopularServices] = useState<any[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [popularError, setPopularError] = useState('');
  const [name, setName] = useState(state?.name || '');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [category, setCategory] = useState(state?.category || 'Other');
  const [categories, setCategories] = useState<{ key: string; text: string }[]>(CATEGORIES);
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState(state?.logo || '');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState(state?.color || '#e5e7eb');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [popularPage, setPopularPage] = useState(1);
  const POPULAR_PAGE_SIZE = 20;
  const [popularSearch, setPopularSearch] = useState('');
  // Currency state: default to user's selected currency or USD
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'USD');

  // Auto-switch to 'custom' tab if prefill data is present and not editing
  useEffect(() => {
    if (!isEdit && (state?.name || state?.logo || state?.color || state?.category)) {
      setTab('custom');
    }
    // eslint-disable-next-line
  }, [state, isEdit]);

  // Prefill form fields when state changes (e.g., from Popular Service card)
  useEffect(() => {
    if (state) {
      if (state.name) setName(state.name);
      if (state.logo) setLogo(state.logo);
      if (state.color) setColor(state.color);
      if (state.category) setCategory(state.category);
    }
  }, [state]);

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
            currency?: string;
          };
          setName(sub.name || '');
          setPrice(sub.price ? String(sub.price) : '');
          setBillingCycle(sub.billing_cycle || 'Monthly');
          setCategory(sub.category || 'Other');
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
          setCurrency(sub.currency || localStorage.getItem('currency') || 'USD');
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

  // Filter and paginate popular services
  const filteredPopularServices = popularServices.filter(service => {
    const search = popularSearch.toLowerCase();
    return (
      service.name?.toLowerCase().includes(search) ||
      (service.categories || '').toLowerCase().includes(search)
    );
  });
  const totalPopularPages = Math.ceil(filteredPopularServices.length / POPULAR_PAGE_SIZE) || 1;
  const pagedPopularServices = filteredPopularServices.slice((popularPage - 1) * POPULAR_PAGE_SIZE, popularPage * POPULAR_PAGE_SIZE);

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
        currency,
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
              {t('addedit_popular_services') || 'Popular Services'}
            </button>
            <button
              type="button"
              className={`${styles['tab-btn']} ${tab === 'custom' ? styles['active'] : ''}`}
              onClick={() => setTab('custom')}
              aria-selected={tab === 'custom'}
              style={{ outline: 'none' }}
            >
              {t('addedit_custom_subscription') || 'Custom Subscription'}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <Input
                        value={popularSearch}
                        onChange={e => { setPopularSearch((e.target as HTMLInputElement).value); setPopularPage(1); }}
                        placeholder={t('addedit_search_placeholder') || 'Search popular subscriptions...'}
                        contentBefore={<Search24Regular />}
                        style={{ width: '100%', margin: '0 16px' }}
                      />
                    </div>
                    {loadingPopular ? (
                      <div className={styles.addeditCardPopular}>
                        {Array.from({ length: 4 }).map((_, idx) => (
                          <div key={idx} className={styles.skeleton} style={{ height: 140, borderRadius: 16 }} />
                        ))}
                      </div>
                    ) : popularError ? (
                      <Text style={{ color: 'var(--fluent-colorPaletteRedForeground1, red)' }}>{popularError}</Text>
                    ) : (
                      <>
                        <div className={styles.addeditCardPopular}>
                          {pagedPopularServices.map((service, idx) => (
                            <React.Fragment key={service.id}>
                              {/* Use the new PopularServiceCard component */}
                              {/* @ts-ignore - PopularServiceCard is default export */}
                              {React.createElement(require('./PopularServiceCard').default, { service, index: idx })}
                            </React.Fragment>
                          ))}
                        </div>
                        {/* Pagination */}
                        {totalPopularPages > 1 && (
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              justifyContent: 'center',
                              alignItems: 'center',
                              margin: '32px 0 20px 0',
                              paddingBottom: 20,
                              gap: 4,
                              width: '100%',
                              maxWidth: '100vw',
                              boxSizing: 'border-box',
                            }}
                          >
                            <Button
                              appearance="subtle"
                              disabled={popularPage === 1}
                              onClick={() => setPopularPage(popularPage - 1)}
                              style={{ marginRight: 4, minWidth: 36, flex: '0 0 auto' }}
                            >
                              {t('addedit_previous') || 'Previous'}
                            </Button>
                            {[...Array(totalPopularPages)].map((_, idx) => (
                              <Button
                                key={idx}
                                appearance={popularPage === idx + 1 ? 'primary' : 'subtle'}
                                onClick={() => setPopularPage(idx + 1)}
                                style={{
                                  margin: '0 2px',
                                  minWidth: 36,
                                  flex: '0 0 auto',
                                  padding: '0 8px',
                                }}
                              >
                                {idx + 1}
                              </Button>
                            ))}
                            <Button
                              appearance="subtle"
                              disabled={popularPage === totalPopularPages}
                              onClick={() => setPopularPage(popularPage + 1)}
                              style={{ marginLeft: 4, minWidth: 36, flex: '0 0 auto' }}
                            >
                              {t('addedit_next') || 'Next'}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 24, color: 'var(--fluent-colorNeutralForeground1)' }}>
                      {isEdit ? t('addedit_edit_title') || 'Edit Subscription' : t('addedit_add_title') || 'Add Subscription'}
                    </div>
                    <form className={styles["addedit-form"]} onSubmit={handleSubmit}>
                      <div className={styles["addedit-form-col"]}>
                        <Label htmlFor="sub-name">{t('addedit_name') || 'Name'}</Label>
                        <Input id="sub-name" className={styles.labelStyles} value={name} onChange={e => setName((e.target as HTMLInputElement).value)} required />
                        <Label htmlFor="sub-price">{t('addedit_price') || 'Price ($)'}</Label>
                        <Input id="sub-price" type="number" className={styles.labelStyles} value={price} onChange={e => setPrice((e.target as HTMLInputElement).value)} required />
                        <Label htmlFor="sub-billing">{t('addedit_billing_cycle') || 'Billing Cycle'}</Label>
                        <Dropdown
                          id="sub-billing"
                          value={billingCycle}
                          placeholder={t('addedit_billing_cycle') || 'Select billing cycle'}
                          onOptionSelect={(_event: unknown, data: DropdownOnChangeData) => {
                            if (data.optionValue) {
                              setBillingCycle(data.optionValue);
                            }
                          }}
                        >
                          <Option value={t('addedit_billing_weekly') || 'Weekly'}>{t('addedit_billing_weekly') || 'Weekly'}</Option>
                          <Option value={t('addedit_billing_biweekly') || 'Bi-Weekly'}>{t('addedit_billing_biweekly') || 'Bi-Weekly'}</Option>
                          <Option value={t('addedit_billing_monthly') || 'Monthly'}>{t('addedit_billing_monthly') || 'Monthly'}</Option>
                          <Option value={t('addedit_billing_quarterly') || 'Quarterly'}>{t('addedit_billing_quarterly') || 'Quarterly'}</Option>
                          <Option value={t('addedit_billing_yearly') || 'Yearly'}>{t('addedit_billing_yearly') || 'Yearly'}</Option>
                        </Dropdown>
                        <Label htmlFor="sub-date" className={styles.catStyle}>{t('addedit_next_billing_date') || 'Next Billing Date'}</Label>
                        <Input
                          id="sub-date"
                          type="date"
                          value={nextBillingDate}
                          onChange={e => setNextBillingDate((e.target as HTMLInputElement).value)}
                          required
                          className={styles["themed-date-input"]}
                        />
                        <Label htmlFor="sub-category" className={styles.catStyle}>{t('addedit_category') || 'Category'}</Label>
                        <Dropdown
                          id="sub-category"
                          value={category}
                          placeholder={t('addedit_category') || 'Select category'}
                          onOptionSelect={(_event: unknown, data: DropdownOnChangeData) => {
                            if (data.optionValue) {
                              setCategory(data.optionValue);
                            }
                          }}
                        >
                          <Option value={t('addedit_category_entertainment') || 'Entertainment'}>{t('addedit_category_entertainment') || 'Entertainment'}</Option>
                          <Option value={t('addedit_category_shopping') || 'Shopping'}>{t('addedit_category_shopping') || 'Shopping'}</Option>
                          <Option value={t('addedit_category_education') || 'Education'}>{t('addedit_category_education') || 'Education'}</Option>
                          <Option value={t('addedit_category_finance') || 'Finance'}>{t('addedit_category_finance') || 'Finance'}</Option>
                          <Option value={t('addedit_category_music') || 'Music'}>{t('addedit_category_music') || 'Music'}</Option>
                          <Option value={t('addedit_category_utilities') || 'Utilities'}>{t('addedit_category_utilities') || 'Utilities'}</Option>
                          <Option value={t('addedit_category_streaming') || 'Streaming'}>{t('addedit_category_streaming') || 'Streaming'}</Option>
                          <Option value={t('addedit_category_software') || 'Software'}>{t('addedit_category_software') || 'Software'}</Option>
                          <Option value={t('addedit_category_insurance') || 'Insurance'}>{t('addedit_category_insurance') || 'Insurance'}</Option>
                          <Option value={t('addedit_category_other') || 'Other'}>{t('addedit_category_other') || 'Other'}</Option>
                        </Dropdown>
                      </div>
                      <div className={styles["addedit-form-col"]}>
                        <Label htmlFor="sub-description">{t('addedit_description') || 'Description'}</Label>
                        <Input id="sub-description" className={styles.labelStyles} value={description} onChange={e => setDescription((e.target as HTMLInputElement).value)} />
                        <Label htmlFor="sub-logo">{t('addedit_logo_url') || 'Logo URL'}</Label>
                        <Input id="sub-logo" className={styles.labelStyles} value={logo} onChange={e => setLogo((e.target as HTMLInputElement).value)} />
                        <Label htmlFor="sub-website">{t('addedit_website') || 'Website'}</Label>
                        <Input id="sub-website" className={styles.labelStyles} value={website} onChange={e => setWebsite((e.target as HTMLInputElement).value)} />
                        <Label htmlFor="sub-notes">{t('addedit_notes') || 'Notes'}</Label>
                        <Input id="sub-notes" className={styles.labelStyles} value={notes} onChange={e => setNotes((e.target as HTMLInputElement).value)} />

                        {/* Currency and Color Row */}
                        <div className={styles.currencyColorRow}>
                          <div className={styles.currencyCol}>
                            <Label htmlFor="sub-currency">{t('currency') || 'Currency'}</Label>
                            <Combobox
                              id="sub-currency"
                              value={currency}
                              onOptionSelect={(_e, d) => setCurrency(d.optionValue as string)}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrency(e.target.value.toUpperCase())}
                              className={styles.ComboboxStyles}
                              listbox={{ style: { maxHeight: '50vh', overflowY: 'auto' } }}
                              freeform
                            >
                              {Object.entries(currencies).map(([code, name]) => (
                                <Option key={code} value={code} text={`${code} - ${name}`}>{code} - {name}</Option>
                              ))}
                            </Combobox>
                          </div>
                          <div className={styles.colorCol}>
                            <Label htmlFor="sub-color" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{t('addedit_color') || 'Color'}</span>
                              <ColorRegular style={{ marginLeft: 4, fontSize: 20 }} />
                            </Label>
                            <div className={styles.colorSelector}>
                              <input
                                type="color"
                                id="sub-color"
                                value={color}
                                onChange={e => setColor(e.target.value)}
                                style={{ width: 48, height: 32, border: 'none', background: 'none', padding: 0, cursor: 'pointer', marginTop: 2 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["addedit-form-actions"]}>
                        {error && <Text style={{ color: 'var(--fluent-colorPaletteRedForeground1, red)' }}>{t('addedit_error_save') || error}</Text>}
                        <Button className={styles["cancel-btn"]} appearance="subtle" type="button" onClick={() => navigate('/subscriptions')}>{t('addedit_cancel') || 'Cancel'}</Button>
                        <Button appearance="primary" type="submit" disabled={loading}>
                          {loading ? <Spinner size="tiny" /> : isEdit ? <><SaveRegular style={{ marginRight: 6 }} />{t('addedit_save') || 'Save'}</> : <><AddFilled style={{ marginRight: 6 }} />{t('addedit_add') || 'Add'}</>}
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
