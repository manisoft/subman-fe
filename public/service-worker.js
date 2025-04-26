/*
  Custom service worker for SubMan PWA
  - Sends notifications one day before and on the day of a subscription payment
  - Notification includes image, name, and price
*/

const CACHE_NAME = 'subman-cache-v1';
const SUBS_KEY = 'subman-subs';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Listen for periodic sync (requires registration in app)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'subman-payment-reminders') {
    event.waitUntil(checkAndNotifyPayments());
  }
});

// Listen for messages from app to update subscription data
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'UPDATE_SUBSCRIPTIONS') {
    self.localStorage.setItem(SUBS_KEY, JSON.stringify(event.data.subscriptions));
  }
});

async function checkAndNotifyPayments() {
  // Try to get subscriptions from IndexedDB or localStorage
  let subs = [];
  try {
    subs = await getSubscriptions();
  } catch (e) {
    // fallback to localStorage
    const raw = self.localStorage.getItem(SUBS_KEY);
    if (raw) subs = JSON.parse(raw);
  }
  if (!Array.isArray(subs)) return;

  const now = new Date();
  for (const sub of subs) {
    if (!sub.next_billing_date) continue;
    const payDate = new Date(sub.next_billing_date);
    const diffDays = Math.floor((payDate - now) / (1000 * 60 * 60 * 24));
    if (diffDays === 1 || diffDays === 0) {
      // Show notification
      self.registration.showNotification(
        diffDays === 1
          ? `Upcoming payment: ${sub.name}`
          : `Payment due today: ${sub.name}`,
        {
          body: `Amount: $${Number(sub.price).toFixed(2)}`,
          icon: sub.logo || '/icon-192x192.png',
          image: sub.logo || undefined,
          tag: `subman-payment-${sub.id}`,
          data: { url: '/subscription/' + sub.id },
          badge: '/badge-72x72.png',
          requireInteraction: true
        }
      );
    }
  }
}

// Utility: get subscriptions from IndexedDB (if available)
function getSubscriptions() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in self)) return reject();
    const req = indexedDB.open('subman-db', 1);
    req.onerror = () => reject();
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('subscriptions', 'readonly');
      const store = tx.objectStore('subscriptions');
      const getAll = store.getAll();
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = () => reject();
    };
    req.onupgradeneeded = () => {
      // fallback if db not found
      resolve([]);
    };
  });
}

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clientsArr => {
        const hadWindow = clientsArr.some(windowClient => {
          if (windowClient.url.includes(event.notification.data.url)) {
            windowClient.focus();
            return true;
          }
          return false;
        });
        if (!hadWindow) self.clients.openWindow(event.notification.data.url);
      })
    );
  }
});
