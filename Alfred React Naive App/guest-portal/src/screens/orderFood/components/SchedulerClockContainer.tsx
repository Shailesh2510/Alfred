import React from 'react'
import { View, Pressable, ScrollView } from 'react-native'
import { SchedulerClockIcon } from '@components/ui/icons/SchedulerClockIcon'
import { DropDownIcon } from '@components/ui/icons/DropDownIcon'
import { Text } from '@components/ui/text'
import { Ionicons } from '@expo/vector-icons'
import { CustomChip } from '@/src/components/ui/CustomChip'

interface SchedulerClockContainerProperties {
	timeSlot: string
	onPress: () => void
	scrollableRef?: React.RefObject<ScrollView>
	isUserScrolling?: boolean
	showDeliverText?: boolean
	backgroundColor?: string
}

const SchedulerClockContainer: React.FC<SchedulerClockContainerProperties> = ({
	timeSlot,
	onPress,
	scrollableRef,
	isUserScrolling = false,
	showDeliverText = true,
	backgroundColor = 'bg-gray-300'
}) => {
	return (
		<View
			className={`flex flex-row items-center relative justify-center sticky top-0 z-10 ${backgroundColor}`}
		>
			<View
				className={`flex flex-row items-center justify-center py-[16] ${backgroundColor}`}
			>
				{showDeliverText && (
					<Text variant='p2Medium' className='text-blue-800 pr-[8]'>
						{`Deliver`}
					</Text>
				)}
				<CustomChip
					onPress={onPress}
					containerClassName='bg-white px-[8] rounded-full border border-blue-150'
					icon={<SchedulerClockIcon />}
				>
					<Text
						variant='p2Medium'
						className='text-blue-700 font-bold px-[16] py-[6.5]'
					>
						{timeSlot}
					</Text>
					<View>
						<DropDownIcon width='20' height='20' color='#022867' />
					</View>
				</CustomChip>
			</View>
			{isUserScrolling ? (
				<View className='absolute right-[16]'>
					<Pressable
						onPress={() => {
							scrollableRef?.current?.scrollTo({ y: 0, animated: true })
						}}
						className='flex-row items-center bg-blue-300 rounded-full p-3'
					>
						<Ionicons name='arrow-up' size={22} className=' text-primary-950' />
					</Pressable>
				</View>
			) : null}
		</View>
	)
}

export default SchedulerClockContainer
