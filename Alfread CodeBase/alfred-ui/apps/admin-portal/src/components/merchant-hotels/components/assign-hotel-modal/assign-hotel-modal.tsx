import React from "react"
import { StyledModal, StyledButton } from "@/design-components"
import { Flex } from "@mantine/core"

interface AssignHotelModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	isLoading: boolean
}

const AssignHotelModal: React.FC<AssignHotelModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	isLoading
}) => {
	return (
		<StyledModal
			opened={isOpen}
			title='Confirm Changes'
			onClose={onClose}
			modalBody='Are you sure you want to update the hotel assignments? This action will modify the meal period mappings for the selected hotels.'
			modalFooter={
				<Flex justify='space-between'>
					<StyledButton
						variant='outline'
						color='dark'
						onClick={onClose}
						disabled={isLoading}
					>
						Cancel
					</StyledButton>
					<StyledButton color='green' onClick={onConfirm} loading={isLoading}>
						Confirm Changes
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default AssignHotelModal
