import React, { useState, useContext } from 'react';
import { Button, Input, Textarea, Text } from '@fluentui/react-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './FeedbackPage.module.css';
import { LanguageContext } from '../App';
import { apiRequest } from '../api';

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function FeedbackPage({ user }: { user?: any }) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [captchaA, setCaptchaA] = useState(() => getRandomInt(1, 10));
    const [captchaB, setCaptchaB] = useState(() => getRandomInt(1, 10));
    const [captchaInput, setCaptchaInput] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useContext(LanguageContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('');
        if (parseInt(captchaInput, 10) !== captchaA + captchaB) {
            setStatus('Captcha incorrect. Please try again.');
            setCaptchaA(getRandomInt(1, 10));
            setCaptchaB(getRandomInt(1, 10));
            setCaptchaInput('');
            return;
        }
        setLoading(true);
        try {
            await apiRequest('/send-feedback', 'POST', { title, message });
            setStatus('Thank you for your feedback!');
            setTitle('');
            setMessage('');
        } catch {
            setStatus('Failed to send feedback. Please try again later.');
        } finally {
            setLoading(false);
            setCaptchaA(getRandomInt(1, 10));
            setCaptchaB(getRandomInt(1, 10));
            setCaptchaInput('');
        }
    };

    const handleReset = () => {
        setTitle('');
        setMessage('');
        setCaptchaA(getRandomInt(1, 10));
        setCaptchaB(getRandomInt(1, 10));
        setCaptchaInput('');
        setStatus('');
    };

    return (
        <div className={styles.feedbackBg}>
            <Header user={user} />
            <main className={styles.feedbackContainer}>
                <div className={styles.feedbackCard}>
                    <div className={styles.feedbackTitle}>{t('feedback_hub_title')}</div>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.feedbackFormGroup}>
                            <label htmlFor="feedback-title">{t('feedback_hub_label_title')}</label>
                            <Input id="feedback-title" value={title} onChange={e => setTitle(e.target.value)} required placeholder={t('feedback_hub_placeholder_title')} />
                        </div>
                        <div className={styles.feedbackFormGroup}>
                            <label htmlFor="feedback-message">{t('feedback_hub_label_message')}</label>
                            <Textarea id="feedback-message" value={message} onChange={e => setMessage(e.target.value)} required placeholder={t('feedback_hub_placeholder_message')} />
                        </div>
                        <div className={styles.feedbackFormGroup}>
                            <label htmlFor="feedback-captcha">{t('feedback_hub_label_captcha').replace('{a}', String(captchaA)).replace('{b}', String(captchaB))}</label>
                            <Input id="feedback-captcha" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} required className={styles.captchaInput} placeholder={t('feedback_hub_placeholder_captcha')} />
                        </div>
                        {status && (
                            <Text className={styles.feedbackStatus + ' ' + (status.startsWith('Thank') || status.startsWith(t('feedback_hub_success')) ? styles.feedbackSuccess : styles.feedbackError)}>
                                {
                                    status.startsWith('Thank') || status === t('feedback_hub_success')
                                        ? t('feedback_hub_success')
                                        : status.startsWith('Captcha') || status === t('feedback_hub_error_captcha')
                                            ? t('feedback_hub_error_captcha')
                                            : status.startsWith('Failed') || status === t('feedback_hub_error_failed')
                                                ? t('feedback_hub_error_failed')
                                                : status
                                }
                            </Text>
                        )}
                        <div className={styles.feedbackButtonRow}>
                            <Button appearance="primary" type="submit" disabled={loading}>{t('feedback_hub_submit')}</Button>
                            <Button type="button" appearance="secondary" onClick={handleReset} disabled={loading}>{t('feedback_hub_reset')}</Button>
                        </div>
                    </form>
                </div>
            </main>
            <div className={styles.footer}><Footer /></div>
        </div>
    );
}
