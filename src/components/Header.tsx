import * as React from 'react';
import { Text } from '@fluentui/react-components';
import ProfileMenu from './ProfileMenu';
import { LanguageContext } from '../App';
import { Drawer, MenuList, MenuItem, Button } from '@fluentui/react-components';
import { Dismiss24Regular, Navigation24Regular } from '@fluentui/react-icons';

import styles from './Header.module.css';

export default function Header({ user }: { user: any }) {
  const { t } = React.useContext(LanguageContext);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <header className={styles.headerContainer}>
      <div
        className={styles.logoBrand}
        onClick={() => { if (user) window.location.href = user.role === 'admin' ? '/admin/dashboard' : '/dashboard'; }}
        tabIndex={user ? 0 : -1}
        role="button"
        aria-label="Go to dashboard"
        style={{ cursor: user ? 'pointer' : 'default' }}
      >
        <img src="/android/android-launchericon-192-192.png" alt="SubMan Logo" className={styles.logoImage} />
        <Text size={500} weight="bold" style={{ letterSpacing: 1 }}>SubMan</Text>
      </div>
      <nav className={styles.menuNav} aria-label="Main menu">
        <ul className={styles.menuList}>
          <li className={styles.menuHamburger}>
            <Button appearance="subtle" icon={<Navigation24Regular />} aria-label="Open menu" onClick={() => setDrawerOpen(true)} className={styles.hamburgerBtn} />
          </li>
          <li className={styles.menuDesktop}><a href="/dashboard" className={styles.menuItem}>{t('menu_dashboard')}</a></li>
          <li className={styles.menuDesktop}><a href="/subscriptions" className={styles.menuItem}>{t('menu_my_subscriptions')}</a></li>
          <li className={styles.menuDesktop}><a href="/feedback" className={styles.menuItem}>{t('menu_feedback_hub')}</a></li>
        </ul>
      </nav>
      <Drawer open={drawerOpen} onOpenChange={(_, d) => setDrawerOpen(d.open)} position="start" size="small">
        <div className={styles.drawerHeader}>
          <Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Close menu" onClick={() => setDrawerOpen(false)} />
        </div>
        <MenuList>
          <MenuItem onClick={() => { window.location.href = '/dashboard'; setDrawerOpen(false); }}>{t('menu_dashboard')}</MenuItem>
          <MenuItem onClick={() => { window.location.href = '/subscriptions'; setDrawerOpen(false); }}>{t('menu_my_subscriptions')}</MenuItem>
          <MenuItem onClick={() => { window.location.href = '/feedback'; setDrawerOpen(false); }}>{t('menu_feedback_hub')}</MenuItem>
        </MenuList>
      </Drawer>
      {user && <ProfileMenu user={user} />}
    </header>
  );
}

