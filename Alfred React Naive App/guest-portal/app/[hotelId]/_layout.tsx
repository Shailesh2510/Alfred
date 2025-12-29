import { View } from 'react-native'
import { Stack } from 'expo-router'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import LoadingScreen from '@/src/components/ui/loading-screen'
import AppHeader from '@/src/components/layout/AppHeader'
import SchedulerModal from '@/src/components/modals/SchedulerModal'
import { useEffect } from 'react'
import PaymentInProgressModal from '@/src/components/modals/PaymentInProgressModal'

const HotelLayout = (): JSX.Element => {
	const {
		schedulerModalVisible,
		setRefetchMenuItems,
		setSchedulerModalVisible,
		showLoadingScreen,
		paymentPending,
		showPaymentInProgressModal,
		setShowPaymentInProgressModal
	} = useGlobalStore()

	useEffect(() => {
		if (paymentPending) {
			setShowPaymentInProgressModal(true)
		} else {
			setShowPaymentInProgressModal(false)
		}
	}, [paymentPending, setShowPaymentInProgressModal])

	const routesWithHeader = new Set([
		'index',
		'order-food/index',
		'airport-transfer/index',
		'airport-transfer/[merchantId]/index',
		'concierge/index',
		'concierge/confirmation/index'
	])

	return (
		<View className='flex-1'>
			<Stack
				screenOptions={({ route }) => {
					const routeName = route.name.split('?')[0]
					const shouldShowHeader = routesWithHeader.has(routeName)
					return {
						header: shouldShowHeader ? () => <AppHeader /> : undefined,
						headerShown: shouldShowHeader
					}
				}}
			/>
			{schedulerModalVisible ? (
				<SchedulerModal
					visible={schedulerModalVisible}
					onClose={() => {
						setSchedulerModalVisible(false)
						setRefetchMenuItems(false)
					}}
				/>
			) : null}
			<LoadingScreen visible={showLoadingScreen} />
			<PaymentInProgressModal visible={showPaymentInProgressModal} />
		</View>
	)
}

export default HotelLayout
