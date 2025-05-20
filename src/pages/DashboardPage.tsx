import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@fluentui/react-components';
import {
  Button,
  Card,
  Text
} from '@fluentui/react-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './DashboardPage.module.css';
import { CalendarLtr24Regular, Wallet24Regular, Cart24Regular, MoneyHand24Regular, ErrorCircleRegular } from '@fluentui/react-icons';
import { getSubscriptions, apiRequest } from '../api';
import { useNavigate } from 'react-router-dom';
import { parse, isValid, isBefore, addMonths, addYears, addWeeks, startOfDay, format, isEqual, compareAsc, addDays, isAfter } from 'date-fns';
import { LanguageContext } from '../App';
import { convertPrice, formatPrice } from '../utils/currency';
import PaymentCalendar from '../components/PaymentCalendar';

// Define Subscription interface
interface Subscription {
  id: string;
  name: string;
  price: string | number; // Price might be stored as string or number
  billing_cycle: string;
  next_billing_date?: string | null;
  category?: string | null;
  logo?: string | null;
  color?: string | null;
  notes?: string | null;
}

// Helper: Parse 'YYYY-MM-DD' as local date (not UTC)
const parseLocalDate = (dateString: string) => {
  if (!dateString) return new Date(''); // Invalid date
  // If dateString contains 'T', extract only the date part
  const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;
  return parse(datePart, 'yyyy-MM-dd', new Date());
};

// Helper: Advance next_billing_date to today or future based on billing_cycle
function getCurrentNextBillingDate(rawDate: string | null | undefined, billingCycle: string, today: Date = new Date()): Date | null {
  if (!rawDate) return null;
  let date = parseLocalDate(rawDate);
  if (!isValid(date)) return null;
  while (isBefore(date, startOfDay(today))) {
    switch ((billingCycle || '').toLowerCase().replace(/[-\s]/g, '')) {
      case 'monthly':
        date = addMonths(date, 1);
        break;
      case 'yearly':
        date = addYears(date, 1);
        break;
      case 'weekly':
        date = addWeeks(date, 1);
        break;
      case 'biweekly':
        date = addWeeks(date, 2);
        break;
      case 'quarterly':
        date = addMonths(date, 3);
        break;
      default:
        // If unknown, do not advance
        return date;
    }
  }
  return date;
}


// Helper function to format date strings user-friendly and correctly
const formatFriendlyDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = parseLocalDate(dateString);
    if (!isValid(date)) return 'Invalid Date';
    return format(date, 'MMM d, yyyy'); // e.g., May 23, 2025
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Invalid Date';
  }
};

interface DashboardPageProps {
  token: string;
  user: any;
}

