// Utility to update subscriptions in the service worker for reminders
export function updateSubscriptionsInServiceWorker(subscriptions: any[]) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'UPDATE_SUBSCRIPTIONS',
      subscriptions
    });
  }
}
