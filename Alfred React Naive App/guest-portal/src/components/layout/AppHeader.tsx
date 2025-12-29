import React from 'react'
import { View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { HamburgerMenuIcon } from '@icons/HamburgerMenuIcon'
import { PhoneIcon } from '@icons/PhoneIcon'
import { CloseIcon } from '@icons/CloseIcon'
import { AlfredLogo } from '@images/AlfredLogo'
import { useGlobalStore } from '@store/useGlobalStore'
import { Sidebar } from './Sidebar'
import { BLUE_700 } from '@/src/utils/constants'

const AppHeader = (): JSX.Element => {
	const {
		openSideBar,
		setOpenSideBar,
		setPhoneModalVisible,
		currentHotelDetails
	} = useGlobalStore()

	const handleLogoPress = () => {
		if (currentHotelDetails?.webCode) {
			try {
				router.push(`/${currentHotelDetails.webCode}`)
			} catch {
				router.push('/404')
			}
		}
	}

	return (
		<View>
			<SafeAreaView className='bg-white z-[1000]'>
				<View className='flex flex-row justify-between items-center py-[16]'>
					<Pressable
						onPress={() => setOpenSideBar(!openSideBar)}
						className='pl-[20]'
					>
						{openSideBar ? <CloseIcon /> : <HamburgerMenuIcon />}
					</Pressable>
					<Pressable onPress={handleLogoPress}>
						<AlfredLogo height={'20'} width={'107'} />
					</Pressable>
					<Pressable
						onPress={() => setPhoneModalVisible(true)}
						className='pr-[20]'
					>
						<PhoneIcon width='20' height='20' color={BLUE_700} />
					</Pressable>
				</View>
			</SafeAreaView>
			<View style={{ position: 'absolute' }}>
				<Sidebar />
			</View>
		</View>
	)
}

export default AppHeader
