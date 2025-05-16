import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import { Button } from '@fluentui/react-components';
import { Wallet24Regular, CalendarLtr24Regular, PlayCircle24Regular, MusicNote2PlayRegular, Dumbbell24Regular } from '@fluentui/react-icons';

const testimonials = [
    {
        quote: 'SubMan helped me organize my subscriptions & save money!',
        user: '— Peter',
    },
    {
        quote: 'I never miss a renewal now. Super easy to use!',
        user: '— Jeremy',
    },
    {
        quote: 'Finally, all my subscriptions in one place. Love the dashboard!',
        user: '— Nina',
    },
];

export default function LandingPage() {
    const navigate = useNavigate();
    return (
        <div className={styles.landingRoot}>
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1 className={styles.headline}>
                        Track, Manage & Control Your <span className={styles.gradientText}>Subscriptions</span>—Effortlessly!
                    </h1>
                    <p className={styles.subheading}>
                        Keep track of all your subscriptions in one place. Stay organized and never miss a renewal!
                    </p>
                    <div className={styles.ctaButtons}>
                        <Button size="large" appearance="primary" className={styles.ctaButton} onClick={() => navigate('/auth')}>Start Tracking Now</Button>
                        <Button style={{ color: 'black' }} size="large" appearance="outline" className={styles.ctaButton} onClick={() => navigate('/auth')}>Add Your First Subscription!</Button>
                    </div>
                </div>
                <div className={styles.heroImageWrap}>
                    <img src="/landing-dashboard-preview.svg" alt="Dashboard Preview" className={styles.dashboardPreview} />
                    <div className={styles.animatedIcons}>
                        <span className={styles.iconEntertainment}><PlayCircle24Regular /></span>
                        <span className={styles.iconMusic}><MusicNote2PlayRegular /></span>
                        <span className={styles.iconFitness}><Dumbbell24Regular /></span>
                        <span className={styles.iconFinance}><Wallet24Regular /></span>
                        <span className={styles.iconCalendar}><CalendarLtr24Regular /></span>
                    </div>
                </div>
            </div>
            <div className={styles.exampleSection}>
                <div className={styles.exampleCard}>
                    <div className={styles.exampleInput}>
                        <span className={styles.exampleIcon}><PlayCircle24Regular /></span>
                        <span className={styles.exampleText}>Netflix - $15.99/month - Auto-renews on 5th</span>
                        <span className={styles.exampleCategory}>Entertainment</span>
                    </div>
                    <div className={styles.exampleInput}>
                        <span className={styles.exampleIcon}><MusicNote2PlayRegular /></span>
                        <span className={styles.exampleText}>Spotify - $9.99/month</span>
                        <span className={styles.exampleCategory}>Music</span>
                    </div>
                    <div className={styles.exampleInput}>
                        <span className={styles.exampleIcon}><Dumbbell24Regular /></span>
                        <span className={styles.exampleText}>Gym Membership - $29.99/month</span>
                        <span className={styles.exampleCategory}>Fitness</span>
                    </div>
                </div>
                <div className={styles.progressCard}>
                    <div className={styles.progressCircleWrap}>
                        <svg className={styles.progressCircle} viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" stroke="#e0e7ff" strokeWidth="10" fill="none" />
                            <circle cx="50" cy="50" r="45" stroke="#3972ec" strokeWidth="10" fill="none" strokeDasharray="282.74" strokeDashoffset="70" style={{ transition: 'stroke-dashoffset 1s' }} />
                        </svg>
                        <span className={styles.progressValue}>$55.97</span>
                    </div>
                    <div className={styles.progressLabel}>Monthly Spending</div>
                </div>
            </div>
            <div className={styles.testimonialsSection}>
                <h2 className={styles.testimonialsTitle}>What Our Users Say</h2>
                <div className={styles.testimonialsGrid}>
                    {testimonials.map((t, i) => (
                        <div className={styles.testimonialCard} key={i}>
                            <p className={styles.testimonialQuote}>“{t.quote}”</p>
                            <span className={styles.testimonialUser}>{t.user}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
