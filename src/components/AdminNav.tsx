import { Button, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';

const navLinks = [
    { name: 'Dashboard', key: '/admin/dashboard' },
    { name: 'Settings', key: '/admin/settings' },
    { name: 'Pages', key: '/admin/pages' },
    { name: 'Notifications', key: '/admin/notifications' },
    { name: 'Feedback Hub', key: '/admin/feedback' },
    { name: 'Analytics', key: '/admin/analytics' },
    { name: 'Popular Services', key: '/admin/popular-services' },
];

const useStyles = makeStyles({
    nav: {
        minWidth: '200px',
        background: 'var(--fluent-colorNeutralBackground1)',
        padding: '24px',
        borderRight: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        ...shorthands.gap('12px'),
        '@media (max-width: 700px)': {
            minWidth: 0,
            width: '100vw',
            height: 'auto',
            borderRight: 'none',
            borderBottom: '1px solid #eee',
            flexDirection: 'row',
            alignItems: 'flex-end',
            padding: '8px 4px 56px 4px',
        },
    },
    navLinks: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap('12px'),
        '@media (max-width: 700px)': {
            flexDirection: 'row',
            gap: '4px',
        },
    },
    navButton: {
        justifyContent: 'flex-start',
        width: '100%',
        '@media (max-width: 700px)': {
            width: 'auto',
            minWidth: '80px',
            fontSize: '14px',
            padding: '8px 8px',
        },
    },
    logout: {
        position: 'absolute',
        left: '24px',
        bottom: '24px',
        width: 'calc(100% - 48px)',
        '@media (max-width: 700px)': {
            position: 'fixed',
            left: 0,
            bottom: 0,
            width: '100vw',
            background: tokens.colorNeutralBackground1,
            borderTop: '1px solid #eee',
            zIndex: 10,
            padding: '8px 16px',
        },
    },
});

export function AdminNav({ selected, onLogout }: { selected: string; onLogout?: () => void }) {
    const navigate = useNavigate();
    const styles = useStyles();
    return (
        <nav className={styles.nav}>
            <div className={styles.navLinks}>
                {navLinks.map(link => (
                    <Button
                        key={link.key}
                        appearance={selected === link.key ? 'primary' : 'subtle'}
                        onClick={() => navigate(link.key)}
                        className={styles.navButton}
                    >
                        {link.name}
                    </Button>
                ))}
            </div>
            <div className={styles.logout}>
                <Button appearance="subtle" onClick={onLogout} style={{ width: '100%' }}>
                    Logout
                </Button>
            </div>
        </nav>
    );
}