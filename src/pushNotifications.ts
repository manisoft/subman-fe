// src/pushNotifications.ts
// Utility for registering and unregistering push notifications with backend

import { apiRequest } from './api';

export async function subscribeUserToPush(token: string) {
  if (!('serviceWorker' in navigator)) throw new Error('Service workers not supported');
  if (!('PushManager' in window)) throw new Error('Push notifications not supported');

  const reg = await navigator.serviceWorker.ready;
  // You should use your own VAPID public key here (for demo, left blank)
  const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || '';
  if (!vapidPublicKey) throw new Error('VAPID public key not set');

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  // Register with backend
  await apiRequest('/push/subscribe', 'POST', subscription, token);
  return subscription;
}

export async function unsubscribeUserFromPush(token: string) {
  const reg = await navigator.serviceWorker.ready;
  const subscription = await reg.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    await apiRequest('/push/unsubscribe', 'POST', { endpoint: subscription.endpoint }, token);
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
