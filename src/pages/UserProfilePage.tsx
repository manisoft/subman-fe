import React, { useState, useEffect, useContext } from 'react';
import { tokens } from '@fluentui/react-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Avatar, Text, Input, Button, Spinner, Label } from '@fluentui/react-components';
import { Save24Regular, ArrowLeft24Regular } from '@fluentui/react-icons';
import { apiRequest } from '../api';
import styles from './UserProfilePage.module.css';
import { LanguageContext } from '../App';

function formatFriendlyDate(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function UserProfilePage({ user, token, onLogout }: { user: any; token: string; onLogout: () => void }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { t } = useContext(LanguageContext);

  // Ensure all user info is initialized from backend
  const createdAt = user?.createdAt ?? '';
  const updatedAt = user?.updatedAt ?? '';

  // Optionally, update state if user prop changes (for SPA navigation)
  React.useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setAvatarUrl(user?.avatarUrl ?? '');
  }, [user]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const updatedUser = { ...user, name, email, avatarUrl: avatarUrl || undefined };
      await apiRequest('/user/profile', 'PUT', {
        name,
        email,
        password: password || undefined,
        avatarUrl: avatarUrl || undefined
      }, token);
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Header user={{ ...user, avatarUrl }} />
      <div className={styles['profile-bg']}>
        <div style={{ width: '100%', maxWidth: 700, margin: '0 auto', padding: '48px 24px 24px 24px', boxSizing: 'border-box' }}>
          <div className={styles['profile-card']}>
            <Avatar
              name={name || email || t('profile_page_title')}
              image={{ src: avatarUrl || undefined }}
              className={styles['profile-avatar']}
              size={128}
            />
            <div className={styles['profile-title']}>
              {name || email || t('profile_page_title')} {t('profile_page_title')}
            </div>
            {createdAt && (
              <div style={{ fontSize: tokens.fontSizeBase200, color: 'var(--fluent-colorNeutralForeground3, #888)', marginBottom: tokens.spacingVerticalXS, marginTop: tokens.spacingVerticalXS, textAlign: 'center' }}>
                {t('member_since')}: {new Date(createdAt).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
              </div>
            )}
            <form className={styles['profile-form']} onSubmit={(e: any) => { e.preventDefault(); handleSave(); }}>
              <Label htmlFor="profile-name">{t('name') || 'Name'}</Label>
              <Input id="profile-name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required />
              <Label htmlFor="profile-email">{t('email') || 'Email'}</Label>
              <Input id="profile-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
              <Label htmlFor="profile-avatar-url">{t('avatar_url') || 'Avatar URL'}</Label>
              <Input id="profile-avatar-url" type="url" value={avatarUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAvatarUrl(e.target.value)} placeholder="https://..." />
              <Label htmlFor="profile-password">{t('new_password') || 'New Password'}</Label>
              <Input id="profile-password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} placeholder={t('leave_blank_password') || 'Leave blank to keep current password'} autoComplete="new-password" />
              <Label htmlFor="profile-confirm-password">{t('confirm_password') || 'Confirm Password'}</Label>
              <Input id="profile-confirm-password" type="password" value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} placeholder={t('repeat_new_password') || 'Repeat new password'} autoComplete="new-password" />
              {success && <Text style={{ color: tokens.colorPaletteGreenForeground1 }}>{t('profile_updated') || success}</Text>}
              {error && <Text style={{ color: tokens.colorPaletteRedForeground1 }}>{error === 'Passwords do not match' ? t('passwords_do_not_match') : (error === 'Error updating profile' ? t('error_updating_profile') : error)}</Text>}
              <div className={styles['profile-form-actions']}>
                <Button appearance="subtle" type="button" onClick={() => window.location.href = '/dashboard'} icon={<ArrowLeft24Regular />}>{t('back') || 'Back'}</Button>
                <Button appearance="primary" type="submit" disabled={loading} icon={loading ? <Spinner size="tiny" /> : <Save24Regular />}>{t('save_changes') || 'Save Changes'}</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
