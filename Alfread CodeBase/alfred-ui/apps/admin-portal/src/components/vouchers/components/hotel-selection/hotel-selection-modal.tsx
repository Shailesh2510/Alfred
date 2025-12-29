import React from "react"
import { StyledModal, StyledButton } from "@/design-components"
import { Checkbox, Radio } from "@mantine/core"
import {
	HotelSelectionContainer,
	HotelListContainer,
	HotelListItemContainer,
	HotelNameContainer,
	HotelName,
	SelectAllContainer,
	ModalFooterContainer
} from "./hotel-selection-modal.style"

interface Hotel {
	value: string | number
	label: string
}

interface HotelSelectionModalProps {
	opened: boolean
	onClose: () => void
	hotels: Hotel[]
	selectedHotels: (string | number)[]
	// eslint-disable-next-line no-unused-vars
	onChange: (selectedIds: (string | number)[]) => void
	isPreFixe?: boolean
}

const HotelSelectionModal: React.FC<HotelSelectionModalProps> = ({
	opened,
	onClose,
	hotels,
	selectedHotels,
	onChange,
	isPreFixe = false
}) => {
	const allSelected = hotels.length === selectedHotels.length

	const handleSelectAll = () => {
		if (isPreFixe) {
			return
		}
		if (allSelected) {
			onChange([])
		} else {
			onChange(hotels.map(hotel => hotel.value))
		}
	}

	const handleHotelToggle = (hotelId: string | number) => {
		if (isPreFixe) {
			onChange([hotelId])
		} else {
			const updatedSelection = selectedHotels.includes(hotelId)
				? selectedHotels.filter(id => id !== hotelId)
				: [...selectedHotels, hotelId]
			onChange(updatedSelection)
		}
	}

	const handleConfirm = () => {
		onClose()
	}

	return (
		<StyledModal
			size='lg'
			opened={opened}
			title='Select Hotels'
			onClose={onClose}
			modalBody={
				<HotelSelectionContainer>
					{!isPreFixe && (
						<SelectAllContainer>
							<Checkbox
								checked={allSelected}
								onChange={handleSelectAll}
								label='Select All Hotels'
							/>
						</SelectAllContainer>
					)}

					<HotelListContainer>
						{hotels.map(hotel => (
							<HotelListItemContainer key={hotel.value}>
								<HotelNameContainer>
									{isPreFixe ? (
										<Radio
											checked={selectedHotels.includes(hotel.value)}
											onChange={() => handleHotelToggle(hotel.value)}
										/>
									) : (
										<Checkbox
											checked={selectedHotels.includes(hotel.value)}
											onChange={() => handleHotelToggle(hotel.value)}
										/>
									)}
									<HotelName>{hotel.label}</HotelName>
								</HotelNameContainer>
							</HotelListItemContainer>
						))}
					</HotelListContainer>
				</HotelSelectionContainer>
			}
			modalFooter={
				<ModalFooterContainer>
					<StyledButton variant='outline' color='dark' onClick={onClose}>
						Cancel
					</StyledButton>
					<StyledButton color='green' onClick={handleConfirm}>
						Confirm Selection
					</StyledButton>
				</ModalFooterContainer>
			}
		/>
	)
}

export default HotelSelectionModal
