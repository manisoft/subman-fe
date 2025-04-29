import React, { useState, useEffect } from 'react';
import { parseISO, isAfter, isBefore, addDays, format, isValid, compareAsc, startOfDay, parse, isEqual } from 'date-fns';
import { motion } from 'framer-motion';
import { tokens } from '@fluentui/react-components';
import { 
  Button, 
  Card, 
  CardHeader, 
  Text, 
  Spinner, 
  Title3, 
  makeStyles 
} from '@fluentui/react-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './DashboardPage.module.css';
import { Dismiss24Regular, CalendarLtr24Regular, Wallet24Regular, Cart24Regular, MoneyHand24Regular, ErrorCircleRegular } from '@fluentui/react-icons';
import { getSubscriptions, apiRequest } from '../api';
import { subscribeUserToPush, unsubscribeUserFromPush } from '../pushNotifications';
import { useNavigate } from 'react-router-dom';
import { addMonths, addYears, addWeeks } from 'date-fns';

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

// Helper function to determine text color based on background luminance
const getTextColorForBackground = (bgColor: string): string => {
  // Use tokens for default colors
  const defaultBg = tokens.colorNeutralBackground3; // Example default token
  const effectiveBgColor = bgColor || defaultBg;

  try {
    // Basic luminance check for hex colors (assumes #RRGGBB format)
    const color = effectiveBgColor.startsWith('#') ? effectiveBgColor.substring(1) : '808080'; // Default to gray if not hex
    const rgb = parseInt(color, 16);   
    const r = (rgb >> 16) & 0xff;  
    const g = (rgb >> 8) & 0xff;  
    const b = (rgb >> 0) & 0xff;   
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; 

    // Use static white for dark backgrounds, primary foreground (theme-aware) for light backgrounds
    return luma < 128 ? tokens.colorNeutralForeground1Static : tokens.colorNeutralForeground1; 
  } catch (e) {
    // Fallback if color parsing fails (e.g., not a valid hex)
    return tokens.colorNeutralForeground1; // Default to standard text color
  }
};

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);

  const [confirmDelete, setConfirmDelete] = useState<string|null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getSubscriptions(token)
      .then(setSubs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAdd = () => navigate('/subscription');
  const handleEdit = (id: string) => navigate(`/subscription/${id}`);
  const handleDelete = async (id: string) => {
    setConfirmDelete(null);
    setSuccess('');
    setError('');
    try {
      await apiRequest(`/subscriptions/${id}`, 'DELETE', undefined, token);
      setSubs(subs => subs.filter((s: Subscription) => s.id !== id));
      setSuccess('Subscription deleted successfully.');
    } catch (e: any) {
      setError(e.message || 'Delete failed');
    }
  };

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Text size={800} weight="bold" as="h1">Welcome back, {user?.name || user?.email || 'User'}!</Text>
              <div><Text size={400} style={{ color: 'var(--fluent-colorNeutralForeground3, #888)' }}>Here's an overview of your subscription spending</Text></div>
            </div>
            <Button appearance="primary" onClick={handleAdd} style={{ minWidth: 180, fontWeight: 600 }}>
  {subs.length === 0 ? 'Add your first subscription' : 'Add Subscription'}
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
                <div key={idx} className={styles.skeleton} style={{ height: 120, borderRadius: 16 }} />
              ))
            : ([
                {
                  icon: <Wallet24Regular className={styles.cardIcon} />, label: 'Monthly Spending',
                  value: `$${subs.reduce((sum: number, s: Subscription) => {
                    const price = Number(s.price);
                    switch ((s.billing_cycle || '').toLowerCase().replace(/[-\s]/g, '')) {
                      case 'monthly': return sum + price;
                      case 'yearly': return sum + price / 12;
                      case 'weekly': return sum + price * 52 / 12;
                      case 'biweekly': return sum + price * 26 / 12;
                      case 'quarterly': return sum + price * 4 / 12;
                      default: return sum;
                    }
                  }, 0).toFixed(2)}`,
                  sub: `${subs.length} active subscriptions`
                },
                {
                  icon: <MoneyHand24Regular className={styles.cardIcon} />, label: 'Yearly Spending',
                  value: `$${subs.reduce((sum: number, s: Subscription) => sum + (s.billing_cycle === 'yearly' ? Number(s.price) : Number(s.price)*12), 0).toFixed(2)}`,
                  sub: 'Projected annual cost'
                },
                {
                  icon: <CalendarLtr24Regular className={styles.cardIcon} />, label: 'Next Payment',
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
                    if (!subs.length) return 'No payments due soon';
                    const nextSub = subs.reduce((next: Subscription | null, s: Subscription) => {
                      if (!s.next_billing_date) return next;
                      if (!next || !next.next_billing_date || new Date(s.next_billing_date) < new Date(next.next_billing_date)) return s;
                      return next;
                    }, null);
                    return nextSub ? `${subs.filter(s => s.next_billing_date === nextSub.next_billing_date).length} upcoming` : 'No payments due soon';
                  })()
                },
                {
                  icon: <Cart24Regular className={styles.cardIcon} />, label: 'Average Per Service',
                  value: `$${subs.length > 0 ? (subs.reduce((sum: number, s: Subscription) => sum + Number(s.price), 0) / subs.length).toFixed(2) : '0.00'}`,
                  sub: 'Monthly average per subscription'
                }
              ] as Array<{icon: React.ReactNode; label: string; value: React.ReactNode; sub: React.ReactNode}>).map((card, idx) => (
                <motion.div key={card.label}
                  whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.05)' }}
                  whileFocus={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.05)' }}
                  transition={{ type: 'spring', stiffness: 240, damping: 22, mass: 0.9 }}
                  style={{ borderRadius: '0.5rem', overflow: 'visible' }}
                >
                  <Card className={`${styles.fluentCard} shadow-sm fluent-card fluent-reveal-effect`}>
                    <div className={styles.cardHeader} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{ margin: 0, fontWeight: 500, fontSize: '0.95rem', letterSpacing: 0, lineHeight: 1.3, color: 'var(--fluent-colorNeutralForeground1)' }}>{card.label}</h3>
                      <span style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fluent-colorNeutralForeground3, #888)' }}>
                        {React.cloneElement(card.icon as React.ReactElement, { style: { fontSize: 20, color: 'inherit', background: 'none', padding: 0, margin: 0 } })}
                      </span>
                    </div>
                    <div className={styles.cardContent}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--fluent-colorNeutralForeground1)' }}>{card.value}</div>
                      <p style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0', color: 'var(--fluent-colorNeutralForeground3, #888)' }}>{card.sub}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS }}>
                  <Text size={600} weight="semibold">Upcoming Payments</Text>
                  <Text size={300} style={{ color: 'var(--fluent-colorNeutralForeground3, #888)' }}>Your subscription payments due in the next 30 days</Text>
                </div>
                <div style={{ padding: tokens.spacingVerticalXL, textAlign: 'center' }}>
                  {loading ? (
  <div className={styles.skeleton} style={{ height: 96, borderRadius: 12, margin: '0 auto' }} />
) : (
  subs.length === 0 ? (
    <>
      <div><CalendarLtr24Regular style={{ width: 48, height: 48, color: 'var(--fluent-colorNeutralForeground3, #888)', marginBottom: 16 }} /></div>
      <div><Text weight="semibold" size={400} style={{ marginBottom: 16 }}>No subscriptions yet</Text></div>
      <div><Text size={300} style={{ color: 'var(--fluent-colorNeutralForeground3, #888)', marginBottom: 16 }}>You have not added any subscriptions to your account.</Text></div>
      <div><Button appearance="primary" style={{ marginTop: 20 }} onClick={handleAdd}>Add your first subscription</Button></div>
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
          <div><Text weight="semibold" size={400}>No upcoming payments</Text></div>
          <div><Text size={300} style={{ color: 'var(--fluent-colorNeutralForeground3, #888)', margin: '8px 0' }}>You don't have any payments due in the next 30 days</Text></div>
        </>
      );
    }
    return upcoming.map(s => (
      <div key={s.id} style={{ marginBottom: tokens.spacingVerticalXS }}>
        <Text weight="semibold">{s.name}</Text>
        <Text size={300} style={{ marginLeft: tokens.spacingHorizontalS }}>{formatFriendlyDate(s._computedNextBillingDate.toISOString().slice(0, 10))}</Text>
      </div>
    ));
  })()
)}
                </div>
                {subs.length > 0 && (
  <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 0 0' }}>
    <Button appearance="secondary" onClick={() => navigate('/subscriptions')}>
      View all subscriptions
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS }}>
                  <Text size={600} weight="semibold">Spending by Category</Text>
                  <Text size={300} style={{ color: 'var(--fluent-colorNeutralForeground3, #888)' }}>How your subscriptions are distributed</Text>
                </div>
                 <div style={{ padding: tokens.spacingVerticalXL, textAlign: 'center' }}>
                  {loading ? (
                    <div className={styles.skeleton} style={{ height: 96, borderRadius: 12 }} />
                  ) : (
                    (() => {
                      // Get unique categories, ignoring 'Uncategorized' if all are uncategorized
                      const categories = Array.from(new Set(subs.map(s => s.category).filter(Boolean)));
                      if (subs.length === 0 || categories.length === 0) {
                        // Empty state for no categories
                        return (
                          <>
                            <div><ErrorCircleRegular style={{ width: 48, height: 48, color: 'var(--fluent-colorNeutralForeground3, #888)', marginBottom: 16 }} /></div>
                            <div><Text weight="semibold" size={400} style={{ marginBottom: 16 }}>No categories found</Text></div>
                            <div><Text size={300} style={{ color: 'var(--fluent-colorNeutralForeground3, #888)', marginBottom: 16 }}>Add categories to your subscriptions to see spending distribution</Text></div>
                            <div><Button appearance="secondary" style={{ marginTop: 20 }} onClick={() => navigate('/subscriptions')}>Manage subscription</Button></div>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
                          {categories.map((cat, idx) => {
                            const color = colorPalette[idx % colorPalette.length];
                            const total = subs.filter(s => s.category === cat).reduce((sum, s) => sum + Number(s.price), 0);
                            const count = subs.filter(s => s.category === cat).length;
                            return (
                              <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <span className={styles.categoryDot} style={{ backgroundColor: color }} />
                                  <Text weight="medium">{cat}</Text>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <Text weight="bold">${total.toFixed(2)}</Text>
                                  <div>
                                    <Text size={100} style={{ color: 'var(--fluent-colorNeutralForeground3, #888)' }}>{count} subscription{count !== 1 ? 's' : ''}</Text>
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
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: tokens.colorNeutralShadowAmbient, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: tokens.colorNeutralBackground1, padding: tokens.spacingHorizontalXXL, borderRadius: tokens.borderRadiusXLarge, boxShadow: tokens.shadow16, minWidth: 320 }}>
            <Text size={500} weight="semibold">Delete this subscription?</Text>
            <div style={{ margin: `${tokens.spacingVerticalXL} 0` }}>
              <Text>Are you sure you want to delete this subscription? This action cannot be undone.</Text>
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              <Button appearance="subtle" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button appearance="primary" onClick={() => handleDelete(confirmDelete!)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
      {/* Footer now shows version from backend (MySQL) */}
      <Footer />
    </div>
  );
}
