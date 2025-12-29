import MainMenuContainer from '@/src/screens/orderFood/MainMenuContainer'
import ScrollableContainer from '@components/ui/ScrollableContainer'
import { useRef, memo } from 'react'
import { ScrollView } from 'react-native'

const MainMenuScreen = (): JSX.Element => {
	const scrollViewReference = useRef<ScrollView>(null)
	return (
		<ScrollableContainer ref={scrollViewReference} isMainMenuScreen={true}>
			<MainMenuContainer scrollableReference={scrollViewReference} />
		</ScrollableContainer>
	)
}

export default memo(MainMenuScreen)
