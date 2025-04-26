// Registers periodic background sync for payment reminders if supported
export async function registerPeriodicSync() {
  if ('serviceWorker' in navigator && 'periodicSync' in (navigator.serviceWorker as any)) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // Check permission
      const status = await (navigator as any).permissions.query({ name: 'periodic-background-sync' });
      if (status.state === 'granted') {
        await (registration as any).periodicSync.register('subman-payment-reminders', {
          minInterval: 24 * 60 * 60 * 1000 // 1 day
        });
        return true;
      }
    } catch (e) {
      // Fallback or log error
      // Could show a message to user if needed
    }
  }
  return false;
}
