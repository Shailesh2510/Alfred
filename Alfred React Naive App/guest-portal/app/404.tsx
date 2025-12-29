import { View } from 'react-native'
import { Link, router } from 'expo-router'
import { Text } from '@components/ui/text'
import { PageContainer } from '@components/ui/page-container'
import { Button } from '@components/ui/button'
import { useTheme } from '@context/theme-context'

const NotFoundPage = (): JSX.Element | null => {
	const { theme } = useTheme()

	return (
		<PageContainer>
			<View className='flex-1 items-center justify-center'>
				<View className='max-w-md w-full space-y-8 items-center'>
					{/* 404 Number */}
					<Text
						className={`
							text-8xl font-InterBold,
							${theme === 'dark' ? 'text-gray-700' : 'text-gray-200'}
						`}
					>
						404
					</Text>

					{/* Error Message */}
					<View className='space-y-4 items-center'>
						<Text variant='h1' className='text-center'>
							Page Not Found
						</Text>
						<Text variant='body' className='text-center'>
							{`Sorry, we couldn't find the page you're looking for.
							Please check the URL or return to the homepage.`}
						</Text>
					</View>

					{/* Action Buttons */}
					<View className='flex-row space-x-4 mt-8'>
						<Link href='/' asChild>
							<Button variant='primary'>
								<Text>Go to Home</Text>
							</Button>
						</Link>
						<Button variant='secondary' onPress={() => router.back()}>
							<Text>Go Back</Text>
						</Button>
					</View>
				</View>
			</View>
		</PageContainer>
	)
}

export default NotFoundPage
