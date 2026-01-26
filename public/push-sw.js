// public/sw.js
self.addEventListener('push', function(event) {
  // 即使json解析失敗也強行彈出一個通知
  let title = "New Alert";
  let body = "You have a new message.";

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      body = data.body || body;
    } catch (e) {
      console.error("JSON parse error, using default text");
    }
  }

  const options = {
    body: body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
