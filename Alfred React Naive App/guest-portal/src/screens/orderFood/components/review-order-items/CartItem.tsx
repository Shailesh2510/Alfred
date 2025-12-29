/* eslint-disable react-native/no-color-literals */
import React from 'react'
import { View } from 'react-native'
import { Text } from '@components/ui/text'
import CustomCounterButton from '@/src/components/ui/CustomCounterButton'

interface CartItemProperties {
	name: string
	price: number
	quantity: number
	modifierOptions?: any[]
	itemExists?: boolean
	onIncrement: () => void
	onDecrement: () => void
}

export const CartItem: React.FC<CartItemProperties> = ({
	name,
	price,
	quantity,
	modifierOptions,
	itemExists,
	onIncrement,
	onDecrement
}) => {
	const getTotalPrice = () => {
		const modifiersTotal =
			modifierOptions?.reduce((sum, option) => sum + (option.price || 0), 0) ||
			0
		const itemTotalWithModifiers = (price + modifiersTotal) * quantity
		return itemTotalWithModifiers.toFixed(2)
	}

	return (
		<View className='py-[16] border-b border-gray-250'>
			<View className='flex-row justify-between items-start'>
				<View className='flex-1'>
					<Text
						variant='h5'
						className={`pb-[8] text-blue-700`}
						style={{
							textDecorationLine: itemExists ? 'none' : 'line-through',
							textDecorationColor: '#022867'
						}}
					>
						{name}
					</Text>
					{modifierOptions?.map((option, index) => (
						<Text
							key={index}
							variant='p2Roman'
							className={`pl-[8] text-gray-700`}
							style={{
								textDecorationLine: itemExists ? 'none' : 'line-through',
								textDecorationColor: '#022867'
							}}
						>
							{`•`} {option.name}
						</Text>
					))}
				</View>
				<View className='flex-row items-center min-w-[120px] justify-end mr-4'>
					<CustomCounterButton
						count={quantity}
						handleIncrease={onIncrement}
						handleDecrease={onDecrement}
						isReviewOrderScreen={true}
						itemExists={itemExists}
					/>

					<View className='w-16 items-end ml-6'>
						<Text
							variant='p2Heavy'
							className='text-blue-700'
							style={{
								textDecorationLine: itemExists ? 'none' : 'line-through',
								textDecorationColor: '#022867'
							}}
						>
							${getTotalPrice()}
						</Text>
					</View>
				</View>
			</View>
		</View>
	)
}
