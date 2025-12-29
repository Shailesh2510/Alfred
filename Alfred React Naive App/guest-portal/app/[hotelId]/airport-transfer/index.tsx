import ScrollableContainer from '@components/ui/ScrollableContainer'
import AirPortTransferContainer from '@screens/airportTransfer/AirPortTransferContainer'
import { memo } from 'react'

const AirportTransferScreen = (): JSX.Element => {
	return (
		<ScrollableContainer>
			<AirPortTransferContainer />
		</ScrollableContainer>
	)
}

export default memo(AirportTransferScreen)
