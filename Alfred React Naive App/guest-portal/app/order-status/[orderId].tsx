import OrderStatusContainer from '@/src/screens/order-status/OrderStatusContainer'
import ScrollableContainer from '@components/ui/ScrollableContainer'

const OrderStatusScreen = (): JSX.Element => {
	return (
		<ScrollableContainer>
			<OrderStatusContainer />
		</ScrollableContainer>
	)
}

export default OrderStatusScreen
