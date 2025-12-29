import { View, TouchableOpacity } from 'react-native'
import { Text } from '@components/ui/text'
import { Link } from 'expo-router'
import { PhoneIcon } from '@icons/PhoneIcon'
import { AlfredLogo } from '@components/ui/images/AlfredLogo'
import { WHITE } from '@/src/utils/constants'
import { useGlobalStore } from '@/src/store/useGlobalStore'

const AppFooter = (): JSX.Element => {
	const { setPhoneModalVisible } = useGlobalStore()
	return (
		<View className='bg-blue-700'>
			<TouchableOpacity
				className='flex-row items-center justify-center space-x-2 pt-8'
				onPress={() => setPhoneModalVisible(true)}
			>
				<PhoneIcon color={WHITE} />
				<Text variant='p2Roman' className='text-white'>
					{`Call for assistance from our concierge`}
				</Text>
			</TouchableOpacity>

			<View className='items-center py-6'>
				<AlfredLogo height={'20'} width={'150'} color={WHITE} />
			</View>
			<View className='flex-row justify-around py-6'>
				<Link href='/privacy-policy' asChild>
					<TouchableOpacity>
						<Text variant='p2Roman' className='text-white'>
							{`Privacy Policy`}
						</Text>
					</TouchableOpacity>
				</Link>
				<Link href='/fulfillment-policy' asChild>
					<TouchableOpacity>
						<Text variant='p2Roman' className='text-white'>
							{`Fulfillment Policy`}
						</Text>
					</TouchableOpacity>
				</Link>

				<Link href='/refund-policy' asChild>
					<TouchableOpacity>
						<Text variant='p2Roman' className='text-white'>
							{`Refund Policy`}
						</Text>
					</TouchableOpacity>
				</Link>
			</View>
		</View>
	)
}

export default AppFooter
