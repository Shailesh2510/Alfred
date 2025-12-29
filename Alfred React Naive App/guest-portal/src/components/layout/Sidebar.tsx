import { View, Pressable, Dimensions, Animated, Easing } from 'react-native'
import { Link } from 'expo-router'
import { Text } from '@/src/components/ui/text'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import { useEffect, useRef } from 'react'

interface RouteItem {
	label: string
	path: string
}

export function Sidebar(): JSX.Element | null {
	const { currentHotelDetails, openSideBar, setOpenSideBar, carmelMerchantId } =
		useGlobalStore()
	const windowHeight = Dimensions.get('window').height

	// Animation for sliding effect
	const drawerAnimation = useRef(new Animated.Value(-348)).current

	useEffect(() => {
		Animated.timing(drawerAnimation, {
			toValue: openSideBar ? 0 : -348,
			duration: 300,
			easing: Easing.out(Easing.ease),
			useNativeDriver: true
		}).start()
	}, [openSideBar])

	const DRAWER_ITEMS: RouteItem[] = currentHotelDetails
		? [
				{
					label: 'Order Food',
					path: `/${currentHotelDetails.webCode}/order-food`
				},
				...(carmelMerchantId > 0
					? [
							{
								label: 'Airport Transfers',
								path: `/${currentHotelDetails.webCode}/airport-transfer`
							}
						]
					: [])
			]
		: []

	const POLICY_ITEMS: RouteItem[] = [
		{ label: 'Privacy Policy', path: '/privacy-policy' },
		{ label: 'Fulfillment Policy', path: '/fulfillment-policy' },
		{ label: 'Refund Policy', path: '/refund-policy' }
	]

	// If sidebar is closed, don't render it
	if (!openSideBar) return null

	return (
		<>
			{/* Overlay */}
			<Pressable
				className='absolute bg-black bg-opacity-50 z-10'
				onPress={() => setOpenSideBar(false)}
				accessibilityRole='button'
				accessibilityLabel='Close sidebar'
			/>

			{/* Sidebar */}
			<View
				className={`relative  w-[348px] bg-blue-800 z-20 transform transition-transform duration-300 ${
					openSideBar ? 'translate-x-0' : '-translate-x-full'
				}`}
				style={{ height: windowHeight }}
			>
				<View className='flex pt-[100] pl-[40] flex-col'>
					<View>
						{DRAWER_ITEMS.length > 0 && (
							<>
								<View>
									{DRAWER_ITEMS.map((item, index) => (
										<Link key={`drawer-${index}`} href={item.path} asChild>
											<Pressable
												className='pb-[20]'
												onPress={() => setOpenSideBar(false)}
											>
												<Text variant='h1' className='text-white'>
													{item.label}
												</Text>
											</Pressable>
										</Link>
									))}
								</View>
								<View className='pt-[64] opacity-80'>
									{POLICY_ITEMS.map((item, index) => (
										<Link key={`policy-${index}`} href={item.path} asChild>
											<Pressable
												className='pb-[16]'
												onPress={() => setOpenSideBar(false)}
											>
												<Text variant='p2Roman' className='text-white'>
													{item.label}
												</Text>
											</Pressable>
										</Link>
									))}
								</View>
							</>
						)}
					</View>
				</View>
			</View>
		</>
	)
}
