import ScrollableContainer from '@/src/components/ui/ScrollableContainer'
import FoodOrderContainer from '@/src/screens/orderFood/FoodOrderContainer'
import { useRef, memo } from 'react'
import { ScrollView } from 'react-native'

const OrderFoodScreen = (): JSX.Element => {
	const scrollViewReference = useRef<ScrollView>(null)
	return (
		<ScrollableContainer ref={scrollViewReference}>
			<FoodOrderContainer scrollableReference={scrollViewReference} />
		</ScrollableContainer>
	)
}

export default memo(OrderFoodScreen)
