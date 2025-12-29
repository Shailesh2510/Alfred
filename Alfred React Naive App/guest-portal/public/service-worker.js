self.addEventListener('push', function (event) {
	const options = {
		body: event.data.text(),
		icon: '/icon.png',
		badge: '/badge.png',
		vibrate: [200, 100, 200],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: 1
		},
		actions: [
			{ action: 'explore', title: 'View Details' },
			{ action: 'close', title: 'Close' }
		]
	}

	event.waitUntil(
		globalThis.registration.showNotification('Alfred App', options)
	)
})
