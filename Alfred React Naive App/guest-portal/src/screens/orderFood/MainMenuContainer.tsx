/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	View,
	Image,
	ScrollView,
	Pressable,
	ActivityIndicator
} from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import LoadingScreen from '@/src/components/ui/loading-screen'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import { router, useLocalSearchParams } from 'expo-router'
import { useCartStore } from '@/src/store/useCartStore'
import { Text } from '@/src/components/ui/text'
import { MenuItem } from '@/src/types/menu-types/menu'
import MenuItemListContainer from './components/MenuItemListContainer'
import StickyCartButton from './components/review-order-items/StickyCartButton'
import SchedulerClockContainer from './components/SchedulerClockContainer'
import { Ionicons } from '@expo/vector-icons'
import { formatInTimeZone } from 'date-fns-tz'
import useFetchMenuDetails from '@/src/hooks/useFetchMenuDetails'
import { useSnackbarStore } from '@/src/store/useSnackbarStore'
import { SnackbarType } from '@/src/types/others'
import { SearchIcon } from '@/src/components/ui/icons/SearchIcon'
import { FilterIcon } from '@/src/components/ui/icons/FilterIcon'
import { formatPrice } from '@/src/utils/validation-utils/formatPrice'
import useTotalPrice from '@/src/utils/validation-utils/calculateTotalPrice'
import { startCase } from '@/src/lib/utils'
import FallbackImage from '@/src/components/ui/FallbackImage'
import NoMenuModal from '@/src/components/modals/NoMenuModal'
import MenuSearchContainer from './components/MenuSearchContainer'
import FilterModal from '@/src/components/modals/FilterModal'
import { extractMealPeriodId } from './FoodOrderContainer'

type MainMenuContainerProperties = {
	scrollableReference?: React.RefObject<ScrollView>
}

