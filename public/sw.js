self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open('danbi').then(function (cache) {
            return cache.add('/');
        }).catch(error => {
            console.error('초기 캐시 설치 실패:', error);
        })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== 'danbi') {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function (e) {
    if (e.request.url.includes('/api/')) {
        return;
    }

    e.respondWith(
        caches.match(e.request)
            .then(function (response) {
                if (response) {
                    return response;
                }

                return fetch(e.request)
                    .then(function (fetchResponse) {
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }

                        const responseToCache = fetchResponse.clone();
                        caches.open('danbi')
                            .then(function (cache) {
                                cache.put(e.request, responseToCache);
                            });

                        return fetchResponse;
                    })
                    .catch(function (error) {
                        console.error('Fetch failed:', error);
                        return caches.match(e.request);
                    });
            })
    );
});

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
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'New Notification', options)
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