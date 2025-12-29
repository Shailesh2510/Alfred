/* eslint-disable react/display-name */
import {
	NativeScrollEvent,
	NativeSyntheticEvent,
	ScrollView,
	View
} from 'react-native'
import React, { useCallback, useRef } from 'react'
import AppFooter from '../layout/AppFooter'
import { useGlobalStore } from '@/src/store/useGlobalStore'

type ScrollableContainerProperties = {
	children: React.ReactNode
	showFooter?: boolean
	isMainMenuScreen?: boolean
}

const ScrollableContainer = React.forwardRef<
	ScrollView,
	ScrollableContainerProperties
>(
	(
		{ children, showFooter = true, isMainMenuScreen = false },
		reference
	): JSX.Element => {
		const { isUserScrolling, setIsUserScrolling } = useGlobalStore()
		const lastScrollState = useRef(isUserScrolling)

		const handleScroll = useCallback(
			(event: NativeSyntheticEvent<NativeScrollEvent>) => {
				const offsetY = event.nativeEvent.contentOffset.y
				const thresholds = isMainMenuScreen
					? { lower: 570, upper: 570 }
					: { lower: 50, upper: 125 }

				if (offsetY < thresholds.lower && lastScrollState.current) {
					lastScrollState.current = false
					setIsUserScrolling(false)
				} else if (offsetY > thresholds.upper && !lastScrollState.current) {
					lastScrollState.current = true
					setIsUserScrolling(true)
				}
			},
			[isMainMenuScreen, setIsUserScrolling]
		)

		const memoizedContent = React.useMemo(
			() => <View className='flex-1'>{children}</View>,
			[children]
		)

		const footer = showFooter ? <AppFooter /> : null

		return (
			<View className='flex-1'>
				<ScrollView
					ref={reference}
					className='flex-1'
					contentContainerStyle={{ flexGrow: 1 }}
					onScroll={handleScroll}
					scrollEventThrottle={16}
					showsVerticalScrollIndicator={false}
				>
					{memoizedContent}
					{footer}
				</ScrollView>
			</View>
		)
	}
)

export default React.memo(ScrollableContainer)
