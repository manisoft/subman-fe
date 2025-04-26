import React from 'react';
import StaticPage from '../components/StaticPage';

export default function AboutUsPage({ user }: { user: any }) {
  return <StaticPage pageId="about" user={user} />;
}
