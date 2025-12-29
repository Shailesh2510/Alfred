import React, { useEffect } from 'react'
import { View, Text, Button, Platform } from 'react-native'
import * as Notifications from 'expo-notifications'

const requestWebPushPermission = async () => {
	if (Notification.permission !== 'granted') {
		const permission = await Notification.requestPermission()
		if (permission !== 'granted') {
			console.log('Push notification permission denied!')
		}
	}
}

// Handle notification behavior
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true
	})
})

// Trigger notification
const triggerNotification = async () => {
	if (Platform.OS === 'web') {
		console.log('triggerNotification on web')
		// Simulate push notification for web
		if ('serviceWorker' in navigator && Notification.permission === 'granted') {
			navigator.serviceWorker.ready.then(registration => {
				registration.showNotification('Welcome to Alfred 🥞', {
					body: "Let's order some food!"
				})
			})
		}
	} else {
		console.log('triggerNotification from android')
		await Notifications.scheduleNotificationAsync({
			content: {
				title: 'Welcome to Alfred 🥞',
				body: "Let's order some food!",
				sound: 'default'
			},
			trigger: null // Trigger immediately
		})
	}
}

// Register for push notifications
const registerForPushNotificationsAsync = async () => {
	if (Platform.OS === 'web') {
		await requestWebPushPermission()
		console.log('Web Push notifications permission granted')
	} else {
		const token = await Notifications.getExpoPushTokenAsync()
		console.log('Expo Push Token:', token.data)
	}
}

const Sandbox = () => {
	// useEffect(() => {
	// 	registerForPushNotificationsAsync()
	// }, [])

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Text>Sandbox</Text>
			<Button title='Send Notification' onPress={triggerNotification} />
		</View>
	)
}

export default Sandbox