export default function DashboardPage({ token, user }: DashboardPageProps) {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());

  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);

  const userCurrency = localStorage.getItem('currency') || 'USD';
  const rates = JSON.parse(localStorage.getItem('currencyRates') || '{}');

  const displayPrice = (price: number, originalCurrency: string) => {
    const converted = convertPrice(Number(price), originalCurrency, userCurrency, rates);
    return formatPrice(converted, userCurrency);
  };

  useEffect(() => {
    setLoading(true);
    getSubscriptions(token)
      .then(setSubs)
      .catch(e => console.error(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAdd = () => navigate('/subscription');
  const handleDelete = async (id: string) => {
    setConfirmDelete(null);
    try {
      await apiRequest(`/subscriptions/${id}`, 'DELETE', undefined, token);
      setSubs(subs => subs.filter((s: Subscription) => s.id !== id));
    } catch (e: any) {
      console.error(e.message || 'Delete failed');
    }
  };

  const calendarSubs = subs.map(s => ({
    id: s.id,
    name: s.name,
    logoUrl: s.logo || '',
    nextPaymentDate: getCurrentNextBillingDate(s.next_billing_date, s.billing_cycle)?.toISOString().slice(0, 10) || '',
    amount: Number(s.price) || 0,
    billing_cycle: s.billing_cycle // <-- add this property
  }));
  const totalMonthly = subs.reduce((sum: number, s: Subscription) => {
    const price = convertPrice(Number(s.price), (s as any).currency || 'USD', userCurrency, rates);
    switch ((s.billing_cycle || '').toLowerCase().replace(/[-\s]/g, '')) {
      case 'monthly': return sum + price;
      case 'yearly': return sum + price / 12;
      case 'weekly': return sum + price * 52 / 12;
      case 'biweekly': return sum + price * 26 / 12;
      case 'quarterly': return sum + price * 4 / 12;
      default: return sum;
    }
  }, 0);

  return (
    <div className={styles.pageRoot}>
      <Header user={user} />
      <motion.main
        className={styles.dashboardContainer}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.6, ease: [0.1, 0.9, 0.2, 1] }}
      >
        {/* Welcome Section */}
        <motion.div
          style={{ marginBottom: tokens.spacingVerticalXXL }}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ delay: 0.05, duration: 0.6, ease: [0.1, 0.9, 0.2, 1] }}
        >
          <div className={`${styles.flex} ${styles.alignCenter} ${styles.justifyBetween} ${styles.flexWrap} ${styles.gap16}`}>
            <div>
              <Text size={800} weight="bold" as="h1">
                {(t('dashboard_welcome') || 'Welcome back, {name}!').replace('{name}', user?.name || user?.email || 'User')}
              </Text>
              <div><Text size={400} style={{ color: 'var(--fluent-colorNeutralForeground3, #888)' }}>{t('dashboard_overview') || "Here's an overview of your subscription spending"}</Text></div>
            </div>
            <Button appearance="primary" onClick={handleAdd} style={{ minWidth: 180, fontWeight: 600 }}>
              {subs.length === 0 ? t('dashboard_add_first') || 'Add your first subscription' : t('dashboard_add') || 'Add Subscription'}
            </Button>
          </div>
        </motion.div>

        {/* Overview Cards with Skeletons */}
        <motion.div
          className={styles.sectionGrid}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.1, 0.9, 0.2, 1] }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className={`${styles.skeleton} ${styles.skeletonWide}`} />
            ))
            : ([
              {
                icon: <Wallet24Regular className={styles.cardIcon} />, label: t('dashboard_monthly_spending') || 'Monthly Spending',
                value: displayPrice(subs.reduce((sum: number, s: Subscription) => {
                  const price = convertPrice(Number(s.price), (s as any).currency || 'USD', userCurrency, rates);
                  switch ((s.billing_cycle || '').toLowerCase().replace(/[-\s]/g, '')) {
                    case 'monthly': return sum + price;
                    case 'yearly': return sum + price / 12;
                    case 'weekly': return sum + price * 52 / 12;
                    case 'biweekly': return sum + price * 26 / 12;
                    case 'quarterly': return sum + price * 4 / 12;
                    default: return sum;
                  }
                }, 0), userCurrency),
                sub: `${subs.length} ${t('dashboard_active_subs') || 'active subscriptions'}`
              },
              {
                icon: <MoneyHand24Regular className={styles.cardIcon} />, label: t('dashboard_yearly_spending') || 'Yearly Spending',
                value: displayPrice(subs.reduce((sum: number, s: Subscription) => {
                  const price = convertPrice(Number(s.price), (s as any).currency || 'USD', userCurrency, rates);
                  return sum + (s.billing_cycle === 'yearly' ? price : price * 12);
                }, 0), userCurrency),
                sub: t('dashboard_projected_annual') || 'Projected annual cost'
              },
              {
                icon: <CalendarLtr24Regular className={styles.cardIcon} />, label: t('dashboard_next_payment') || 'Next Payment',
                value: (() => {
                  if (!subs.length) return 'No upcoming';
                  const today = startOfDay(new Date());
                  // Filter to only those today or after
                  const upcoming = subs.filter(s => {
                    if (!s.next_billing_date) return false;
                    const d = getCurrentNextBillingDate(s.next_billing_date, s.billing_cycle, today);
                    return d !== null && isValid(d) && !isBefore(d, today);
                  });
                  if (!upcoming.length) return 'No upcoming';
                  // Find the soonest
                  const nextSub = upcoming.reduce((next: Subscription | null, s: Subscription) => {
                    if (!next || !next.next_billing_date) return s;
                    if (!s.next_billing_date || !next.next_billing_date) return next;
                    const d = getCurrentNextBillingDate(s.next_billing_date, s.billing_cycle, today);
                    const dn = getCurrentNextBillingDate(next.next_billing_date, next.billing_cycle, today);
                    if (d === null || dn === null) return next;
                    return isBefore(d, dn) ? s : next;
                  }, null);
                  return nextSub && nextSub.next_billing_date
                    ? formatFriendlyDate(getCurrentNextBillingDate(nextSub.next_billing_date, nextSub.billing_cycle, today)?.toISOString().slice(0, 10) || null)
                    : 'No upcoming';
                })(),
                sub: (() => {
                  if (!subs.length) return t('dashboard_no_payments_due') || 'No payments due soon';
                  const nextSub = subs.reduce((next: Subscription | null, s: Subscription) => {
                    if (!s.next_billing_date) return next;
                    if (!next || !next.next_billing_date || new Date(s.next_billing_date) < new Date(next.next_billing_date)) return s;
                    return next;
                  }, null);
                  return nextSub ? `${subs.filter(s => s.next_billing_date === nextSub.next_billing_date).length} ${t('dashboard_upcoming') || 'upcoming'}` : t('dashboard_no_payments_due') || 'No payments due soon';
                })()
              },
              {
                icon: <Cart24Regular className={styles.cardIcon} />, label: t('dashboard_avg_per_service') || 'Average Per Service',
                value: displayPrice(subs.length > 0 ? (
                  subs.reduce((sum: number, s: Subscription) => sum + convertPrice(Number(s.price), (s as any).currency || 'USD', userCurrency, rates), 0) / subs.length
                ) : 0, userCurrency),
                sub: t('dashboard_monthly_avg') || 'Monthly average per subscription'
              }
            ] as Array<{ icon: React.ReactNode; label: string; value: React.ReactNode; sub: React.ReactNode }>).map((card, idx) => (
              <motion.div key={card.label}
                whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.05)' }}
                whileFocus={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.05)' }}
                transition={{ type: 'spring', stiffness: 240, damping: 22, mass: 0.9 }}
                style={{ borderRadius: '0.5rem', overflow: 'visible' }}
              >
                <Card className={`${styles.fluentCard} shadow-sm fluent-card fluent-reveal-effect`}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardLabel}>{card.label}</h3>
                    <span className={styles.cardIcon}>
                      {React.cloneElement(card.icon as React.ReactElement, { style: { fontSize: 20, color: 'inherit', background: 'none', padding: 0, margin: 0 } })}
                    </span>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardValue}>{card.value}</div>
                    <p className={styles.cardSub}>{card.sub}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
        </motion.div>

        {/* Payment Calendar Section */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.1, 0.9, 0.2, 1] }}
          className={styles.paymentCalendarSection}
        >
          <PaymentCalendar
            subscriptions={calendarSubs}
            month={calendarMonth}
            year={calendarYear}
            totalMonthly={Math.round(totalMonthly)}
            onChangeMonth={(newMonth, newYear) => {
              setCalendarMonth(newMonth);
              setCalendarYear(newYear);
            }}
          />
        </motion.div>

        {/* 2-column grid: Upcoming Payments and Spending by Category */}
        <motion.div
          className={styles.cardGrid}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.1, 0.9, 0.2, 1] }}
        >
          {/* Upcoming Payments */}
          <div>
            <motion.div
              whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.05)' }}
              whileFocus={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.05)' }}
              transition={{ type: 'spring', stiffness: 240, damping: 22, mass: 0.9 }}
              style={{ borderRadius: '0.5rem' }}
            >
              <Card className={`${styles.fluentCard} shadow-sm fluent-card fluent-reveal-effect`}>
                <div className={`${styles.flex} ${styles.flexCol} ${styles.gapXS}`}>
                  <Text size={600} weight="semibold">{t('dashboard_upcoming_payments') || 'Upcoming Payments'}</Text>
                  <Text size={300} style={{ color: 'var(--fluent-colorNeutralForeground3, #888)' }}>{t('dashboard_payments_due_30') || 'Your subscription payments due in the next 30 days'}</Text>
                </div>
                <div className={`${styles.pvXL} ${styles.textCenter}`}>
                  {loading ? (
                    <div className={`${styles.skeleton} ${styles.skeletonTall} ${styles.marginAuto}`} />
                  ) : (
                    subs.length === 0 ? (
                      <>
                        <div><CalendarLtr24Regular style={{ width: 48, height: 48, color: 'var(--fluent-colorNeutralForeground3, #888)', marginBottom: 16 }} /></div>
                        <div><Text weight="semibold" size={400} style={{ marginBottom: 16 }}>{t('dashboard_no_subs') || 'No subscriptions yet'}</Text></div>
                        <div><Text size={300} style={{ color: 'var(--fluent-colorNeutralForeground3, #888)', marginBottom: 16 }}>{t('dashboard_no_subs_desc') || 'You have not added any subscriptions to your account.'}</Text></div>
                        <div><Button appearance="primary" style={{ marginTop: 20 }} onClick={handleAdd}>{t('dashboard_add_first') || 'Add your first subscription'}</Button></div>
                      </>
                    ) : (() => {
                      // Use date-fns for robust, timezone-safe filtering and sorting
                      const today = startOfDay(new Date());
                      const in30Days = addDays(today, 30);
                      const isSameOrAfter = (dateA: Date, dateB: Date) => isAfter(dateA, dateB) || isEqual(dateA, dateB);
                      const isSameOrBefore = (dateA: Date, dateB: Date) => isBefore(dateA, dateB) || isEqual(dateA, dateB);
                      const upcoming = subs
                        .map(s => {
                          if (!s.next_billing_date) return null;
                          const d = getCurrentNextBillingDate(s.next_billing_date, s.billing_cycle, today);
                          if (d && isValid(d) && isSameOrAfter(d, today) && isSameOrBefore(d, in30Days)) {
                            return { ...s, _computedNextBillingDate: d };
                          }
                          return null;
                        })
                        .filter((s): s is Subscription & { _computedNextBillingDate: Date } => s !== null)
                        .sort((a, b) => compareAsc(a._computedNextBillingDate, b._computedNextBillingDate));
                      if (upcoming.length === 0) {
                        return (
                          <>
                            <div><CalendarLtr24Regular style={{ width: 48, height: 48, color: 'var(--fluent-colorNeutralForeground3, #888)', marginBottom: 16 }} /></div>
                            <div><Text weight="semibold" size={400}>{t('dashboard_no_upcoming') || 'No upcoming payments'}</Text></div>
                            <div><Text size={300} style={{ color: 'var(--fluent-colorNeutralForeground3, #888)', margin: '8px 0' }}>{t('dashboard_no_upcoming_desc') || "You don't have any payments due in the next 30 days"}</Text></div>
                          </>
                        );
                      }
                      return upcoming.map(s => (
                        <div key={s.id} className={styles.marginBottomXS}>
                          <Text weight="semibold">{s.name}</Text>
                          <Text size={300} style={{ marginLeft: tokens.spacingHorizontalS }}>{formatFriendlyDate(s._computedNextBillingDate.toISOString().slice(0, 10))}</Text>
                        </div>
                      ));
                    })()
                  )}
                </div>
                {subs.length > 0 && (
                  <div className={`${styles.flex} ${styles.justifyCenter} ${styles.marginTop16}`}>
                    <Button appearance="secondary" onClick={() => navigate('/subscriptions')}>
                      {t('dashboard_view_all') || 'View all subscriptions'}
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Spending by Category */}
          <div>
            <motion.div
              whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.05)' }}
              whileFocus={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.05)' }}
              transition={{ type: 'spring', stiffness: 240, damping: 22, mass: 0.9 }}
              style={{ borderRadius: '0.5rem' }}
            >
              <Card className={`${styles.fluentCard} shadow-sm fluent-card fluent-reveal-effect`}>
                <div className={`${styles.flex} ${styles.flexCol} ${styles.gapXS}`}>
                  <Text size={600} weight="semibold">{t('dashboard_spending_by_cat') || 'Spending by Category'}</Text>
                  <Text size={300} style={{ color: 'var(--fluent-colorNeutralForeground3, #888)' }}>{t('dashboard_spending_dist') || 'How your subscriptions are distributed'}</Text>
                </div>
                <div className={`${styles.pvXL} ${styles.textCenter}`}>
                  {loading ? (
                    <div className={`${styles.skeleton} ${styles.skeletonTall}`} />
                  ) : (
                    (() => {
                      // Get unique categories, ignoring 'Uncategorized' if all are uncategorized
                      const categories = Array.from(new Set(subs.map(s => s.category).filter(Boolean)));
                      if (subs.length === 0 || categories.length === 0) {
                        // Empty state for no categories
                        return (
                          <>
                            <div><ErrorCircleRegular style={{ width: 48, height: 48, color: 'var(--fluent-colorNeutralForeground3, #888)', marginBottom: 16 }} /></div>
                            <div><Text weight="semibold" size={400} style={{ marginBottom: 16 }}>{t('dashboard_no_cat') || 'No categories found'}</Text></div>
                            <div><Text size={300} style={{ color: 'var(--fluent-colorNeutralForeground3, #888)', marginBottom: 16 }}>{t('dashboard_no_cat_desc') || 'Add categories to your subscriptions to see spending distribution'}</Text></div>
                            <div><Button appearance="secondary" style={{ marginTop: 20 }} onClick={() => navigate('/subscriptions')}>{t('dashboard_manage_subs') || 'Manage subscription'}</Button></div>
                          </>
                        );
                      }
                      // Show category breakdown
                      const colorPalette = [
                        'rgb(217, 38, 38)',
                        'rgb(38, 217, 217)',
                        'rgb(38, 217, 38)',
                        'rgb(217, 217, 38)',
                        'rgb(128, 38, 217)',
                        'rgb(217, 128, 38)',
                      ];
                      return (
                        <div className={`${styles.flex} ${styles.flexCol} ${styles.gapS}`}>
                          {categories.map((cat, idx) => {
                            const color = colorPalette[idx % colorPalette.length];
                            const total = subs.filter(s => s.category === cat).reduce((sum, s) => sum + convertPrice(Number(s.price), (s as any).currency || 'USD', userCurrency, rates), 0);
                            const count = subs.filter(s => s.category === cat).length;
                            return (
                              <div key={cat} className={`${styles.flex} ${styles.alignCenter} ${styles.justifyBetween}`}>
                                <div className={`${styles.flex} ${styles.alignCenter}`}>
                                  <span className={styles.categoryDot} style={{ '--category-dot-bg': color } as React.CSSProperties} />
                                  <Text weight="medium">{cat}</Text>
                                </div>
                                <div className={styles.textRight}>
                                  <Text weight="bold">{displayPrice(total, userCurrency)}</Text>
                                  <div>
                                    <Text size={100} style={{ color: 'var(--fluent-colorNeutralForeground3, #888)' }}>{count} {t('dashboard_subs') || 'subscription'}{count !== 1 ? 's' : ''}</Text>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>


      </motion.main>
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className={styles.deleteModalOverlay}>
          <div className={styles.deleteModalBox}>
            <Text size={500} weight="semibold">{t('dashboard_delete_title') || 'Delete this subscription?'}</Text>
            <div className={styles.deleteModalContent}>
              <Text>{t('dashboard_delete_desc') || 'Are you sure you want to delete this subscription? This action cannot be undone.'}</Text>
            </div>
            <div className={styles.deleteModalActions}>
              <Button appearance="subtle" onClick={() => setConfirmDelete(null)}>{t('dashboard_cancel') || 'Cancel'}</Button>
              <Button appearance="primary" onClick={() => handleDelete(confirmDelete!)}>{t('dashboard_delete') || 'Delete'}</Button>
            </div>
          </div>
        </div>
      )}
      {/* Footer now shows version from backend (MySQL) */}
      <Footer />
    </div>
  );
}
