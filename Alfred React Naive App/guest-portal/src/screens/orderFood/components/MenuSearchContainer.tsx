import { ActivityIndicator, Pressable, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import MenuItemListContainer from './MenuItemListContainer'
import { MenuItem } from '@/src/types/menu-types/menu'
import { useCartStore } from '@/src/store/useCartStore'
import { Text } from '@/src/components/ui/text'
import { SearchIcon } from '@/src/components/ui/icons/SearchIcon'
import { CloseIcon } from '@/src/components/ui/icons/CloseIcon'
import CustomSearchTextInput from '@/src/components/ui/CustomSearchTextInput'

const MenuSearchContainer = () => {
	const [searchResults, setSearchResults] = useState<MenuItem[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const { menuItems, searchText, setSearchText, setIsSearchActive } =
		useCartStore()

	const allMenuItems = Object.values(menuItems || {}).flat()

	useEffect(() => {
		if (searchText.trim() === '') {
			setSearchResults([])
			setIsSearching(false)
			return
		}

		setIsSearching(true)
		const timer = setTimeout(() => {
			const results = allMenuItems.filter(
				item =>
					(item as MenuItem).item_name
						.toLowerCase()
						.includes(searchText.toLowerCase()) ||
					(item as MenuItem).description
						.toLowerCase()
						.includes(searchText.toLowerCase())
			)
			setSearchResults(results as MenuItem[])
			setIsSearching(false)
		}, 300)

		return () => clearTimeout(timer)
	}, [searchText, menuItems])

	const renderSearchResults = () => {
		if (isSearching) {
			return (
				<View className='flex-auto justify-center items-center my-[24]'>
					<ActivityIndicator size='large' color='#022867' />
				</View>
			)
		}

		if (searchText.trim() !== '' && searchResults.length === 0) {
			return (
				<View className='p-4'>
					<Text variant='p3' className='text-[#787878]'>
						No items match your search
					</Text>
				</View>
			)
		}

		return (
			<View className='p-4'>
				{searchResults.map((item, index) => (
					<MenuItemListContainer
						key={`${item.item_id}-${index}`}
						item={item}
						isLastItem={index === searchResults.length - 1}
					/>
				))}
			</View>
		)
	}

	return (
		<View className='flex-1'>
			<View className='bg-white'>
				<View className='flex-row items-center justify-between gap-4 px-[10] py-[10]'>
					<View className='flex-1 flex-row items-center border border-gray-500 bg-white rounded-full px-[10]'>
						<SearchIcon width='20' height='20' color='#748095' />
						<View className='flex-1'>
							<CustomSearchTextInput
								placeHolder='Search for products'
								value={searchText}
								onChangeText={e => setSearchText(e.nativeEvent.text)}
								disabled={false}
							/>
						</View>
					</View>
					<Pressable
						onPress={() => {
							setSearchText('')
							setIsSearchActive(false)
						}}
					>
						<CloseIcon width='20' height='20' />
					</Pressable>
				</View>
			</View>

			<View className='flex-1 bg-gray-300'>{renderSearchResults()}</View>
		</View>
	)
}

export default MenuSearchContainer
