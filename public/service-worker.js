// eslint-disable-next-line no-restricted-globals
/* eslint-disable */
/*
  Custom service worker for SubMan PWA
  - Sends notifications one day before and on the day of a subscription payment
  - Notification includes image, name, and price
  - Provides offline support and asset precaching via Workbox
*/

// Workbox setup for offline support
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
if (self.workbox) {
  // Clean up outdated caches
  // self.workbox.core.cleanupOutdatedCaches(); // Removed because this function does not exist in your Workbox version
  // Precache all assets generated by your build process
  self.workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
}

// Remove unused CACHE_NAME and SUBS_KEY

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
    // Store subscriptions in IndexedDB instead of localStorage
    saveSubscriptionsToIDB(event.data.subscriptions);
  }
});

// Listen for push events from backend and show notification
self.addEventListener('push', function (event) {
  if (!event.data) return;
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    // fallback for string payloads
    data = { title: 'Notification', body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      data: data.data,
      requireInteraction: data.requireInteraction
    })
  );
});

// Save subscriptions to IndexedDB
function saveSubscriptionsToIDB(subs) {
  if (!('indexedDB' in self)) return;
  const req = indexedDB.open('subman-db', 1);
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains('subscriptions')) {
      db.createObjectStore('subscriptions', { keyPath: 'id' });
    }
  };
  req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction('subscriptions', 'readwrite');
    const store = tx.objectStore('subscriptions');
    if (Array.isArray(subs)) {
      subs.forEach(sub => store.put(sub));
    }
    tx.oncomplete = () => db.close();
  };
}

async function checkAndNotifyPayments() {
  // Only use IndexedDB for subscriptions
  let subs = [];
  try {
    subs = await getSubscriptions();
  } catch (e) {
    // fallback: no subscriptions
    subs = [];
  }
  if (!Array.isArray(subs)) return;

  const now = new Date();
  for (const sub of subs) {
    if (!sub.next_billing_date) continue;
    const payDate = getCurrentNextBillingDateSW(sub.next_billing_date, sub.billing_cycle, now);
    if (!payDate) continue;
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

// Helper: Advance next_billing_date to today or future based on billing_cycle (service worker version)
function getCurrentNextBillingDateSW(rawDate, billingCycle, today = new Date()) {
  if (!rawDate) return null;
  let date = new Date(rawDate);
  if (isNaN(date.getTime())) return null;
  // Normalize to start of day (local)
  date.setHours(0, 0, 0, 0);
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  while (date < startOfToday) {
    switch ((billingCycle || '').toLowerCase().replace(/[-\s]/g, '')) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      default:
        // If unknown, do not advance
        return date;
    }
  }
  return date;
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
