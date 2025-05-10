import React, { useContext } from 'react';
import { tokens } from '@fluentui/react-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Text, Button, Dropdown, Option, Label } from '@fluentui/react-components';
import { WeatherSunnyRegular, WeatherMoonRegular, AlertRegular } from '@fluentui/react-icons';
import styles from './SettingsPage.module.css';
import { useVersion } from '../hooks/useVersion';
import { LanguageContext } from '../App';
import currencies from '../currencies.json';
import { apiRequest } from '../api';

interface SettingsPageProps {
  user: any;
  colorMode: 'light' | 'dark';
  setColorMode: (mode: 'light' | 'dark') => void;
  pushEnabled: boolean;
  pushLoading: boolean;
  onPushToggle: () => void;
}

// Utility to detect default currency from browser locale
function getDefaultCurrency() {
  // Try to use browser's resolved currency
  try {
    const currency = Intl.NumberFormat().resolvedOptions().currency;
    if (currency && (currencies as Record<string, string>)[currency]) return currency;
  } catch { }
  // Fallback: map language/region to currency
  const locale = navigator.language || 'en-US';
  const region = locale.split('-')[1];
  // Simple region->currency mapping (expand as needed)
  const regionCurrencyMap: Record<string, string> = {
    'US': 'USD', 'CA': 'CAD', 'GB': 'GBP', 'FR': 'EUR', 'DE': 'EUR', 'JP': 'JPY', 'CN': 'CNY', 'IN': 'INR', 'AU': 'AUD', 'RU': 'RUB', 'BR': 'BRL', 'MX': 'MXN', 'ZA': 'ZAR', 'KR': 'KRW', 'TR': 'TRY', 'IR': 'IRR', 'SA': 'SAR', 'AE': 'AED', 'CH': 'CHF', 'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK', 'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF', 'SG': 'SGD', 'HK': 'HKD', 'NZ': 'NZD', 'TH': 'THB', 'ID': 'IDR', 'MY': 'MYR', 'PH': 'PHP', 'PK': 'PKR', 'EG': 'EGP', 'NG': 'NGN', 'KE': 'KES', 'AR': 'ARS', 'CO': 'COP', 'CL': 'CLP', 'PE': 'PEN', 'VE': 'VES', 'UA': 'UAH', 'RO': 'RON', 'BG': 'BGN', 'IL': 'ILS', 'IQ': 'IQD', 'JO': 'JOD', 'LB': 'LBP', 'OM': 'OMR', 'QA': 'QAR', 'KW': 'KWD', 'BH': 'BHD', 'DZ': 'DZD', 'MA': 'MAD', 'TN': 'TND', 'SD': 'SDG', 'LY': 'LYD', 'GH': 'GHS', 'TZ': 'TZS', 'UG': 'UGX', 'ZM': 'ZMW', 'ZW': 'ZWL', 'BD': 'BDT', 'LK': 'LKR', 'NP': 'NPR', 'MM': 'MMK', 'KH': 'KHR', 'VN': 'VND', 'LA': 'LAK', 'MN': 'MNT', 'UZ': 'UZS', 'KZ': 'KZT', 'KG': 'KGS', 'TJ': 'TJS', 'TM': 'TMT', 'AF': 'AFN', 'AZ': 'AZN', 'AM': 'AMD', 'GE': 'GEL', 'MD': 'MDL', 'BY': 'BYN', 'EE': 'EUR', 'LT': 'EUR', 'LV': 'EUR', 'SK': 'EUR', 'SI': 'EUR', 'HR': 'EUR', 'RS': 'RSD', 'ME': 'EUR', 'MK': 'MKD', 'AL': 'ALL', 'BA': 'BAM', 'XK': 'EUR', 'IS': 'ISK', 'FI': 'EUR', 'IE': 'EUR', 'PT': 'EUR', 'ES': 'EUR', 'IT': 'EUR', 'GR': 'EUR', 'NL': 'EUR', 'BE': 'EUR', 'LU': 'EUR', 'AT': 'EUR', 'MT': 'EUR', 'CY': 'EUR', 'SM': 'EUR', 'VA': 'EUR', 'AD': 'EUR', 'LI': 'CHF', 'GI': 'GIP', 'GG': 'GGP', 'JE': 'JEP', 'IM': 'IMP', 'FO': 'DKK', 'GL': 'DKK', 'SJ': 'NOK', 'AX': 'EUR', 'PM': 'EUR', 'WF': 'XPF', 'PF': 'XPF', 'NC': 'XPF', 'TF': 'EUR', 'YT': 'EUR', 'RE': 'EUR', 'MQ': 'EUR', 'GP': 'EUR', 'BL': 'EUR', 'MF': 'EUR', 'SX': 'ANG', 'CW': 'ANG', 'BQ': 'USD', 'AW': 'AWG', 'SR': 'SRD', 'GF': 'EUR', 'FK': 'FKP', 'GS': 'GBP', 'SH': 'SHP', 'IO': 'USD', 'VG': 'USD', 'KY': 'KYD', 'BM': 'BMD', 'MS': 'XCD', 'AI': 'XCD', 'AG': 'XCD', 'DM': 'XCD', 'LC': 'XCD', 'VC': 'XCD', 'KN': 'XCD', 'TC': 'USD', 'BS': 'BSD', 'BB': 'BBD', 'GD': 'XCD', 'TT': 'TTD', 'JM': 'JMD', 'BZ': 'BZD', 'GT': 'GTQ', 'SV': 'USD', 'HN': 'HNL', 'NI': 'NIO', 'CR': 'CRC', 'PA': 'PAB', 'DO': 'DOP', 'CU': 'CUP', 'HT': 'HTG'
  };
  if (region && regionCurrencyMap[region]) return regionCurrencyMap[region];
  return 'USD';
}

