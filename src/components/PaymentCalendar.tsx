import React, { useMemo, useContext } from 'react';
import styles from './PaymentCalendar.module.css';
import { FluentProvider, Button, Popover, PopoverTrigger, PopoverSurface } from '@fluentui/react-components';
import { ChevronLeft24Regular, ChevronRight24Regular } from '@fluentui/react-icons';
import { addMonths, addYears, addWeeks, isBefore, isEqual, isValid } from 'date-fns';
import { LanguageContext } from '../App';

// Props: subscriptions: [{id, name, logoUrl, nextPaymentDate, amount}]
// month: number (0-11), year: number
export default function PaymentCalendar({ subscriptions, month, year, onChangeMonth }: {
    subscriptions: Array<{ id: string; name: string; logoUrl: string; nextPaymentDate: string; amount: number; billing_cycle: string }>;
    month: number;
    year: number;
    totalMonthly: number;
    onChangeMonth?: (newMonth: number, newYear: number) => void;
}) {
    const { t } = useContext(LanguageContext);

    // Build a map: day -> array of subscriptions
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const calendar = useMemo(() => {
        const map: { [day: number]: typeof subscriptions } = {};
        subscriptions.forEach(sub => {
            if (!sub.nextPaymentDate || !sub.billing_cycle) return;
            // Parse as local date only (ignore time zone offset)
            const [startYear, startMonth, startDay] = sub.nextPaymentDate.split('-').map(Number);
            if (!startYear || !startMonth || !startDay) return;
            let date = new Date(startYear, startMonth - 1, startDay);
            if (!isValid(date)) return;
            // Find the first payment in or before this month
            let firstInMonth = new Date(year, month, 1);
            let lastInMonth = new Date(year, month, daysInMonth);
            // For each billing cycle, generate all payment dates in this month
            let cycle = (sub.billing_cycle || '').toLowerCase();
            let current = new Date(date);
            // Advance current to the first payment in or after firstInMonth
            while (isBefore(current, firstInMonth)) {
                switch (cycle) {
                    case 'monthly': current = addMonths(current, 1); break;
                    case 'yearly': current = addYears(current, 1); break;
                    case 'weekly': current = addWeeks(current, 1); break;
                    case 'biweekly': current = addWeeks(current, 2); break;
                    case 'quarterly': current = addMonths(current, 3); break;
                    default: return; // Unknown cycle, only show nextPaymentDate
                }
            }
            // Now, add all payments in this month
            while ((isBefore(current, lastInMonth) || isEqual(current, lastInMonth)) && current.getMonth() === month && current.getFullYear() === year) {
                const d = current.getDate();
                if (!map[d]) map[d] = [];
                map[d].push(sub);
                // Next occurrence
                switch (cycle) {
                    case 'monthly': current = addMonths(current, 1); break;
                    case 'yearly': current = addYears(current, 1); break;
                    case 'weekly': current = addWeeks(current, 1); break;
                    case 'biweekly': current = addWeeks(current, 2); break;
                    case 'quarterly': current = addMonths(current, 3); break;
                    default: return;
                }
            }
        });
        return map;
    }, [subscriptions, month, year, daysInMonth]);

    // Calendar grid: 6 rows x 7 cols
    const weeks: Array<Array<number | null>> = [];
    let day = 1 - firstDay;
    for (let w = 0; w < 6; w++) {
        const week: Array<number | null> = [];
        for (let d = 0; d < 7; d++, day++) {
            week.push(day > 0 && day <= daysInMonth ? day : null);
        }
        weeks.push(week);
    }

    const monthName = new Date(year, month).toLocaleString(undefined, { month: 'long', year: 'numeric' });

    // Carousel navigation logic
    const handlePrev = () => {
        if (!onChangeMonth) return;
        let newMonth = month - 1;
        let newYear = year;
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        onChangeMonth(newMonth, newYear);
    };
    const handleNext = () => {
        if (!onChangeMonth) return;
        let newMonth = month + 1;
        let newYear = year;
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        onChangeMonth(newMonth, newYear);
    };

    const dayNames = [
        t('calendar_sun') || 'S',
        t('calendar_mon') || 'M',
        t('calendar_tue') || 'T',
        t('calendar_wed') || 'W',
        t('calendar_thu') || 'T',
        t('calendar_fri') || 'F',
        t('calendar_sat') || 'S',
    ];

    return (
        <FluentProvider>
            <div className={styles.calendarBox}>
                <div className={styles.calendarHeader}>
                    {t('payment_calendar_title') || 'Payment Calendar'}
                </div>
                <div className={styles.calendarDescription}>
                    {t('payment_calendar_desc') || 'Click on each day with subscription to see details'}
                </div>
                <div className={styles.calendarGrid}>
                    {dayNames.map((d, i) => (
                        <div key={i} className={styles.dayName}>{d}</div>
                    ))}
                    {weeks.flat().map((d, i) => {
                        if (!d) return <div key={i} className={styles.dayCell}></div>;
                        const subs = calendar[d];
                        const today = new Date();
                        const isToday = (
                            d === today.getDate() &&
                            month === today.getMonth() &&
                            year === today.getFullYear()
                        );
                        const dayCellClass =
                            styles.dayCell + ' ' + styles.activeDay +
                            ' ' + styles.dayCellClickable +
                            (isToday ? ' ' + styles.todayDayCell : '');
                        if (subs && subs.length > 0) {
                            // Sort by amount descending, show only top 6 in logo row
                            const sortedSubs = [...subs].sort((a, b) => b.amount - a.amount);
                            const topSubs = sortedSubs.slice(0, 6);
                            return (
                                <Popover withArrow key={i} positioning="above">
                                    <PopoverTrigger>
                                        <div
                                            className={dayCellClass}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={t('calendar_show_subs_for_day') + ` ${d}` || `Show subscriptions for day ${d}`}
                                        >
                                            <span className={styles.dayNumber}>{d}</span>
                                            <div className={styles.logoRow}>
                                                {topSubs.map(sub => (
                                                    <img
                                                        key={sub.id}
                                                        src={sub.logoUrl}
                                                        alt={sub.name}
                                                        className={styles.logo}
                                                    />
                                                ))}
                                                {subs.length > 6 && (
                                                    <span className={styles.moreCount}>+{subs.length - 6}</span>
                                                )}
                                            </div>
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverSurface>
                                        <div className={styles.popoverContent}>
                                            {sortedSubs.map(sub => (
                                                <div key={sub.id} className={styles.popoverSubRow}>
                                                    <img src={sub.logoUrl} alt={sub.name} className={styles.popoverLogo} />
                                                    <span className={styles.popoverName}>{sub.name}</span>
                                                    <span className={styles.popoverAmount}>${sub.amount}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </PopoverSurface>
                                </Popover>
                            );
                        }
                        return (
                            <div key={i} className={dayCellClass}>
                                <span className={styles.dayNumber}>{d}</span>
                            </div>
                        );
                    })}
                </div>
                <div className={styles.backToTodayRow}>
                    {(month !== new Date().getMonth() || year !== new Date().getFullYear()) && (
                        <Button appearance="primary" size="small" onClick={() => onChangeMonth && onChangeMonth(new Date().getMonth(), new Date().getFullYear())}>
                            {t('calendar_back_to_today') || 'Back to Today'}
                        </Button>
                    )}
                </div>
            </div>
            <div className={styles.carouselBox}>
                <Button icon={<ChevronLeft24Regular />} appearance="subtle" onClick={handlePrev} aria-label={t('calendar_prev_month') || 'Previous month'} className={styles.carouselBtn} />
                <span className={styles.carouselMonth}>{monthName}</span>
                <Button icon={<ChevronRight24Regular />} appearance="subtle" onClick={handleNext} aria-label={t('calendar_next_month') || 'Next month'} className={styles.carouselBtn} />
            </div>
        </FluentProvider>
    );
}
