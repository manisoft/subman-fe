import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, shorthands } from '@fluentui/react-components';

import { tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  footer: {
    width: '100%',
    marginTop: 'auto',
    padding: '0',
    background: tokens.colorNeutralBackground1,
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke1),
    fontSize: '16px',
    position: 'relative',
    left: 0,
    bottom: 0,
  },
  footerInner: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px 0',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '@media (min-width: 768px)': {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
  copyright: {
    color: '#888',
    fontSize: '14px',
    marginBottom: '16px',
    '@media (min-width: 768px)': {
      marginBottom: 0,
    },
  },
  links: {
    display: 'flex',
    gap: '24px',
  },
  link: {
    color: '#888',
    fontSize: '14px',
    textDecoration: 'none',
    transition: 'color 0.2s',
    ':hover': {
      color: '#323130',
    },
  },
});

export default function Footer() {
  const styles = useStyles();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p className={styles.copyright}>© {new Date().getFullYear()} SubMan. All rights reserved.</p>
        <div className={styles.links}>
          <Link className={styles.link} to="/about-us">About Us</Link>
          <Link className={styles.link} to="/contact-us">Contact Us</Link>
          <Link className={styles.link} to="/terms-of-service">Terms of Service</Link>
          <Link className={styles.link} to="/privacy-policy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
