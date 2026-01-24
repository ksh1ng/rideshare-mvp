// public/sw.js

// 1. 監聽推播事件
self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'You have a new ride request!',
        icon: '/icons/icon-192x192.png', // 請確保您有此圖標
        badge: '/icons/badge-72x72.png', // Android 狀態列的小圖標
        vibrate: [100, 50, 100],
        data: {
          url: data.url || '/rides' // 點擊後要跳轉的網址
        },
        actions: [
          { action: 'view', title: 'View Request' },
          { action: 'close', title: 'Close' }
        ]
      };

      event.waitUntil(
        self.registration.showNotification(data.title || 'RideShare Alert', options)
      );
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }
});

// 2. 監聽通知點擊事件
self.addEventListener('notificationclick', function (event) {
  event.notification.close(); // 點擊後關閉通知

  // 如果點擊的是 "Close" 按鈕則直接返回
  if (event.action === 'close') return;

  // 取得通知內建的跳轉網址
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // 如果已經有開啟的視窗，就聚焦在那上面
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // 如果沒開啟視窗，就打開一個新的
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
