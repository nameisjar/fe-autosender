self.addEventListener('notificationclick', event => {
  event.notification.close();

  const notificationUrl = new URL(
    event.notification.data?.url || '/inbox',
    self.location.origin,
  );
  if (event.action === 'reply') {
    notificationUrl.searchParams.set('notificationAction', 'reply');
  }

  event.waitUntil((async () => {
    const windowClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });
    const client = windowClients.find(item => item.focused)
      || windowClients.find(item => item.visibilityState === 'visible')
      || windowClients[0];

    if (client) {
      client.postMessage({
        type: 'inbox-notification-navigation',
        url: notificationUrl.href,
      });
      await client.focus();
      return;
    }

    await self.clients.openWindow(notificationUrl.href);
  })());
});

