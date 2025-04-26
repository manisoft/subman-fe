import { Avatar, Menu, MenuTrigger, MenuPopover, MenuList, tokens, makeStyles, shorthands } from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';
import { ChevronDownFilled } from '@fluentui/react-icons';

const useStyles = makeStyles({
  menuList: {
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    boxShadow: tokens.shadow16,
    borderRadius: tokens.borderRadiusMedium,
    minWidth: '224px', // w-56
    padding: '4px', // p-1
    zIndex: 9999,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: '8px 16px', // px-2 py-1.5
    fontSize: tokens.fontSizeBase300,
    fontWeight: 600,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: tokens.borderRadiusSmall,
    padding: '8px 16px', // px-2 py-1.5
    fontSize: tokens.fontSizeBase300,
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
    ':focus, :hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      color: tokens.colorNeutralForeground1Hover,
    },
    '[data-disabled]': {
      pointerEvents: 'none',
      opacity: 0.5,
    },
  },
  destructive: {
    color: '#dc2626', // Tailwind red-600
    ':focus, :hover': {
      color: tokens.colorPaletteRedForeground2,
      backgroundColor: tokens.colorPaletteRedBackground2,
    },
  },
  divider: {
    margin: '4px 0', // my-1
    height: '1px',
    background: tokens.colorNeutralStroke2,
    border: 'none',
  },
  icon: {
    marginRight: '8px',
    width: '16px',
    height: '16px',
    color: 'inherit',
  },
  avatar: {
    border: `2px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground1,
    ...shorthands.transition('border-color', 'background-color', 'color'),
    cursor: 'pointer',
  },
});

export default function ProfileMenu({ user }: { user: any }) {
  const navigate = useNavigate();
  const styles = useStyles();

  return (
    <Menu positioning={{ autoSize: true }}>
      <MenuTrigger disableButtonEnhancement>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar name={user?.name || user?.email || 'User'} className={styles.avatar} image={user?.avatarUrl ? { src: user.avatarUrl } : undefined} />
          <span style={{ fontSize: 16, color: tokens.colorNeutralForeground3, userSelect: 'none' }} aria-hidden="true"><ChevronDownFilled /></span>
        </span>
      </MenuTrigger>
      <MenuPopover>
        <MenuList className={styles.menuList}>
          <div className={styles.sectionHeader}>My Account</div>
          <hr className={styles.divider} />
          <div
            role="menuitem"
            className={styles.menuItem}
            tabIndex={-1}
            onClick={() => navigate('/profile')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Profile
          </div>
          <div
            role="menuitem"
            className={styles.menuItem}
            tabIndex={-1}
            onClick={() => navigate('/settings')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            Settings
          </div>
          <hr className={styles.divider} />
          <div
            role="menuitem"
            className={`${styles.menuItem} ${styles.destructive}`}
            tabIndex={-1}
            onClick={() => { localStorage.clear(); window.location.href = '/'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
            Log out
          </div>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