export default function SettingsPage({ user, colorMode, setColorMode, pushEnabled, pushLoading, onPushToggle }: SettingsPageProps) {
  // Check browser notification permission
  const [permission, setPermission] = React.useState(Notification.permission);
  const prevPermission = React.useRef(permission);
  const { version, loading, error, releaseDate } = useVersion();
  const { language, setLanguage, t } = useContext(LanguageContext);

  // Currency state and persistence
  const [currency, setCurrency] = React.useState('USD');
  const [currenciesList, setCurrenciesList] = React.useState<{ code: string; name: string }[]>([]);
  const [loadingCurrency, setLoadingCurrency] = React.useState(true);

  React.useEffect(() => {
    async function fetchCurrencyData() {
      setLoadingCurrency(true);
      try {
        const token = localStorage.getItem('token') || undefined;
        const [userRes, allRes] = await Promise.all([
          apiRequest<{ currency: string }>('/user/currency', 'GET', undefined, token),
          apiRequest<{ code: string; name: string }[]>('/user/currencies', 'GET'),
        ]);
        setCurrency(userRes.currency || getDefaultCurrency());
        setCurrenciesList(allRes.map((c) => ({ code: c.code, name: c.name })));
      } finally {
        setLoadingCurrency(false);
      }
    }
    fetchCurrencyData();
  }, []);

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency);
    const token = localStorage.getItem('token') || undefined;
    await apiRequest('/user/currency', 'PUT', { currency: newCurrency }, token);
  };

  React.useEffect(() => {
    setPermission(Notification.permission);
  }, [pushEnabled]);

  // Removed: auto-refresh is now handled in App.tsx
  React.useEffect(() => {
    prevPermission.current = permission;
  }, [permission]);

  React.useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

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
                  value={t(
                    language === 'en-US' ? 'language_english' :
                      language === 'fr-CA' ? 'language_french' :
                        language === 'es-ES' ? 'language_spanish' : 'language_english') || 'English'}
                  onOptionSelect={(_e, d) => setLanguage(d.optionValue as string)}
                  style={{ width: 220 }}
                  selectedOptions={[language]}
                >
                  <Option value="en-US">{t('language_english') || 'English'}</Option>
                  <Option value="fr-CA">{t('language_french') || 'French'}</Option>
                  <Option value="es-ES">{t('language_spanish') || 'Spanish'}</Option>
                  <Option value="zh-CN">{t('language_chinese') || 'Chinese'}</Option>
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

            {/* Currency Section */}
            <div className={styles.settingsCard}>
              <div style={{ padding: 24 }}>
                <h3 className={styles.settingsSectionHeader}>{t('currency') || 'Currency'}</h3>
                <p className={styles.settingsSectionDesc}>{t('currency_desc') || 'Select your preferred currency for the app'}</p>
              </div>
              <div style={{ padding: 24, paddingTop: 0 }}>
                <Dropdown
                  value={currency}
                  onOptionSelect={(_e, d) => handleCurrencyChange(d.optionValue as string)}
                  style={{ width: 220 }}
                >
                  {currenciesList.map(({ code, name }) => (
                    <Option key={code} value={code} text={`${code} - ${name}`}>{code} - {name}</Option>
                  ))}
                </Dropdown>
              </div>
            </div>

          </div>

          {/* App Information Section */}
        </main>
      </div>
      <Footer />
    </div>
  );
}