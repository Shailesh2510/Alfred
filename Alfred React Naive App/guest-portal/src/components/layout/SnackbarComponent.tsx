import React from 'react'
import { Text } from '@components/ui/text'
import { View } from 'react-native'
import { useSnackbarStore } from '@/src/store/useSnackbarStore'
import { SnackbarType } from '@/src/types/others'
import { ConfirmIcon } from '../ui/icons/ConfirmIcon'
import { WarningIcon } from '../ui/icons/WarningIcon'
import { WHITE } from '@/src/utils/constants'
import Snackbar from '@/src/components/layout/CustomSnackbar'

const SnackbarComponent = () => {
	const {
		snackbarMessage,
		snackbarVisible,
		setSnackbarVisible,
		snackbarType,
		snackBarTitle
	} = useSnackbarStore()
	const SNACKBAR_DURATION = 4000

	const getBorderColor = () => {
		switch (snackbarType) {
			case SnackbarType.SUCCESS: {
				return '#0A6555'
			}
			case SnackbarType.ERROR: {
				return '#BA082B'
			}
		}
	}

	const getBackgroundColorClass = () => {
		return snackbarType === SnackbarType.SUCCESS
			? 'bg-utility-green500'
			: 'bg-utility-red500'
	}

	return (
		<Snackbar
			visible={snackbarVisible}
			onDismiss={() => setSnackbarVisible(false)}
			duration={SNACKBAR_DURATION}
		>
			<View className='flex flex-row items-center rounded-lg bg-white'>
				<View className={`flex-row rounded-lg`}>
					<View
						className={`${getBackgroundColorClass()} items-center p-[22] justify-center rounded-l-lg`}
					>
						{snackbarType === SnackbarType.SUCCESS ? (
							<ConfirmIcon width='40' height='40' color={WHITE} />
						) : (
							<WarningIcon width='40' height='40' color={WHITE} />
						)}
					</View>
					<View className='p-[16]'>
						<Text variant={'p2Medium'} className='text-blue-500'>
							{snackBarTitle}
						</Text>
						<Text variant={'p2Medium'} className='text-blue-500'>
							{snackbarMessage}
						</Text>
					</View>
				</View>
			</View>
		</Snackbar>
	)
}

export default SnackbarComponent
