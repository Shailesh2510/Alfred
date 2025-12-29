import React, { memo } from 'react'
import { View, Pressable } from 'react-native'
import { Link, usePathname } from 'expo-router'
import { Text } from '@/src/components/ui/text'
import { CarIcon } from '@icons/CarIcon'
import { BellIcon } from '@icons/BellIcon'
import { RestaurantIcon } from '@icons/RestaurantIcon'
import { TAB_ACTIVE_COLOR, TAB_INACTIVE_COLOR } from '@/src/utils/constants'
import { useGlobalStore } from '@/src/store/useGlobalStore'

interface ServiceTabsProperties {
	hotelId: string
}

const ServiceTabs = ({ hotelId }: ServiceTabsProperties) => {
	const pathname = usePathname()

	const { carmelMerchantId } = useGlobalStore()

	const tabs = [
		{
			id: 'in-room',
			label: 'In-Room Dining',
			icon: RestaurantIcon,
			route: `/${hotelId}/order-food` as const
		},
		...(carmelMerchantId > 0
			? [
					{
						id: 'transfer',
						label: 'Airport Transfers',
						icon: CarIcon,
						route: `/${hotelId}/airport-transfer` as const
					}
				]
			: []),
		{
			id: 'concierge',
			label: 'Concierge',
			icon: BellIcon,
			route: `/${hotelId}/concierge` as const
		}
	]

	return (
		<View className='bg-white'>
			<View className='flex-row justify-between'>
				{tabs.map(tab => {
					const isActive = pathname === tab.route
					const IconComponent = tab.icon

					return (
						<Link key={tab.id} href={tab.route} asChild>
							<Pressable className='flex-1 items-center py-3'>
								<View className='items-center'>
									<IconComponent
										color={isActive ? TAB_ACTIVE_COLOR : TAB_INACTIVE_COLOR}
										width='28'
										height='28'
									/>
									<Text
										variant='h4'
										className={`mt-2 text-[12px] ${isActive ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
									>
										{tab.label}
									</Text>
									{isActive && (
										<View className='absolute bottom-[-4] h-1 w-full bg-blue-600' />
									)}
								</View>
							</Pressable>
						</Link>
					)
				})}
			</View>
		</View>
	)
}

export default memo(ServiceTabs)
