import React, { useEffect, useState } from 'react';
import { Spinner, Text } from '@fluentui/react-components';
import Header from './Header';
import { fetchPage } from '../apiClient';
import Footer from './Footer';
import styles from './StaticPage.module.css';

interface PageData {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export default function StaticPage({ pageId, user }: { pageId: string, user: any }) {
  const [data, setData] = useState<PageData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchPage(pageId)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [pageId]);

  return (
    <div className={styles.staticPageRoot}>
      <Header user={user} />
      <main className={styles.staticPageMain}>
        <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
          {loading ? <Spinner size="large" /> : error ? (
            <Text style={{ color: 'red' }}>{error}</Text>
          ) : data ? (
            <>
              <h1>{data.title}</h1>
              <div dangerouslySetInnerHTML={{ __html: data.content }} />
              {(data.created_at || data.updated_at) && (
                <div style={{ marginTop: 32, color: '#888', fontSize: 14 }}>
                  {data.created_at && (
                    <span>Created: {new Date(data.created_at).toLocaleString()} </span>
                  )}
                  {data.updated_at && (
                    <span style={{ marginLeft: 16 }}>Last updated: {new Date(data.updated_at).toLocaleString()}</span>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
