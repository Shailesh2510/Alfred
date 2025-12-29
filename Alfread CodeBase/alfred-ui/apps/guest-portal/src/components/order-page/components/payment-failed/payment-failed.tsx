import { StyledButton, StyledModal } from "@/design-components"
import React from "react"
import { Flex } from "@mantine/core"
import useCartStore from "../../stores/useCartStore"
import styled from "@emotion/styled"

const PaymentFailedHeader = styled.div`
	${({ theme }) => theme.other.typography.lg700};
	color: ${({ theme }) => theme.colors.black};
	margin: 10px;
`

const PaymentFailedModal = () => {
	const { setOpenPaymentFailedModal, openPaymentFailedModal } = useCartStore()

	const handleOnClose = () => {
		setOpenPaymentFailedModal(false)
	}

	return (
		<StyledModal
			size='md'
			centered={true}
			opened={openPaymentFailedModal}
			onClose={handleOnClose}
			title={
				<PaymentFailedHeader>
					Oops! That payment didnt go through
				</PaymentFailedHeader>
			}
			modalBody={
				<Flex direction='column' justify='center'>
					{`It looks like something went wrong, and your order didn't go through`}
				</Flex>
			}
			modalFooter={
				<StyledButton size='md' fullWidth={true} onClick={handleOnClose}>
					Try Again
				</StyledButton>
			}
		/>
	)
}

export default PaymentFailedModal
