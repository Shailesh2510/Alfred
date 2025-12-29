import { Modifier } from '@/src/types/menu-types/menu'
import React, { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Checkbox } from 'react-native-paper'
import { Text } from '@/src/components/ui/text'
import { formatPrice } from '@/src/utils/validation-utils/formatPrice'

type CheckboxGroupProperties = {
	modifier: Modifier
	selectedOptionIds?: string[]
	onChange: (selectedOptionIds: string[]) => void
}

const CheckboxGroup: React.FC<CheckboxGroupProperties> = ({
	modifier,
	selectedOptionIds = [],
	onChange
}) => {
	const [selected, setSelected] = useState<string[]>(selectedOptionIds)

	const handleSelect = (value: string) => {
		const isSelected = selected.includes(value)
		let updatedSelection = [...selected]

		if (isSelected) {
			updatedSelection = updatedSelection.filter(item => item !== value)
		} else {
			updatedSelection.push(value)
		}

		const freeOptionsCount = updatedSelection
			.map(id => modifier.options.find(option => option.id.toString() === id))
			.filter(option => option?.price === 0).length

		if (freeOptionsCount <= modifier.free_modifier_count) {
			setSelected(updatedSelection)
			onChange(updatedSelection)
		}
	}

	return (
		<View>
			{modifier.options.map(option => (
				<View
					key={option.id}
					className={`flex-row items-center justify-between `}
				>
					<Pressable className='flex-row items-center m-[0] p-[0] '>
						<Checkbox.Android
							status={
								selected.includes(option.id.toString())
									? 'checked'
									: 'unchecked'
							}
							onPress={() => handleSelect(option.id.toString())}
							color='#2454A4'
						/>
						<Text variant='p2Medium' className='text-primary-950 pl-[4]'>
							{option?.name}
							{option?.price
								? ` (+${formatPrice(option?.price.toString())})`
								: null}
						</Text>
					</Pressable>
				</View>
			))}
		</View>
	)
}

export default CheckboxGroup
