const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export async function fetchPage(pageId: string) {
  const url = API_BASE_URL
    ? `${API_BASE_URL}/api/pages/${pageId}`
    : `/api/pages/${pageId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch page');
  }
  return await response.json();
}
