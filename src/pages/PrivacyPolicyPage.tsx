import React from 'react';
import StaticPage from '../components/StaticPage';

export default function PrivacyPolicyPage({ user }: { user: any }) {
  return <StaticPage pageId="privacy" user={user} />;
}
