import { useState, useEffect } from 'react'
import {
	View,
	Modal,
	Pressable,
	ScrollView,
	TextInput,
	Keyboard,
	ActivityIndicator
} from 'react-native'
import { MenuItem } from '@/src/types/menu-types/menu'
import { Text } from '@/src/components/ui/text'
import MenuItemListContainer from '@screens/orderFood/components/MenuItemListContainer'
import { SearchIcon } from '@/src/components/ui/icons/SearchIcon'
import { CloseIcon } from '../ui/icons/CloseIcon'

type SearchModalProperties = {
	visible: boolean
	onClose: () => void
	menuItems: Record<string, MenuItem[]>
}

const SearchModal = ({
	visible,
	onClose,
	menuItems
}: SearchModalProperties) => {
	const [searchText, setSearchText] = useState('')
	const [searchResults, setSearchResults] = useState<MenuItem[]>([])
	const [isSearching, setIsSearching] = useState(false)

	const allMenuItems = Object.values(menuItems || {}).flat()

	useEffect(() => {
		if (searchText.trim() === '') {
			setSearchResults([])
			return
		}

		setIsSearching(true)
		const timer = setTimeout(() => {
			const results = allMenuItems.filter(
				item =>
					item.item_name.toLowerCase().includes(searchText.toLowerCase()) ||
					item.description.toLowerCase().includes(searchText.toLowerCase())
			)
			setSearchResults(results)
			setIsSearching(false)
		}, 300)

		return () => clearTimeout(timer)
	}, [searchText, menuItems])

	const handleClose = () => {
		setSearchText('')
		setSearchResults([])
		Keyboard.dismiss()
		onClose()
	}
	const renderContent = () => {
		if (isSearching) {
			return (
				<View className='flex-1 bg-gray-300 justify-center items-center'>
					<ActivityIndicator size='large' color='#022867' />
				</View>
			)
		}

		if (searchText.trim() !== '' && searchResults.length === 0) {
			return (
				<View className='p-4'>
					<Text variant='p3' className='text-gray-250'>
						{`No items match your search`}
					</Text>
				</View>
			)
		}

		return (
			<ScrollView className='flex-1 bg-gray-300'>
				<View className='p-4'>
					{searchResults.map((item, index) => (
						<MenuItemListContainer
							key={`${item.item_id}-${index}`}
							item={item}
						/>
					))}
				</View>
			</ScrollView>
		)
	}

	return (
		<Modal
			animationType='slide'
			transparent={true}
			visible={visible}
			onRequestClose={handleClose}
		>
			<View className='flex-1 bg-white'>
				<View className='flex-row items-center bg-white m-4 rounded-xl px-4 py-3'>
					<View className='flex-row items-center border border-gray-500 bg-white rounded-full px-4 py-2 w-[90%] mr-2'>
						<SearchIcon width='20' height='20' color='#748095' />
						<TextInput
							className='flex-1 ml-2 text-base text-[#748095]'
							placeholder='Search Good Times'
							placeholderTextColor='#748095'
							value={searchText}
							onChangeText={setSearchText}
							autoFocus={true}
							autoCapitalize='none'
							style={{
								height: 40,
								fontFamily: 'AvenirRoman',
								fontSize: 20,
								padding: 8
							}}
						/>
					</View>

					<Pressable onPress={() => setSearchText('')} className='p-[16]'>
						<CloseIcon width='24' height='24' color='#2454A4' />
					</Pressable>
				</View>

				{renderContent()}
			</View>
		</Modal>
	)
}
export default SearchModal
