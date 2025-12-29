/* eslint-disable unicorn/prefer-global-this */
/* eslint-disable unicorn/prefer-module */
import { Stack } from 'expo-router'
import { PaperProvider } from 'react-native-paper'
import '../global.css'
import { useFonts } from 'expo-font'
import { ThemeProvider } from '@context/theme-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Platform, StatusBar, View } from 'react-native'
import SnackbarComponent from '@/src/components/layout/SnackbarComponent'
import 'react-phone-input-2/lib/high-res.css'
import { useEffect } from 'react'
import { GetInTouchModal } from '@/src/components/modals/GetInTouchModal'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import AppHeader from '@/src/components/layout/AppHeader'

const queryClient = new QueryClient()

const RootLayout = (): JSX.Element | null => {
	const [fontsLoaded] = useFonts({
		'Avenir-Roman': require('../assets/fonts/Avenir-Roman.ttf'),
		'Avenir-Medium': require('../assets/fonts/Avenir-Medium.ttf'),
		'Avenir-Heavy': require('../assets/fonts/Avenir-Heavy.ttf'),
		'TradeGothicNextLTPro-Cn': require('../assets/fonts/TradeGothicNextLTPro-Cn.ttf'),
		'TradeGothicNextLTPro-BdCn': require('../assets/fonts/TradeGothicNextLTPro-BdCn.ttf')
	})

	const { phoneModalVisible } = useGlobalStore()

	// Routes that should show header
	const routesWithHeader = new Set([
		'privacy-policy',
		'fulfillment-policy',
		'refund-policy',
		'airport-transfer/[merchantId]/index',
		'order-status/[orderId]'
	])

	if (!fontsLoaded) {
		return null
	}

	useEffect(() => {
		if (Platform.OS === 'web' && window.location.hostname === 'localhost') {
			const script = document.createElement('script')
			script.src = 'https://unpkg.com/react-scan/dist/auto.global.js'
			document.head.append(script)
		}
	}, [])

	return (
		<View className='flex-1'>
			<QueryClientProvider client={queryClient}>
				<SafeAreaProvider>
					<ThemeProvider>
						<PaperProvider>
							<StatusBar barStyle='default' />
							<View className='flex-1 max-w-[480] overflow-auto justify-center mx-auto w-full h-full'>
								<Stack
									key='rootStack'
									screenOptions={({ route }) => {
										const routeName = route.name.split('?')[0]
										const shouldShowHeader = routesWithHeader.has(routeName)
										return {
											header: shouldShowHeader
												? () => <AppHeader />
												: undefined,
											headerShown: shouldShowHeader
										}
									}}
								/>
								<SnackbarComponent />
								{phoneModalVisible && <GetInTouchModal />}
							</View>
						</PaperProvider>
					</ThemeProvider>
				</SafeAreaProvider>
			</QueryClientProvider>
		</View>
	)
}

export default RootLayout
