import React from 'react';
import StaticPage from '../components/StaticPage';

export default function TermsOfServicePage({ user }: { user: any }) {
  return <StaticPage pageId="terms" user={user} />;
}
