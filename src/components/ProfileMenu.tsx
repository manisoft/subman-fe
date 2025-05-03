import React from 'react';
import { Avatar, Menu, MenuTrigger, MenuPopover, MenuList, tokens } from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';
import { ChevronDownFilled } from '@fluentui/react-icons';
import styles from './ProfileMenu.module.css';

export default function ProfileMenu({ user }: { user: any }) {
  const navigate = useNavigate();

  return (
    <Menu positioning={{ autoSize: true }}>
      <MenuTrigger disableButtonEnhancement>
        <span className={styles.profileMenu}>
          <Avatar
            name={user?.name || user?.email || 'User'}
            className={styles.profileMenuAvatar}
            image={user?.avatarUrl ? { src: user.avatarUrl } : undefined}
            initials={user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U')}
          />
          <div className={styles.profileMenuUserInfo}>
            <span>{user?.name || 'User'}</span>
            <span>{user?.email}</span>
          </div>
          <span className={styles.profileMenuChevron}><ChevronDownFilled /></span>
        </span>
      </MenuTrigger>
      <MenuPopover>
        <MenuList className={styles.profileMenuDropdown} style={{
          background: tokens.colorNeutralBackground1,
          color: tokens.colorNeutralForeground1,
          boxShadow: tokens.shadow16
        }}>
          <div className={styles.profileMenuSectionHeader}>My Account</div>
          <hr className={styles.profileMenuDivider} style={{ background: tokens.colorNeutralStroke2 }} />
          <div
            role="menuitem"
            className={styles.profileMenuDropdownItem}
            tabIndex={-1}
            onClick={() => navigate('/profile')}
            style={{ color: tokens.colorNeutralForeground1 }}
          >
            <svg className={styles.profileMenuIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Profile
          </div>
          <div
            role="menuitem"
            className={styles.profileMenuDropdownItem}
            tabIndex={-1}
            onClick={() => navigate('/settings')}
            style={{ color: tokens.colorNeutralForeground1 }}
          >
            <svg className={styles.profileMenuIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            Settings
          </div>
          <hr className={styles.profileMenuDivider} style={{ background: tokens.colorNeutralStroke2 }} />
          <div
            role="menuitem"
            className={`${styles.profileMenuDropdownItem} ${styles.profileMenuDestructive}`}
            tabIndex={-1}
            onClick={() => { localStorage.clear(); window.location.href = '/'; }}
            style={{ color: tokens.colorPaletteRedForeground1 }}
          >
            <svg className={styles.profileMenuIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
            Log out
          </div>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
