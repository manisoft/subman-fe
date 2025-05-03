import React, { useEffect, useState } from 'react';
import { tokens } from '@fluentui/react-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardHeader, CardFooter, Text, Button, Switch, Dropdown, Option, Spinner, Label } from '@fluentui/react-components';
import { WeatherSunnyRegular, WeatherMoonRegular, AlertRegular } from '@fluentui/react-icons';
import styles from './SettingsPage.module.css';
import { useVersion } from '../hooks/useVersion';

interface SettingsPageProps {
  user: any;
  colorMode: 'light' | 'dark';
  setColorMode: (mode: 'light' | 'dark') => void;
  pushEnabled: boolean;
  pushLoading: boolean;
  onPushToggle: () => void;
}

export default function SettingsPage({ user, colorMode, setColorMode, pushEnabled, pushLoading, onPushToggle }: SettingsPageProps) {
  // Check browser notification permission
  const [permission, setPermission] = React.useState(Notification.permission);
  const prevPermission = React.useRef(permission);
  const { version, loading, error, releaseDate } = useVersion();

  React.useEffect(() => {
    setPermission(Notification.permission);
  }, [pushEnabled]);

  // Removed: auto-refresh is now handled in App.tsx
  React.useEffect(() => {
    prevPermission.current = permission;
  }, [permission]);

  return (
    <div className={styles.pageRoot}>
      <Header user={user} />
      <div className={styles.settingsBg}>
        <main className={styles.settingsContainer}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Settings</h1>
              <p className={styles.settingsSectionDesc}>Manage your app preferences and notifications</p>
            </div>

            {/* Appearance Section */}
            <div className={styles.settingsCard}>
              <div style={{ padding: 24 }}>
                <h3 className={styles.settingsSectionHeader}>Appearance</h3>
                <p className={styles.settingsSectionDesc}>Customize how SubMan looks on your device</p>
              </div>
              <div style={{ padding: 24, paddingTop: 0 }}>
                <div className={styles.settingsRow}>
                  <div className={styles.settingsRowLabel}>
                    {colorMode === 'dark' ? (
                      <WeatherMoonRegular style={{ color: tokens.colorPaletteYellowForeground2 }} />
                    ) : (
                      <WeatherSunnyRegular style={{ color: tokens.colorPaletteYellowForeground1 }} />
                    )}
                    <Label>Theme</Label>
                  </div>
                  <Button appearance="secondary" onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}>
                    {colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className={styles.settingsCard}>
              <div style={{ padding: 24 }}>
                <h3 className={styles.settingsSectionHeader}>Notifications</h3>
                <p className={styles.settingsSectionDesc}>Manage how you receive notifications about your subscriptions</p>
              </div>
              <div style={{ padding: 24, paddingTop: 0 }}>
                <div className={styles.settingsRow} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertRegular style={{ color: tokens.colorPaletteBlueForeground2, fontSize: 22 }} />
                    <Label>Push Notifications</Label>
                  </div>
                  {permission !== 'granted' && (
                    <Button appearance="primary" disabled={pushLoading} onClick={onPushToggle}>
                      Allow Notification
                    </Button>
                  )}
                </div>
                <Text style={{ color: 'var(--fluent-colorNeutralForeground3, #888)', fontSize: tokens.fontSizeBase200, marginTop: tokens.spacingVerticalXS }}>
                  {permission === 'granted'
                    ? "You'll receive notifications about upcoming renewals."
                    : permission === 'denied'
                      ? "Notifications are blocked in your browser settings."
                      : "You can enable notifications for this app in your browser by clicking Allow Notification."}
                </Text>
              </div>
            </div>

            {/* App Information Section */}
            <div className={styles.settingsCard}>
              <div style={{ padding: 24 }}>
                <h3 className={styles.settingsSectionHeader}>App Information</h3>
                <p className={styles.settingsSectionDesc}>Details about your SubMan installation</p>
              </div>
              <div style={{ padding: 24, paddingTop: 0 }}>
                <div style={{ marginBottom: 20 }}>
                  <div className={styles.settingsInfoLabel}>Version</div>
                  <div className={styles.settingsInfoText}>{version || (loading ? 'Loading...' : error ? 'Error' : '')}</div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div className={styles.settingsInfoLabel}>Installation Type</div>
                  <div className={styles.settingsInfoText}>Progressive Web App (PWA)</div>
                </div>
                <div>
                  <div className={styles.settingsInfoLabel}>Last Updated</div>
                  <div className={styles.settingsInfoText}>{releaseDate ? releaseDate.toLocaleDateString() : '2025'}</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
