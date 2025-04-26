import * as React from 'react';
import { Text } from '@fluentui/react-components';
import ProfileMenu from './ProfileMenu';

import styles from './Header.module.css';

export default function Header({ user }: { user: any }) {
  return (
    <header className={styles.headerContainer}>
      <div
        className={styles.logoBrand}
        onClick={() => { if (user) window.location.href = '/dashboard'; }}
        tabIndex={user ? 0 : -1}
        role="button"
        aria-label="Go to dashboard"
        style={{ cursor: user ? 'pointer' : 'default' }}
      >
        <img src="/logo.png" alt="SubMan Logo" className={styles.logoImage} />
        <Text size={500} weight="bold" style={{ letterSpacing: 1 }}>SubMan</Text>
      </div>
      {user && <ProfileMenu user={user} />}
    </header>
  );
}

