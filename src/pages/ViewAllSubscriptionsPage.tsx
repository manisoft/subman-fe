import React, { useEffect, useState, useContext } from 'react';
import { Card, Text, Button, Input, Spinner, tokens } from '@fluentui/react-components';
import { ColorLineRegular, DeleteRegular, DeleteDismissRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './ViewAllSubscriptionsPage.module.css';
import { getSubscriptions, apiRequest } from '../api';
import { updateSubscriptionsInServiceWorker } from '../utils/swSubscriptions';
import { Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogActions } from '@fluentui/react-components';
import { motion } from 'framer-motion';
import { LanguageContext } from '../App';
import { convertPrice, formatPrice } from '../utils/currency';

// Helper function to format date strings
const formatFriendlyDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  // Option 2: Always use the date part (YYYY-MM-DD) and display as local date, avoiding timezone shift.
  try {
    // If dateString contains 'T', extract only the date part
    const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    const [yyyy, mm, dd] = datePart.split('-');
    if (!yyyy || !mm || !dd) return 'Invalid Date';
    // Format as e.g. Apr 27, 2025
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Invalid Date';
  }
};

// Helper to convert a string to Title Case
function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

interface Subscription {
  id: string;
  name: string;
  price: string | number;
  billing_cycle: string;
  next_billing_date?: string | null;
  category?: string | null;
  logo?: string | null;
  color?: string | null;
  notes?: string | null;
  created_at?: string | null;
  currency?: string | null; // <-- Add currency property
}

const PAGE_SIZE = 15;

