import { Text } from '@components/ui/text'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, View } from 'react-native'

const ConsentSection = () => {
	return (
		<View className='flex items-center my-[12]'>
			<Text variant='p2Roman' className='text-gray-800 text-center'>
				{`I consent to the collection and use of my personal data as outlined in the Alfred `}
				<Pressable onPress={() => router.push('/privacy-policy')}>
					<Text variant='p2Roman' className='border-b border-gray-800'>
						{`Privacy Policy`}
					</Text>
				</Pressable>
				{`. Additionally, I agree to Alfred's `}
				<Pressable onPress={() => router.push('/refund-policy')}>
					<Text variant='p2Roman' className='border-b border-gray-800'>
						{`Return Policy`}
					</Text>
				</Pressable>
				{`.`}
			</Text>
		</View>
	)
}

export default ConsentSection
