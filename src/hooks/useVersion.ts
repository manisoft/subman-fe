import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../apiClient';

export function useVersion() {
  const [version, setVersion] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [releaseDate, setReleaseDate] = useState<Date|null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/version`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch version');
        return res.json();
      })
      .then(data => {
        setVersion(data.version);
        setReleaseDate(data.release_date ? new Date(data.release_date) : null);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { version, loading, error, releaseDate };
}
