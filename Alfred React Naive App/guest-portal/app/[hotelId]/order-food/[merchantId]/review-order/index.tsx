import ScrollableContainer from '@components/ui/ScrollableContainer'
import { ReviewOrderScreen } from '@/src/screens/orderFood/components/ReviewOrderScreen'
import { memo } from 'react'

const ReviewOrder = (): JSX.Element => {
	return (
		<ScrollableContainer>
			<ReviewOrderScreen />
		</ScrollableContainer>
	)
}

export default memo(ReviewOrder)
