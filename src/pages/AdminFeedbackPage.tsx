import * as React from 'react';
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, Button, Spinner, Text, Input, FluentProvider, webLightTheme, webDarkTheme, tokens } from '@fluentui/react-components';
import styles from './AdminDashboardPage.module.css';
import { Search24Regular } from '@fluentui/react-icons';
import { apiRequest } from '../api';
import { AdminNav } from '../components/AdminNav';

export default function AdminFeedbackPage({ token, user, onLogout }: { token: string; user: any; onLogout: () => void }) {
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

    const [feedback, setFeedback] = React.useState<any[]>([]);
    const [feedbackTotal, setFeedbackTotal] = React.useState(0);
    const [feedbackPage, setFeedbackPage] = React.useState(1);
    const [feedbackLoading, setFeedbackLoading] = React.useState(false);
    const [feedbackError, setFeedbackError] = React.useState('');
    const [feedbackSearch, setFeedbackSearch] = React.useState('');
    const FEEDBACK_PAGE_SIZE = 50;

    React.useEffect(() => {
        setFeedbackLoading(true);
        setFeedbackError('');
        apiRequest<{ feedback: any[]; total: number }>(`/admin/feedback?page=${feedbackPage}&limit=${FEEDBACK_PAGE_SIZE}&q=${encodeURIComponent(feedbackSearch)}`, 'GET', undefined, token)
            .then(data => {
                setFeedback(data.feedback || []);
                setFeedbackTotal(data.total || 0);
            })
            .catch(e => setFeedbackError(e.message || 'Failed to fetch feedback'))
            .finally(() => setFeedbackLoading(false));
    }, [feedbackPage, feedbackSearch, token]);

    return (
        <FluentProvider theme={colorMode === 'dark' ? webDarkTheme : webLightTheme} style={{ minHeight: '100dvh', background: tokens.colorNeutralBackground1 }}>
            <div className={styles.adminDashboardRoot}>
                <AdminNav selected={"/admin/feedback"} onLogout={onLogout} />
                <main className={styles.adminDashboardMain}>
                    <h1>Feedback</h1>
                    <div className={styles.feedbackSearchBar}>
                        <Input
                            value={feedbackSearch}
                            onChange={e => setFeedbackSearch(e.target.value)}
                            placeholder="Search feedback..."
                            contentBefore={<Search24Regular />}
                        />
                    </div>
                    {feedbackLoading ? <Spinner size="large" /> : feedbackError ? <Text style={{ color: 'red' }}>{feedbackError}</Text> : (
                        <>
                            <Table aria-label="Feedback table">
                                <TableHeader>
                                    <TableRow>
                                        <TableHeaderCell>User Email</TableHeaderCell>
                                        <TableHeaderCell>Title</TableHeaderCell>
                                        <TableHeaderCell>Message</TableHeaderCell>
                                        <TableHeaderCell>Created</TableHeaderCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feedback.map(fb => (
                                        <TableRow key={fb.id}>
                                            <TableCell>{fb.user_email || '-'}</TableCell>
                                            <TableCell>{fb.title}</TableCell>
                                            <TableCell style={{ maxWidth: 320, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{fb.message}</TableCell>
                                            <TableCell>{new Date(fb.created_at).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className={styles.paginationControls}>
                                <Button disabled={feedbackPage === 1} onClick={() => setFeedbackPage(feedbackPage - 1)}>Previous</Button>
                                <Text>Page {feedbackPage} of {Math.ceil(feedbackTotal / FEEDBACK_PAGE_SIZE) || 1}</Text>
                                <Button disabled={feedbackPage * FEEDBACK_PAGE_SIZE >= feedbackTotal} onClick={() => setFeedbackPage(feedbackPage + 1)}>Next</Button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </FluentProvider>
    );
}
