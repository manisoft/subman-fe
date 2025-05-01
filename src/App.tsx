import React, { useEffect } from 'react';
import { FluentProvider, webLightTheme, webDarkTheme, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AddEditSubscriptionPage from './pages/AddEditSubscriptionPage';
import UserProfilePage from './pages/UserProfilePage';
import SettingsPage from './pages/SettingsPage';
import ViewAllSubscriptionsPage from './pages/ViewAllSubscriptionsPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminPagesPage from './pages/AdminPagesPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import { subscribeUserToPush, unsubscribeUserFromPush } from './pushNotifications';
import GoogleAnalytics from './GoogleAnalytics';

const useStyles = makeStyles({
  root: {
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.padding('0', '0'),
  },
});

interface AppProps {
  colorMode: 'light' | 'dark';
  setColorMode: (mode: 'light' | 'dark') => void;
}

function App({ colorMode, setColorMode }: AppProps) {
  const classes = useStyles();
  const [token, setToken] = React.useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = React.useState<any>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [pushEnabled, setPushEnabled] = React.useState(false);
  const [pushLoading, setPushLoading] = React.useState(false);

  useEffect(() => {
    setPushEnabled(Notification.permission === 'granted');
  }, []);

  const handleAuth = (t: string, u: any) => {
    setToken(t);
    setUser(u);
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  // Push notification toggling
  const handlePushToggle = async () => {
    if (!token) return;
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeUserFromPush(token);
        setPushEnabled(false);
      } else {
        // Request notification permission first
        let permission = Notification.permission;
        if (permission !== "granted") {
          permission = await Notification.requestPermission();
        }
        if (permission !== "granted") {
          alert("You must allow notifications in your browser to enable push notifications.");
          setPushEnabled(false);
          return;
        }
        const result = await subscribeUserToPush(token);
        if (result && typeof result === 'object' && 'error' in result) {
          alert(result.error);
          setPushEnabled(false);
          return;
        }
        setPushEnabled(true);
        // Auto-refresh to update UI for push enabled
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (e: any) {
      alert(e.message || "Push notification error");
    } finally {
      setPushLoading(false);
    }
  };

  // Check push subscription on mount
  React.useEffect(() => {
    if (!token) return;
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => setPushEnabled(!!sub));
      });
    }
  }, [token]);

  return (
    <div className={classes.root}>
      <Router>
        <GoogleAnalytics />
        <Routes>
          {/* Unauthenticated routes */}
          <Route path="/terms-of-service" element={<TermsOfServicePage user={user} />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage user={user} />} />
          <Route path="/about-us" element={<AboutUsPage user={user} />} />
          <Route path="/contact-us" element={<ContactUsPage user={user} />} />

          {/* Auth flow */}
          <Route path="/auth" element={<AuthPage onAuth={handleAuth} token={token} user={user} />} />
          {/* Authenticated routes */}
          <Route path="/dashboard" element={token ? <DashboardPage token={token} user={user} /> : <Navigate to="/auth" />} />
          <Route path="/subscription/:id?" element={token ? <AddEditSubscriptionPage token={token} user={user} /> : <Navigate to="/auth" />} />
          <Route path="/subscriptions" element={token ? <ViewAllSubscriptionsPage token={token} user={user} /> : <Navigate to="/auth" />} />
          <Route path="/profile" element={token ? <UserProfilePage user={user} token={token} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
          <Route path="/settings" element={token ? <SettingsPage colorMode={colorMode} setColorMode={setColorMode} pushEnabled={pushEnabled} pushLoading={pushLoading} onPushToggle={handlePushToggle} /> : <Navigate to="/auth" />} />
          {/* Admin routes - only for admin users */}
          {token && user?.role === 'admin' && (
            <>
              <Route path="/admin/dashboard" element={<AdminDashboardPage token={token} user={user} onLogout={handleLogout} />} />
              <Route path="/admin/settings" element={<AdminSettingsPage token={token} user={user} onLogout={handleLogout} />} />
              <Route path="/admin/pages" element={<AdminPagesPage token={token} user={user} onLogout={handleLogout} />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage token={token} user={user} onLogout={handleLogout} />} />
            </>
          )}
          {/* Default route: if authenticated go to dashboard, else to auth */}
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/auth"} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