export default function ViewAllSubscriptionsPage({ token, user }: { token: string; user: any }) {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);
  const rates = JSON.parse(localStorage.getItem('currencyRates') || '{}');
  const userCurrency = localStorage.getItem('currency') || 'USD';

  const displayPrice = (price: string | number, originalCurrency: string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    const converted = convertPrice(numPrice, originalCurrency, userCurrency, rates);
    return formatPrice(converted, userCurrency);
  };

  useEffect(() => {
    setLoading(true);
    getSubscriptions(token)
      .then(fetchedSubs => {
        setSubs(fetchedSubs);
        updateSubscriptionsInServiceWorker(fetchedSubs);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setDeleteLoading(true);
    try {
      await apiRequest(`/subscriptions/${confirmDeleteId}`, 'DELETE', undefined, token);
      setSubs(subs => {
        const updated = subs.filter(sub => sub.id !== confirmDeleteId);
        updateSubscriptionsInServiceWorker(updated);
        return updated;
      });
      setConfirmDeleteId(null);
    } catch (e: any) {
      setError(e.message || 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteId(null);
  };

  const filteredSubs = subs.filter(sub =>
    sub.name.toLowerCase().includes(search.toLowerCase()) ||
    (sub.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const pagedSubs = filteredSubs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredSubs.length / PAGE_SIZE);

  const handleAdd = () => navigate('/subscription');
  const handleEdit = (id: string) => navigate(`/subscription/${id}`);

  // Map backend billing_cycle keys to translated labels for display
  function getBillingCycleLabel(key: string, t: (k: string) => string) {
    switch (key.toLowerCase()) {
      case 'weekly': return t('addedit_billing_weekly') || 'Weekly';
      case 'biweekly': return t('addedit_billing_biweekly') || 'Bi-Weekly';
      case 'monthly': return t('addedit_billing_monthly') || 'Monthly';
      case 'quarterly': return t('addedit_billing_quarterly') || 'Quarterly';
      case 'yearly': return t('addedit_billing_yearly') || 'Yearly';
      default: return key;
    }
  }

  return (
    <div className={styles.pageRoot}>
      <Header user={user} />
      <main className={styles.dashboardContainer}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: tokens.spacingVerticalXL }}>
          <Text size={800} weight="bold">{t('viewall_title') || 'Subscriptions'}</Text>
          <Button appearance="primary" onClick={handleAdd} style={{ minWidth: 180, fontWeight: 600 }}>{t('viewall_add') || 'Add Subscription'}</Button>
        </div>
        <div style={{ marginBottom: tokens.spacingVerticalM }}>
          <Input
            value={search}
            onChange={e => setSearch((e.target as HTMLInputElement).value)}
            placeholder={t('viewall_search_placeholder') || 'Search subscriptions...'}
            style={{ width: '100%' }}
          />
        </div>
        {loading ? (
          <Spinner size="large" />
        ) : (
          <div className={styles.subsgrid}>
            {pagedSubs.map(sub => (
              <motion.div key={sub.id}
                whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.05)' }}
                whileFocus={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.05)' }}
                transition={{ type: 'spring', stiffness: 240, damping: 22, mass: 0.9 }}
                style={{ borderRadius: '0.5rem' }}
              >
                <Card
                  key={sub.id}
                  className={`${styles.fluentCard} shadow-sm fluent-card fluent-reveal-effect`}
                  style={{ minHeight: 260, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  tabIndex={0}
                >
                  <div style={{ padding: 24, paddingBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {sub.logo ? (
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              overflow: 'hidden',
                              background: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            className="logo-avatar-bg"
                          >
                            <img
                              src={sub.logo}
                              alt={sub.name + ' logo'}
                              style={{ width: '80%', height: '80%', objectFit: 'contain', display: 'block', background: 'transparent' }}
                            />
                          </div>
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: sub.color || '#f00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#fff', fontWeight: 500, fontSize: 16 }}>{sub.name.slice(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <div>
                          <h3 style={{ fontWeight: 600, fontSize: 20, margin: 0 }}>{sub.name}</h3>
                          <p style={{ fontSize: 14, color: 'var(--fluent-colorNeutralForeground3, #888)', margin: 0 }}>{toTitleCase(sub.category || t('addedit_category_other') || 'Uncategorized')}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button appearance="subtle" icon={<ColorLineRegular />} onClick={e => { e.stopPropagation(); handleEdit(sub.id); }} />
                        <Button appearance="subtle" icon={<DeleteRegular style={{ color: 'red' }} />} onClick={e => { e.stopPropagation(); handleDeleteClick(sub.id); }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: 24, paddingTop: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
                      <div>
                        <p style={{ color: 'var(--fluent-colorNeutralForeground3, #888)', margin: 0 }}>{t('viewall_price') || 'Price'}</p>
                        <p style={{ fontWeight: 500, margin: 0 }}>{displayPrice(sub.price, sub.currency || 'USD')}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--fluent-colorNeutralForeground3, #888)', margin: 0 }}>{t('viewall_billing_cycle') || 'Billing Cycle'}</p>
                        <p style={{ fontWeight: 500, margin: 0, textTransform: 'capitalize' }}>{getBillingCycleLabel(sub.billing_cycle, t)}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--fluent-colorNeutralForeground3, #888)', margin: 0 }}>{t('viewall_next_payment') || 'Next Payment'}</p>
                        <p style={{ fontWeight: 500, margin: 0 }}>{sub.next_billing_date ? formatFriendlyDate(sub.next_billing_date) : t('viewall_na') || 'N/A'}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--fluent-colorNeutralForeground3, #888)', margin: 0 }}>{t('viewall_added_on') || 'Added On'}</p>
                        <p style={{ fontWeight: 500, margin: 0 }}>{sub.created_at ? formatFriendlyDate(sub.created_at) : t('viewall_na') || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: tokens.spacingVerticalXL }}>
            <Button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ marginRight: 8 }}>{t('viewall_previous') || 'Previous'}</Button>
            {[...Array(totalPages)].map((_, idx) => (
              <Button
                key={idx}
                appearance={page === idx + 1 ? 'primary' : 'subtle'}
                onClick={() => setPage(idx + 1)}
                style={{ margin: '0 2px' }}
              >
                {idx + 1}
              </Button>
            ))}
            <Button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ marginLeft: 8 }}>{t('viewall_next') || 'Next'}</Button>
          </div>
        )}

      </main>
      {/* Footer now shows version from backend (MySQL) */}
      <Footer />
      {/* Delete Confirmation Modal */}
      <Dialog open={!!confirmDeleteId} modalType="alert" onOpenChange={(_e, data) => { if (!data.open) handleDeleteCancel(); }}>
        <DialogSurface className="delete-dialog-surface">
          <DialogBody>
            <DialogTitle as="h2" action={<DeleteDismissRegular style={{ color: 'red', fontSize: 24 }} />}>
              {t('viewall_delete_title') || 'Delete Subscription'}
            </DialogTitle>
            <div style={{ margin: '20px 0', fontSize: 16 }}>
              {(t('viewall_delete_desc') || 'This will permanently delete the subscription {name}. This action cannot be undone.').split('{name}').map((part, idx, arr) =>
                idx < arr.length - 1
                  ? <React.Fragment key={idx}>{part}<b>{subs.find(s => s.id === confirmDeleteId)?.name || ''}</b></React.Fragment>
                  : part
              )}
            </div>
            <DialogActions>
              <Button appearance="secondary" onClick={handleDeleteCancel}>{t('viewall_cancel') || 'Cancel'}</Button>
              <Button
                appearance="primary"
                icon={<DeleteDismissRegular style={{ color: 'white' }} />}
                onClick={handleDeleteConfirm}
                style={{ background: 'rgba(239, 68, 68, 0.9)', borderColor: 'rgba(239, 68, 68, 0.9)', color: '#fff' }}
                disabled={deleteLoading}
              >
                {deleteLoading ? <Spinner size="tiny" style={{ marginRight: 8, verticalAlign: 'middle' }} /> : null}
                {t('viewall_delete') || 'Delete'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
