import React, { useContext } from 'react';
import { tokens } from '@fluentui/react-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Text, Button, Dropdown, Option, Label } from '@fluentui/react-components';
import { WeatherSunnyRegular, WeatherMoonRegular, AlertRegular } from '@fluentui/react-icons';
import styles from './SettingsPage.module.css';
import { useVersion } from '../hooks/useVersion';
import { LanguageContext } from '../App';

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
  const { language, setLanguage, t } = useContext(LanguageContext);

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
              <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{t('settings') || 'Settings'}</h1>
              <p className={styles.settingsSectionDesc}>{t('settings_desc') || 'Manage your app preferences and notifications'}</p>
            </div>

            {/* Language Section */}
            <div className={styles.settingsCard}>
              <div style={{ padding: 24 }}>
                <h3 className={styles.settingsSectionHeader}>{t('language') || 'Language'}</h3>
                <p className={styles.settingsSectionDesc}>{t('language_desc') || 'Select your preferred language for the app'}</p>
              </div>
              <div style={{ padding: 24, paddingTop: 0 }}>
                <Dropdown
                  value={language}
                  onOptionSelect={(_e, d) => setLanguage(d.optionValue as string)}
                  style={{ width: 220 }}
                >
                  <Option value="en-US">{t('language_en_us') || 'English (US)'}</Option>
                  <Option value="fr-CA">{t('language_fr_ca') || 'Français (Canada)'}</Option>
                </Dropdown>
              </div>
            </div>

            {/* Appearance Section */}
            <div className={styles.settingsCard}>
              <div style={{ padding: 24 }}>
                <h3 className={styles.settingsSectionHeader}>{t('appearance') || 'Appearance'}</h3>
                <p className={styles.settingsSectionDesc}>{t('appearance_desc') || 'Customize how SubMan looks on your device'}</p>
              </div>
              <div style={{ padding: 24, paddingTop: 0 }}>
                <div className={styles.settingsRow}>
                  <div className={styles.settingsRowLabel}>
                    {colorMode === 'dark' ? (
                      <WeatherMoonRegular style={{ color: tokens.colorPaletteYellowForeground2 }} />
                    ) : (
                      <WeatherSunnyRegular style={{ color: tokens.colorPaletteYellowForeground1 }} />
                    )}
                    <Label>{t('theme') || 'Theme'}</Label>
                  </div>
                  <Button appearance="secondary" onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}>
                    {colorMode === 'dark' ? t('light_mode') || 'Light Mode' : t('dark_mode') || 'Dark Mode'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className={styles.settingsCard}>
              <div style={{ padding: 24 }}>
                <h3 className={styles.settingsSectionHeader}>{t('notifications') || 'Notifications'}</h3>
                <p className={styles.settingsSectionDesc}>{t('notifications_desc') || 'Manage how you receive notifications about your subscriptions'}</p>
              </div>
              <div style={{ padding: 24, paddingTop: 0 }}>
                <div className={styles.settingsRow} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertRegular style={{ color: tokens.colorPaletteBlueForeground2, fontSize: 22 }} />
                    <Label>{t('push_notifications') || 'Push Notifications'}</Label>
                  </div>
                  {permission !== 'granted' && (
                    <Button appearance="primary" disabled={pushLoading} onClick={onPushToggle}>
                      {t('allow_notification') || 'Allow Notification'}
                    </Button>
                  )}
                </div>
                <Text style={{ color: 'var(--fluent-colorNeutralForeground3, #888)', fontSize: tokens.fontSizeBase200, marginTop: tokens.spacingVerticalXS }}>
                  {permission === 'granted'
                    ? t('push_granted') || "You'll receive notifications about upcoming renewals."
                    : permission === 'denied'
                      ? t('push_denied') || "Notifications are blocked in your browser settings."
                      : t('push_default') || "You can enable notifications for this app in your browser by clicking Allow Notification."}
                </Text>
              </div>
            </div>

            {/* App Information Section */}
            <div className={styles.settingsCard}>
              <div style={{ padding: 24 }}>
                <h3 className={styles.settingsSectionHeader}>{t('app_information') || 'App Information'}</h3>
                <p className={styles.settingsSectionDesc}>{t('app_information_desc') || 'Details about your SubMan installation'}</p>
              </div>
              <div style={{ padding: 24, paddingTop: 0 }}>
                <div style={{ marginBottom: 20 }}>
                  <div className={styles.settingsInfoLabel}>{t('version') || 'Version'}</div>
                  <div className={styles.settingsInfoText}>{version || (loading ? 'Loading...' : error ? 'Error' : '')}</div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div className={styles.settingsInfoLabel}>{t('installation_type') || 'Installation Type'}</div>
                  <div className={styles.settingsInfoText}>{t('installation_type_pwa') || 'Progressive Web App (PWA)'}</div>
                </div>
                <div>
                  <div className={styles.settingsInfoLabel}>{t('last_updated') || 'Last Updated'}</div>
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
