import { View, Image, Pressable } from 'react-native'
import React, { useEffect } from 'react'
import { Text } from '@/src/components/ui/text'
import { useCartStore } from '@/src/store/useCartStore'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import StickyCartButton from './review-order-items/StickyCartButton'
import CustomCounterButton from '@/src/components/ui/CustomCounterButton'
import { v4 as uuidv4 } from 'uuid'
import { RadioButton } from 'react-native-paper'
import { formatPrice } from '@/src/utils/validation-utils/formatPrice'
import CheckboxGroup from '@/src/components/ui/CustomCheckBoxGroup'
import useTotalPrice from '@/src/utils/validation-utils/calculateTotalPrice'
import FallbackImage from '@/src/components/ui/FallbackImage'
import LoadingScreen from '@/src/components/ui/loading-screen'
import { useGlobalStore } from '@/src/store/useGlobalStore'

const MenuItemDetailsContainer = () => {
	const { hotelId } = useLocalSearchParams<{ hotelId: string }>()
	const { showLoadingScreen, setCurrentHotelId } = useGlobalStore()

	const {
		selectedMenuItem,
		addTemporaryItem,
		temporaryItem,
		addTemporaryItemModifierOption,
		resetTemporaryItem,
		changeTemporaryItemQuantity,
		addOrderItem
	} = useCartStore()

	const { totalPrice } = useTotalPrice({ items: [temporaryItem] })

	const parsedTags = selectedMenuItem?.tags
		?.replace(/"|}|{/g, '')
		?.split(',')
		?.filter((tag: any) => tag)

	const requiredModifierIds: any[] = []
	for (const modifier of selectedMenuItem?.modifiers || []) {
		if (modifier.required_options) {
			requiredModifierIds.push(modifier.id)
		}
	}

	const selectedModifierIds: any[] = []
	for (const modifier of temporaryItem?.modifiers || []) {
		if (modifier.options.length > 0) {
			selectedModifierIds.push(modifier.id)
		}
	}

	let buttonEnabled = true
	for (const modifierId of requiredModifierIds) {
		if (!selectedModifierIds.includes(modifierId)) {
			buttonEnabled = false
			break
		}
	}

	const handleChange = (modifierOptionIds: any, modifier: any) => {
		const options: any[] = []
		for (const modifierOptionId of modifierOptionIds) {
			const parsedId = Number.parseInt(modifierOptionId)
			let option = null
			for (const moduleOption of modifier?.options || []) {
				if (moduleOption.id === parsedId) {
					option = moduleOption
					break
				}
			}

			if (option) {
				options.push({
					quantity: 1,
					id: parsedId,
					name: option.name,
					price: option.price
				})
			}
		}

		addTemporaryItemModifierOption({
			id: modifier?.id,
			options
		})
	}

	useEffect(() => {
		if (selectedMenuItem) {
			addTemporaryItem({
				quantity: 1,
				modifiers: [],
				id: selectedMenuItem?.item_id,
				name: selectedMenuItem?.item_name,
				cartItemId: uuidv4(),
				cartItemTime: new Date(),
				imageUrl: selectedMenuItem?.image_url,
				price: Number.parseFloat(selectedMenuItem?.price),
				tags: parsedTags,
				mealPeriodId: selectedMenuItem?.meal_period_id,
				mealPeriodStartHour: selectedMenuItem?.meal_period_start_hour,
				mealPeriodEndHour: selectedMenuItem?.meal_period_end_hour,
				itemExists: true
			})
		}
	}, [selectedMenuItem])

	useEffect(() => {
		setCurrentHotelId(hotelId)
	}, [])

	if (showLoadingScreen) {
		return <LoadingScreen visible={showLoadingScreen} />
	}

	return (
		<View className='flex-1'>
			<View className='sticky top-0 left-0 right-0 bg-white z-10 '>
				<View className='bg-white px-[20] flex-row items-center justify-between shadow-sm'>
					<Pressable onPress={() => router.back()}>
						<Ionicons
							name='arrow-back-circle'
							size={30}
							className='text-blue-500'
						/>
					</Pressable>
					<View className='flex-1 py-[12]'>
						<Text variant='h5' className='text-blue-700 text-center'>
							{`Item Details`}
						</Text>
					</View>
					<View className='w-[30]' />
				</View>
			</View>
			<View className='flex-1'>
				{selectedMenuItem?.image_url ? (
					<Image
						source={{ uri: selectedMenuItem.image_url }}
						className='aspect-[414/276]'
						resizeMode='cover'
					/>
				) : (
					<FallbackImage
						aspectRatio={414 / 276}
						textSize='large'
						logoSize={100}
						containerStyle={{ width: '100%' }}
					/>
				)}
				<View className={'flex-1 bg-gray-300 px-[20] py-[20]'}>
					<View className='flex-row justify-between pb-[10]  border-b-2 border-gray-250'>
						<View className='flex-1 '>
							<Text variant='h1' className='text-blue-700'>
								{selectedMenuItem?.item_name}
							</Text>
							<View className='mt-[12]'>
								<Text variant='p2Roman' className='text-gray-700'>
									{selectedMenuItem?.description}
								</Text>
							</View>
							{parsedTags && parsedTags.length > 0 && (
								<View className='flex-row flex-wrap mt-[12] gap-[4]'>
									{parsedTags.map((tag: string, index: number) => (
										<View
											key={index}
											className='bg-blue-150 items-center justify-center px-[8] py-[2] rounded-full'
										>
											<Text
												variant='p3'
												className='text-[11px] text-blue-700 text-center'
											>
												{tag.trim()}
											</Text>
										</View>
									))}
								</View>
							)}
						</View>
						<View>
							<Text variant='h1' className='text-blue-700'>
								{formatPrice(selectedMenuItem?.price ?? '')}
							</Text>
						</View>
					</View>
					<View className='flex-row border-b-2 border-gray-250 py-[10] items-center'>
						<Text variant='h5' className='text-blue-700 '>
							{`Quantity`}
						</Text>
						<CustomCounterButton
							count={temporaryItem?.quantity}
							handleDecrease={() =>
								changeTemporaryItemQuantity(temporaryItem?.quantity - 1)
							}
							handleIncrease={() =>
								changeTemporaryItemQuantity(temporaryItem?.quantity + 1)
							}
						/>
					</View>
					<View className='flex-1  '>
						{selectedMenuItem?.modifiers &&
						selectedMenuItem.modifiers.length > 0 ? (
							<View className='flex-1'>
								{selectedMenuItem.modifiers.map((modifier, index) => {
									return (
										<View
											key={index}
											className='flex-auto border-b-2 border-gray-250 py-[10]'
										>
											<Text variant='h5' className='text-blue-700'>
												{modifier?.name}
												{` (${modifier.required_options ? 'required' : 'optional'})`}
											</Text>
											{modifier?.multiple_options ? (
												<CheckboxGroup
													modifier={modifier}
													onChange={(modifierOptionIds: any) => {
														if (
															modifier.free_modifier_count <=
															modifier?.free_modifier_count
														) {
															handleChange(modifierOptionIds, modifier)
														}
													}}
												/>
											) : (
												<RadioButton.Group
													onValueChange={modifierOptionId => {
														const selectedOption = modifier?.options?.find(
															option =>
																option.id === Number.parseInt(modifierOptionId)
														)

														addTemporaryItemModifierOption({
															id: modifier?.id,
															options: [
																{
																	quantity: 1,
																	id: Number.parseInt(modifierOptionId),
																	name: selectedOption?.name,
																	price: selectedOption?.price
																}
															]
														})
													}}
													value={temporaryItem?.modifiers
														?.find(
															(modifierItem: any) =>
																modifierItem.id === modifier?.id
														)
														?.options?.[0]?.id?.toString()}
												>
													{modifier?.options?.map(
														(modifierOption: any, index) => (
															<Pressable
																className='flex-row items-center m-[0] p-[0]'
																key={index}
															>
																<RadioButton
																	value={modifierOption?.id?.toString()}
																	color='#2454A4'
																/>
																<Text
																	variant='p2Medium'
																	className='text-primary-950 pl-[4]'
																>
																	{modifierOption?.name}
																	{modifierOption?.price
																		? ` (+${formatPrice(modifierOption?.price)})`
																		: null}
																</Text>
															</Pressable>
														)
													)}
												</RadioButton.Group>
											)}
										</View>
									)
								})}
							</View>
						) : null}
					</View>
				</View>
			</View>
			<StickyCartButton
				itemCount={temporaryItem?.quantity}
				price={formatPrice(totalPrice)}
				disabled={!buttonEnabled}
				text={buttonEnabled ? 'Add to Order' : 'Make Required Selections'}
				onPress={() => {
					addOrderItem(temporaryItem)
					router.back()
				}}
			/>
		</View>
	)
}

export default MenuItemDetailsContainer
