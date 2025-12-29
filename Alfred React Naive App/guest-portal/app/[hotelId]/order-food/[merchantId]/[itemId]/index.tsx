import MenuItemDetailsContainer from '@/src/screens/orderFood/components/MenuItemDetailsContainer'
import ScrollableContainer from '@components/ui/ScrollableContainer'
import { memo } from 'react'

const MenuItemDetailsScreen = (): JSX.Element => {
	return (
		<ScrollableContainer>
			<MenuItemDetailsContainer />
		</ScrollableContainer>
	)
}

export default memo(MenuItemDetailsScreen)
