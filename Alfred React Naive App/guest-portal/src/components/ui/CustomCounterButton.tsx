import { View, TouchableOpacity } from 'react-native'
import { Text } from '@/src/components/ui/text'

interface CustomCounterButton {
	count: number
	handleIncrease: () => void
	handleDecrease: () => void
	isReviewOrderScreen?: boolean
	itemExists?: boolean
}

const CustomCounterButton = ({
	count,
	handleIncrease,
	handleDecrease,
	isReviewOrderScreen = false,
	itemExists = true
}: CustomCounterButton) => {
	return (
		<View className='flex-row w-[80] h-[30] border-2 border-blue-150 bg-white rounded-full ml-[16] justify-between items-center px-[4]'>
			<TouchableOpacity
				onPress={handleDecrease}
				disabled={count === 1 && !isReviewOrderScreen}
				className='w-8 h-8 items-center justify-center'
			>
				<Text
					variant='p2Heavy'
					className={`${count === 1 && !isReviewOrderScreen ? 'text-tabInactiveColor-500' : 'text-blue-700'}`}
				>
					{`\u2013`}
				</Text>
			</TouchableOpacity>

			<Text
				variant='p2Heavy'
				className={`${itemExists ? 'text-blue-700' : 'text-tabInactiveColor-500'}`}
			>
				{count}
			</Text>

			<TouchableOpacity
				onPress={handleIncrease}
				disabled={!itemExists}
				className='w-8 h-8 items-center justify-center'
			>
				<Text
					variant='p2Heavy'
					className={`${itemExists ? 'text-blue-700' : 'text-tabInactiveColor-500'}`}
				>
					{`+`}
				</Text>
			</TouchableOpacity>
		</View>
	)
}

export default CustomCounterButton
