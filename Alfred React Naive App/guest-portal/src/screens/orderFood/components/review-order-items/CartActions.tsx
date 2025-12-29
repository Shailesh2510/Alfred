import { View, TouchableOpacity } from 'react-native'
import { Text } from '@/src/components/ui/text'
import { router } from 'expo-router'
import { useCartStore } from '@/src/store/useCartStore'
import { AddIcon } from '@/src/components/ui/icons/AddIcon'
import { DeleteIcon } from '@/src/components/ui/icons/DeleteIcon'

export const CartActions = () => {
	const { resetOrderItems, setTipByUser } = useCartStore()

	const handleEmptyBag = () => {
		resetOrderItems()
		setTipByUser(0)
	}

	return (
		<View className='py-[16]'>
			<View className='flex-row justify-between items-center'>
				<TouchableOpacity
					onPress={() => router.back()}
					className='flex-row items-center justify-center'
				>
					<AddIcon width='20' height='20' color='#2454A4' />
					<Text variant='p2Heavy' className='text-blue-500 ml-2'>
						{`Add more items`}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={handleEmptyBag}
					className='flex-row items-center justify-center'
				>
					<DeleteIcon width='20' height='20' color='#2454A4' />
					<Text variant='p2Heavy' className='text-blue-500 ml-2'>
						{`Empty bag`}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
