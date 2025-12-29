import { StyledModal } from "@/design-components"
import { Flex } from "@mantine/core"
import React from "react"

import styled from "@emotion/styled"
import RideCart from "./RideCart"
import useRideStore from "../../store/useRideStore"

const RideCartHeader = styled.div`
	${({ theme }) => theme.other.typography.lg700};
	color: ${({ theme }) => theme.colors.black};
`

const RideCartModal = () => {
	const { setShowCartModal, showCartModal } = useRideStore()

	const handleOnClose = () => {
		setShowCartModal(false)
	}

	return (
		<StyledModal
			size='md'
			centered={true}
			opened={showCartModal}
			onClose={handleOnClose}
			title={<RideCartHeader>Ride</RideCartHeader>}
			modalBody={
				<Flex direction='column' justify='center'>
					<RideCart />
				</Flex>
			}
		/>
	)
}

export default RideCartModal
