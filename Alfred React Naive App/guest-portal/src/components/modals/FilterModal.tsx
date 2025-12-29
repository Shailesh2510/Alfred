import React, { useState, useEffect } from 'react'
import { View, Modal, Pressable, ScrollView } from 'react-native'
import { Text } from '@/src/components/ui/text'
import { CloseIcon } from '@/src/components/ui/icons/CloseIcon'
import { MenuItem } from '@/src/types/menu-types/menu'
import { startCase } from '@lib/utils'
interface FilterModalProperties {
	visible: boolean
	onClose: () => void
	onApplyFilters: (selectedFilters: string[]) => void
	menuItems: MenuItem[]
	initialFilters?: string[]
}

const FilterModal: React.FC<FilterModalProperties> = ({
	visible,
	onClose,
	onApplyFilters,
	menuItems,
	initialFilters = []
}) => {
	const [selectedFilters, setSelectedFilters] =
		useState<string[]>(initialFilters)

	const getAllTags = (): string[] => {
		const tagsMap = new Map<string, string>()

		for (const item of menuItems) {
			if (item.tags) {
				try {
					let tagsList: string[] = []

					if (Array.isArray(item.tags)) {
						tagsList = item.tags
					} else if (typeof item.tags === 'string') {
						try {
							const parsedTags = JSON.parse(item.tags)
							if (Array.isArray(parsedTags)) {
								tagsList = parsedTags
							} else if (typeof parsedTags === 'object') {
								tagsList = Object.keys(parsedTags)
							} else if (typeof parsedTags === 'string') {
								tagsList = parsedTags.includes(',')
									? parsedTags.split(',').map(t => t.trim())
									: [parsedTags]
							}
						} catch {
							tagsList = item.tags.includes(',')
								? item.tags.split(',').map(t => t.trim())
								: [item.tags.trim()]
						}
					}

					for (const tag of tagsList) {
						if (tag && tag.trim() !== '') {
							const cleanTag = tag.trim().replaceAll(/[{}"[\]]/g, '')
							const normalizedTag = cleanTag.toLowerCase()
							if (
								!tagsMap.has(normalizedTag) ||
								cleanTag.charAt(0).toUpperCase() === cleanTag.charAt(0)
							) {
								tagsMap.set(normalizedTag, cleanTag)
							}
						}
					}
				} catch (error) {
					console.error('Error processing tags:', error)
				}
			}
		}
		return [...tagsMap.values()]
			.map(tag => startCase(tag))
			.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
	}

	const availableTags = getAllTags()

	useEffect(() => {
		if (visible) {
			setSelectedFilters(initialFilters)
		}
	}, [visible, initialFilters])

	const toggleFilter = (filter: string) => {
		if (selectedFilters.includes(filter)) {
			setSelectedFilters(selectedFilters.filter(f => f !== filter))
		} else {
			setSelectedFilters([...selectedFilters, filter])
		}
	}

	const resetFilters = () => {
		setSelectedFilters([])
	}

	const applyFilters = () => {
		onApplyFilters(selectedFilters)
		onClose()
	}

	return (
		<Modal
			animationType='fade'
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View className='flex-1 bg-black/50 justify-center items-center px-6'>
				<View className='w-full max-w-[350px] bg-white rounded-2xl overflow-hidden'>
					<View className='flex-row justify-between items-center px-6 py-[14] bg-gray-300'>
						<View className='w-8' />
						<Text variant='p1' className='text-gray-800 flex-1 text-center'>
							{`Filters`}
						</Text>
						<Pressable onPress={onClose} className='items-end'>
							<CloseIcon />
						</Pressable>
					</View>

					<ScrollView className='px-[16] py-[40] max-h-[350]'>
						<View className='space-y-4'>
							{availableTags.length > 0 ? (
								availableTags.map((tag, index) => (
									<Pressable
										key={`${tag}-${index}`}
										onPress={() => toggleFilter(tag)}
										className={`py-[8] border ${
											selectedFilters.includes(tag)
												? 'bg-blue-100 border-blue-500 rounded-lg'
												: 'bg-white border-gray-150 rounded-lg'
										}`}
									>
										<Text
											variant='p2Heavy'
											className='text-center text-blue-500'
										>
											{tag}
										</Text>
									</Pressable>
								))
							) : (
								<Text
									variant='p2Medium'
									className='text-center text-gray-500 py-4'
								>
									{`No filters available`}
								</Text>
							)}
						</View>
					</ScrollView>

					<View className='flex-row justify-between bg-white py-[12] px-[12]'>
						<Pressable onPress={resetFilters} className='px-[30] py-[10]'>
							<Text variant='h4' className='text-blue-500'>
								{`Reset Filters`}
							</Text>
						</Pressable>

						<Pressable
							onPress={applyFilters}
							className='px-[30] py-[10] bg-blue-700 rounded-full'
						>
							<Text variant='h5' className='text-white'>
								{`Apply`}
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	)
}

export default FilterModal
