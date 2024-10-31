let notificationTimer = null;  // 타이머를 저장할 전역 변수

self.addEventListener('push', function (event) {
    if (!event.data) {
        console.log('Push event but no data');
        return;
    }

    try {
        const data = event.data.json();
        const options = {
            body: data.body || 'New message',
            icon: `images/${data.icon.slice(1)}.png` || 'svgs/icon.svg',
            badge: data.badge || `images/colorIcon.png`,
            tag: data.tag,
            data: {
                url: data.url
            },
            requireInteraction: false,
        };

        if (notificationTimer) {
            clearTimeout(notificationTimer);
        }

        event.waitUntil(
            self.registration.getNotifications()
                .then(notifications => {
                    notifications.forEach(notification => notification.close());
                    return self.registration.showNotification(data.title || 'New Notification', options)
                        .then(() => {
                            notificationTimer = setTimeout(() => {
                                self.registration.getNotifications().then(notifications => {
                                    notifications.forEach(notification => notification.close());
                                });
                                notificationTimer = null;
                            }, 5000);
                        });
                })
        );
    } catch (err) {
        console.error('Error showing notification:', err);
    }
});

self.addEventListener('notificationclick', function (event) {
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
            .then(() => {
                event.notification.close();
            })
            .catch((error) => {
                console.error('Failed to open window:', error);
                event.notification.close();
            })
    );
});