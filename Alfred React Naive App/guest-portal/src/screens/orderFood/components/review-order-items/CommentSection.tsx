import React, { useState } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from '@components/ui/text'
import { CommentIcon } from '@components/ui/icons/CommentIcon'
import CustomTextInputButtonField from '@components/ui/CustomTextInputButtonField'
import { useCartStore } from '@/src/store/useCartStore'

export const CommentSection = () => {
	const {
		setOrderComment,
		order: { comment }
	} = useCartStore()
	const [commentText, setCommentText] = useState(comment)
	const [isEditing, setIsEditing] = useState(false)

	const handleSave = () => {
		setOrderComment(commentText)
		setIsEditing(false)
	}

	if (isEditing) {
		return (
			<View className='my-4'>
				<CustomTextInputButtonField
					label='Add a comment'
					value={commentText}
					onChangeText={setCommentText}
					buttonText='Save'
					onButtonPress={handleSave}
					autoFocus={true}
				/>
			</View>
		)
	}

	return (
		<TouchableOpacity
			onPress={() => setIsEditing(true)}
			className={`flex-row items-center justify-between p-4 rounded-lg ${
				comment ? 'bg-blue-350' : 'bg-white'
			}`}
		>
			<View className='flex-row items-center flex-1'>
				{comment ? (
					<CommentIcon width='20' height='20' color='#5B687D' />
				) : null}
				<Text variant='p2Medium' className='ml-2 text-gray-800'>
					{comment || 'Add a comment'}
				</Text>
			</View>
			{comment ? (
				<Text variant='p3' className='text-gray-800 underline'>
					{`edit`}
				</Text>
			) : null}
		</TouchableOpacity>
	)
}
