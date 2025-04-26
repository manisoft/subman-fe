// src/api.ts
// Utility for making API requests to the backend

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

export async function apiRequest<T>(
  endpoint: string,
  method: string = 'GET',
  data?: any,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'API error');
  }
  return res.json();
}

// Example: login
export async function login(email: string, password: string) {
  return apiRequest<{ token: string; user: any }>('/auth/login', 'POST', { email, password });
}

// Example: register
export async function register(email: string, password: string, name: string) {
  return apiRequest<{ message: string }>('/auth/register', 'POST', { email, password, name });
}

// Example: get subscriptions
export async function getSubscriptions(token: string) {
  return apiRequest<any[]>('/subscriptions', 'GET', undefined, token);
}

// Add more API utilities as needed (CRUD, categories, push, etc.)
