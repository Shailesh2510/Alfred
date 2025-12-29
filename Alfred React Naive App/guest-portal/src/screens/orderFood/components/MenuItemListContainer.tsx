import { View, Pressable, Image } from 'react-native'
import { MenuItem } from '@/src/types/menu-types/menu'
import { Text } from '@components/ui/text'
import { PlusIcon } from '@components/ui/icons/PlusIcon'
import { useCartStore } from '@/src/store/useCartStore'
import { router, useLocalSearchParams } from 'expo-router'
import { formatPrice } from '@/src/utils/validation-utils/formatPrice'
import FallbackImage from '@/src/components/ui/FallbackImage'
import { Tooltip } from 'react-native-paper'

type MenuItemComponentProperties = {
	item: MenuItem
	isLastItem?: boolean
}

const MenuItemListContainer = ({
	item,
	isLastItem = false
}: MenuItemComponentProperties) => {
	const { hotelId, merchantId } = useLocalSearchParams<{
		hotelId: string
		merchantId: string
	}>()

	const { setSelectedMenuItem, selectedFilters } = useCartStore()

	const allTags = item?.tags
		?.replace(/"|}|{/g, '')
		?.split(',')
		?.map(tag => tag.trim())
		?.filter(tag => tag)

	const sortedTags = selectedFilters?.length
		? [
				...selectedFilters,
				...allTags.filter(tag => !selectedFilters.includes(tag))
			]
		: allTags

	const visibleTags = sortedTags?.slice(0, 1) || []

	const additionalTagsCount =
		sortedTags && sortedTags.length > 2 ? sortedTags.length - 2 : 0

	const allTagsText = sortedTags?.join(', ')

	const handleItemClick = (item: MenuItem) => {
		setSelectedMenuItem(item)
		router.push(`/${hotelId}/order-food/${merchantId}/${item.item_id}`)
	}

	return (
		<Pressable
			className={`flex flex-row pt-[20] ${isLastItem ? 'mb-[20]' : ''}`}
			onPress={() => handleItemClick(item)}
		>
			<View className='w-[120] h-[120]'>
				{item.image_url ? (
					<Image
						source={{ uri: item.image_url }}
						className='w-full h-full rounded-lg'
						resizeMode='cover'
					/>
				) : (
					<FallbackImage
						containerStyle={{ borderRadius: 8 }}
						aspectRatio={1}
						logoSize={100}
						showText={false}
					/>
				)}
				<Pressable
					onPress={() => handleItemClick(item)}
					className='absolute bottom-[8] right-[8] bg-white rounded-full p-[10] shadow-sm'
				>
					<PlusIcon width='14' height='14' />
				</Pressable>
			</View>
			<View className='flex-1 h-[120] ml-[16] justify-start'>
				<View>
					<Text
						variant='h2'
						className='font-medium text-blue-800'
						numberOfLines={2}
					>
						{item.item_name}
					</Text>
					<View className='mt-[4]'>
						<Text variant='p2Roman' className='text-gray-700' numberOfLines={2}>
							{item.description}
						</Text>
					</View>
				</View>
				<View className='flex-1 justify-end'>
					<View className='flex flex-row items-center'>
						<Text variant='p2Medium' className='text-blue-700'>
							{formatPrice(item.price)}
						</Text>

						{visibleTags && visibleTags.length > 0 && (
							<View className='flex flex-row ml-[16] gap-[4] items-center'>
								{visibleTags.map((tag: string, index: number) => (
									<View
										key={index}
										className='bg-blue-150 items-center justify-center px-[8] py-[2] rounded-full'
									>
										<Text
											variant='p3'
											className='font-medium text-[11px] text-blue-700 text-center'
										>
											{tag}
										</Text>
									</View>
								))}
								{additionalTagsCount > 0 && (
									<Tooltip
										title={allTagsText}
										enterTouchDelay={50}
										leaveTouchDelay={150}
										theme={{
											colors: { text: '#022867' },
											backgroundColor: 'white'
										}}
									>
										<View className='bg-blue-150 items-center justify-center px-[8] py-[2] rounded-full'>
											<Text
												variant='p3'
												className='text-[11px] text-blue-700 text-center'
											>
												+{additionalTagsCount}
											</Text>
										</View>
									</Tooltip>
								)}
							</View>
						)}
					</View>
				</View>
			</View>
		</Pressable>
	)
}

export default MenuItemListContainer
