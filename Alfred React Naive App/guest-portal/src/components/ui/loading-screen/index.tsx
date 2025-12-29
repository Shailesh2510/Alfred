import React from 'react'
import { Modal, View, SafeAreaView } from 'react-native'
import { Text } from '@components/ui/text'
import { AlfredLogo } from '../images/AlfredLogo'
import { WHITE } from '@/src/utils/constants'
import { RestaurantIcon } from '../icons/RestaurantIcon'
import { CarIcon } from '../icons/CarIcon'

interface LoadingScreenProperties {
	visible: boolean
}
const LoadingScreen: React.FC<LoadingScreenProperties> = ({ visible }) => {
	return (
		<Modal transparent={true} visible={visible}>
			<SafeAreaView className='flex-1'>
				<View className='flex-1 bg-gradient-to-b from-primary-1100 via-primary-1100 to-primary-1200 justify-center'>
					<View className='flex items-center justify-center'>
						<View className='items-center'>
							<AlfredLogo color={WHITE} height={`35`} width='180' />
						</View>
						<View>
							<View className='flex-row items-start pt-[72]'>
								<View className='items-center justify-center'>
									<RestaurantIcon height='24' width='24' color={WHITE} />
								</View>
								<View className='flex-1 pl-[12]'>
									<Text variant='h5' className='text-gray-150'>
										24/7 dining options
									</Text>
								</View>
							</View>
							<View className='flex-row items-start pt-[24]'>
								<View className=' items-center justify-center pt-[12]'>
									<CarIcon height='24' width='24' color={WHITE} />
								</View>
								<View className='flex-1 pl-[12]'>
									<Text variant='h5' className='text-gray-150'>
										Private airport transfers
										<br />
										starting as low as $68
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>
			</SafeAreaView>
		</Modal>
	)
}

export default LoadingScreen