const MainMenuContainer = ({
	scrollableReference
}: MainMenuContainerProperties) => {
	const { hotelId, merchantId } = useLocalSearchParams<{
		hotelId: string
		merchantId: string
	}>()
	const [activeTab, setActiveTab] = useState<string>('')
	const [isFilterModalVisible, setIsFilterModalVisible] = useState(false)
	const [filteredItems, setFilteredItems] = useState<
		Record<string, MenuItem[]>
	>({})
	const {
		showLoadingScreen,
		merchantDetails,
		isUserScrolling,
		selectedMerchantId,
		currentHotelDetails,
		setCurrentHotelAndMerchant,
		setNoMenuModalVisible,
		setSchedulerModalVisible,
		setShowLoadingScreen,
		setSelectedMerchantId,
		setRefetchMenuItems
	} = useGlobalStore()
	const {
		order,
		menuItems,
		setMenuItems,
		isSearchActive,
		setIsSearchActive,
		selectedFilters,
		setSelectedFilters,
		setCurrentMealPeriodId,
		setOrderScheduledDate
	} = useCartStore()
	const { setSnackbarMessage } = useSnackbarStore()
	const categoryReferences = useRef<{ [key: string]: React.RefObject<View> }>(
		{}
	)

	const timezone = currentHotelDetails?.timezone || 'America/New_York'

	const categoryPositions = useRef<{ [key: string]: number }>({})

	const { totalPrice } = useTotalPrice({ items: order.items })

	const { mutate: fetchMenuDetails, isPending } = useFetchMenuDetails({
		onSuccess: (result: any) => {
			if (!result || Object.keys(result).length === 0) {
				setNoMenuModalVisible(true)
				setShowLoadingScreen(false)
				router.replace(`/${hotelId}`)
				return
			}
			setMenuItems(result)
			setSelectedMerchantId(merchantId.toString())
			setCurrentMealPeriodId(extractMealPeriodId(result))
		},
		onError: () => {
			setSnackbarMessage(
				true,
				SnackbarType.ERROR,
				'Failure',
				'Unable to find any menu'
			)
		}
	})

	const allMenuItems = Object.values(menuItems || {}).flat()

	useEffect(() => {
		if (!menuItems) {
			return
		}

		if (selectedFilters.length === 0) {
			setFilteredItems(menuItems)
			return
		}

		const filtered: Record<string, MenuItem[]> = {}

		for (const [category, items] of Object.entries(menuItems)) {
			const filteredCategoryItems = (items as MenuItem[]).filter(
				(item: MenuItem) => {
					let itemTags: string[] = []

					if (item.tags) {
						try {
							if (Array.isArray(item.tags)) {
								itemTags = item.tags
							} else if (typeof item.tags === 'string') {
								try {
									const parsedTags = JSON.parse(item.tags)
									if (Array.isArray(parsedTags)) {
										itemTags = parsedTags
									} else if (typeof parsedTags === 'object') {
										itemTags = Object.keys(parsedTags)
									} else if (typeof parsedTags === 'string') {
										itemTags = parsedTags.includes(',')
											? parsedTags.split(',').map(t => t.trim())
											: [parsedTags]
									}
								} catch {
									itemTags = item.tags.includes(',')
										? item.tags.split(',').map(t => t.trim())
										: [item.tags.trim()]
								}
							}
						} catch {
							if (typeof item.tags === 'string') {
								itemTags = [item.tags]
							}
						}
					}
					const normalizedItemTags = itemTags.map(tag => {
						const cleanTag = tag.trim().replaceAll(/[{}"[\]]/g, '')
						return (
							cleanTag.charAt(0).toUpperCase() + cleanTag.slice(1).toLowerCase()
						)
					})

					return selectedFilters.every(filter =>
						normalizedItemTags.some(
							tag => tag.toLowerCase() === filter.toLowerCase()
						)
					)
				}
			)

			if (filteredCategoryItems.length > 0) {
				filtered[category] = filteredCategoryItems
			}
		}

		setFilteredItems(filtered)
	}, [menuItems, selectedFilters])

	useEffect(() => {
		setCurrentHotelAndMerchant(hotelId, merchantId)
	}, [])

	useEffect(() => {
		setTimeout(() => {
			for (const categoryName of Object.keys(categoryReferences.current)) {
				const reference = categoryReferences.current[categoryName]
				if (reference?.current && scrollableReference?.current) {
					reference.current.measureLayout(
						scrollableReference?.current as any,
						(x, y) => {
							categoryPositions.current[categoryName] = y
						}
					)
				}
			}
		}, 500)
	}, [])

	if (showLoadingScreen) {
		return <LoadingScreen visible={showLoadingScreen} />
	}

	if (isPending) {
		return (
			<View className='flex-1 justify-center items-center h-full'>
				<ActivityIndicator animating={true} color={'#022867'} size={'large'} />
			</View>
		)
	}

	const selectedMerchantDetails = merchantDetails.find(merchant => {
		return merchant.id === +merchantId
	})

	if (!menuItems) {
		const now = new Date()
		const currentTime = formatInTimeZone(now, timezone, 'HH:mm')
		const payload = {
			scheduledDate: formatInTimeZone(now, 'UTC', `yyyy-MM-dd'T'HH:mm:ss.SSSX`),
			scheduledStartTime: currentTime,
			scheduledEndTime: currentTime
		}
		fetchMenuDetails({
			hotelId: currentHotelDetails?.id.toString() ?? '',
			merchantId: merchantId,
			fetchMenuPayload: payload
		})
		setOrderScheduledDate('ASAP')
		return (
			<NoMenuModal
				visible={true}
				onClose={() => {
					setNoMenuModalVisible(false)
					router.back()
				}}
			/>
		)
	}

	const displayedMenuItems =
		selectedFilters.length > 0 ? filteredItems : menuItems

	const menuCategories = (data: Record<string, any[]>) => {
		const categories = new Set<string>()
		for (const items of Object.values(data) as any[]) {
			for (const item of items) {
				categories.add(item.menu_category_name)
			}
		}
		return [...categories]
	}

	for (const categoryName of menuCategories(displayedMenuItems)) {
		if (!categoryReferences.current[categoryName]) {
			categoryReferences.current[categoryName] = React.createRef<View>()
		}
	}

	const handleCategoryClick = (categoryName: string) => {
		if (scrollableReference?.current) {
			const position = categoryPositions.current[categoryName] || 0
			scrollableReference.current.scrollTo({
				x: 0,
				y: position - 2,
				animated: true
			})
		}
	}

	const handleApplyFilters = (filters: string[]) => {
		setSelectedFilters(filters)
	}

	return (
		<View>
			{isSearchActive ? (
				<MenuSearchContainer />
			) : (
				<View className='flex-1'>
					{isUserScrolling ? (
						<View
							className='sticky top-0 left-0 right-0 bg-gray-850 z-10 p-[10]'
							style={{ elevation: 5 }}
						>
							<View className='flex-row items-center gap-[12]'>
								<Pressable
									onPress={() => router.back()}
									className='bg-blue-500 rounded-full h-[30] w-[30] items-center justify-center '
								>
									<Ionicons name='arrow-back' size={24} color='white' />
								</Pressable>
								<ScrollView horizontal showsHorizontalScrollIndicator={false}>
									{menuCategories(displayedMenuItems).map((category, index) => {
										if (!activeTab && index === 0) {
											setActiveTab(category)
										}
										const isActive = category === activeTab
										return (
											<Pressable
												key={category}
												onPress={() => {
													setActiveTab(category)
													handleCategoryClick(category)
												}}
												className={`flex-row items-center justify-center p-[12] border-b-2 ${
													isActive ? 'border-blue-500' : 'border-gray-250'
												}`}
											>
												<Text
													variant='p2Roman'
													className={`font-medium text-[13px] ${
														isActive ? 'text-blue-500' : 'text-gray-700'
													} text-center`}
												>
													{startCase(category.toLowerCase())}
												</Text>
											</Pressable>
										)
									})}
								</ScrollView>
							</View>
						</View>
					) : null}
					<ScrollView className='flex-1'>
						<View className='relative'>
							{selectedMerchantDetails?.cover_image_url ? (
								<Image
									source={{ uri: selectedMerchantDetails.cover_image_url }}
									className='aspect-[395/180]'
									resizeMode='cover'
								/>
							) : (
								<FallbackImage
									aspectRatio={395 / 180}
									logoSize={80}
									textSize='large'
								/>
							)}
							<View className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent' />
							<Pressable
								onPress={() => router.back()}
								className='absolute h-[44] w-[44] left-[8] top-[45] bg-blue-500 rounded-full items-center justify-center'
							>
								<Ionicons name='arrow-back' size={24} color='white' />
							</Pressable>
						</View>
						<View
							className={
								'-mt-[20px] flex-1 p-[12] rounded-tr-[24] rounded-tl-[24] bg-white'
							}
						>
							<View className='absolute -top-12 right-[40]'>
								{selectedMerchantDetails?.image_url ? (
									<Image
										source={{ uri: selectedMerchantDetails.image_url }}
										className='w-[80] h-[80] rounded-lg'
										resizeMode='cover'
									/>
								) : (
									<FallbackImage
										containerStyle={{ width: 80, height: 80, borderRadius: 8 }}
										logoSize={60}
										showText={false}
									/>
								)}
							</View>
							<View className='pl-[10] mt-[20] '>
								<View className='mb-[12]'>
									<Text
										variant='h1'
										className='text-blue-700 mb-[8]'
										numberOfLines={2}
										style={{ maxWidth: '75%' }}
									>
										{selectedMerchantDetails?.name}
									</Text>
									<Text
										variant='p2Roman'
										className='text-gray-700'
										numberOfLines={2}
									>
										{selectedMerchantDetails?.description}
									</Text>
								</View>
								<View>
									<Text variant='p2Roman' className='text-blue-700'>
										{`Delivery estimate: `}
										{selectedMerchantDetails?.eta} {`min`}
									</Text>
								</View>

								<View className='flex-row items-center'>
									<SchedulerClockContainer
										scrollableRef={scrollableReference}
										timeSlot={
											order.scheduledDate === 'ASAP'
												? 'ASAP'
												: formatInTimeZone(
														order.scheduledDate,
														currentHotelDetails?.timezone ?? 'America/New_York',
														'M/d/yy - h:mm a'
													)
										}
										onPress={() => {
											setSchedulerModalVisible(true)
											setRefetchMenuItems(true)
										}}
										backgroundColor='bg-white'
									/>
								</View>
							</View>
							<View>
								<View className='flex-row items-center justify-between mx-[8]'>
									<Pressable
										onPress={() => setIsSearchActive(true)}
										className='flex-1 flex-row items-center bg-gray-250 rounded-full px-3 py-3'
									>
										<SearchIcon width='24' height='24' color='#748095' />
										<Text
											variant='p2Roman'
											className='text-gray-700 ml-[4]'
											numberOfLines={1}
										>
											{`Search ${selectedMerchantDetails?.name || 'Menu'}`}
										</Text>
									</Pressable>

									<Pressable
										onPress={() => setIsFilterModalVisible(true)}
										className='ml-[20] relative'
									>
										<FilterIcon width='24' height='24' color='#022867' />
										{selectedFilters.length > 0 && (
											<View className='absolute -top-1 -right-1 w-[10] h-[10] bg-orange-500 rounded-full' />
										)}
									</Pressable>
								</View>
							</View>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								className='pt-[12]'
							>
								{menuCategories(displayedMenuItems).map((category, index) => {
									if (!activeTab && index === 0) {
										setActiveTab(category)
									}
									const isActive = category === activeTab
									return (
										<Pressable
											key={category}
											onPress={() => {
												setActiveTab(category)
												handleCategoryClick(category)
											}}
											className={`flex-row items-center justify-center p-[12] border-b-2 ${
												isActive ? 'border-blue-500' : 'border-gray-250'
											}`}
											style={{ flexShrink: 0 }}
										>
											<Text
												variant='p2Roman'
												className={`font-medium text-[13px] ${
													isActive ? 'text-blue-500' : 'text-gray-700'
												} text-center`}
											>
												{startCase(category.toLowerCase())}
											</Text>
										</Pressable>
									)
								})}
							</ScrollView>
							<View>
								{Object.values(displayedMenuItems).length > 0 ? (
									(Object.values(displayedMenuItems) as MenuItem[][]).map(
										(items, categoryIndex, allCategories) => {
											const isLastCategory =
												categoryIndex === allCategories.length - 1

											return (
												<View
													className='w-full px-[12]'
													key={categoryIndex}
													ref={
														categoryReferences.current[
															items[0]?.menu_category_name
														]
													}
												>
													<Text variant='p1' className='text-blue-700 pt-[20]'>
														{startCase(
															items[0].menu_category_name.toLowerCase()
														)}
													</Text>
													{items.map(
														(item: MenuItem, itemIndex, categoryItems) => {
															const isLastItem =
																itemIndex === categoryItems.length - 1

															return (
																<MenuItemListContainer
																	item={item}
																	key={itemIndex}
																	isLastItem={isLastItem && isLastCategory}
																/>
															)
														}
													)}
												</View>
											)
										}
									)
								) : (
									<View className='items-center bg-white px-4 py-8 mt-4'>
										<Text
											variant='p1'
											className='text-center text-gray-700 mb-2'
										>
											{`No products match your current filters.`}
										</Text>
										<Text
											variant='p2Roman'
											className='text-center text-gray-500 mb-6'
										>
											{`Try adjusting or resetting them to see more options.`}
										</Text>
										<Pressable
											onPress={() => {
												setSelectedFilters([])
												setFilteredItems(menuItems)
											}}
											className='bg-blue-700 py-3 px-6 rounded-full'
										>
											<Text variant='p2Heavy' className='text-white'>
												{`Clear Filters`}
											</Text>
										</Pressable>
									</View>
								)}
							</View>
						</View>
					</ScrollView>
					<FilterModal
						visible={isFilterModalVisible}
						onClose={() => setIsFilterModalVisible(false)}
						onApplyFilters={handleApplyFilters}
						menuItems={allMenuItems as MenuItem[]}
						initialFilters={selectedFilters}
					/>
					<StickyCartButton
						itemCount={order?.items?.reduce(
							(sum: any, item: any) => sum + item.quantity,
							0
						)}
						price={formatPrice(totalPrice)}
						text={
							order.items.length === 0 ? 'No items selected' : 'Review Order'
						}
						disabled={order.items.length === 0}
						onPress={() => {
							router.push(
								`/${hotelId}/order-food/${selectedMerchantId}/review-order/`
							)
						}}
					/>
				</View>
			)}
		</View>
	)
}

export default MainMenuContainer
