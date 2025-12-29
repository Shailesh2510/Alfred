import { StyledModal } from "@/design-components"
import styled from "@emotion/styled"
import React from "react"
import RideBookingForm from "../../ride-booking-form/ride-booking-form"
import useRideStore from "../../store/useRideStore"

const RideCartHeader = styled.div`
	${({ theme }) => theme.other.typography.lg700};
	color: ${({ theme }) => theme.colors.black};
`

const RideChangeModal = () => {
	const { setOpenChangeRideForm, openChangeRideForm } = useRideStore()

	const handleOnClose = () => {
		setOpenChangeRideForm(false)
	}

	return (
		<StyledModal
			size='lg'
			centered={true}
			opened={openChangeRideForm}
			onClose={handleOnClose}
			title={<RideCartHeader>Book Ride</RideCartHeader>}
			modalBody={<RideBookingForm />}
		/>
	)
}

export default RideChangeModal
