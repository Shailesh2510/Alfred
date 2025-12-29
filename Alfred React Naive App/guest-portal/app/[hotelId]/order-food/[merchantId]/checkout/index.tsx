import FoodCheckoutContainer from '@/src/screens/orderFood/FoodCheckoutContainer'
import ScrollableContainer from '@components/ui/ScrollableContainer'
import { memo } from 'react'

const FoodCheckoutPage = (): JSX.Element => {
	return (
		<ScrollableContainer>
			<FoodCheckoutContainer />
		</ScrollableContainer>
	)
}

export default memo(FoodCheckoutPage)
