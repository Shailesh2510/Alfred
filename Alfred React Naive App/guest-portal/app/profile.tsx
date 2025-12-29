import { View } from 'react-native'
import { Text } from '@components/ui/text'
import { PageContainer } from '@components/ui/page-container'

const Profile = (): JSX.Element | null => {
	return (
		<PageContainer>
			<View className='flex-1 items-center justify-center'>
				<Text variant='h1'>Profile</Text>
				<Text variant='body'>Your Profile content goes here.</Text>
			</View>
		</PageContainer>
	)
}

export default Profile
