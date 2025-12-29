import RideCheckoutContainer from '@/src/screens/airportTransfer/RideCheckoutContainer'
import ScrollableContainer from '@components/ui/ScrollableContainer'
import { memo } from 'react'

const AirportTransferScreen = (): JSX.Element => {
	return (
		<ScrollableContainer>
			<RideCheckoutContainer />
		</ScrollableContainer>
	)
}

export default memo(AirportTransferScreen)
