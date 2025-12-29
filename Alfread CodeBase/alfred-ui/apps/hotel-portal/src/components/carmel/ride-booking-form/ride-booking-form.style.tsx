import styled from "@emotion/styled"

export const RideBookingContainer = styled.div<{
	isRideCartModalOpen: boolean
}>`
	height: 100%;
	padding: ${({ isRideCartModalOpen }) =>
		isRideCartModalOpen ? "0px 24px" : "48px 24px"};
	background: ${({ theme }) => theme.colors.white};
`
export const BookRideText = styled.div`
	flex-grow: 1;
	text-align: center;
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.headings.h3};
`

export const NoCarmelAssociationText = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.headings.h3};
`
export const RideTypeOptionsContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
`
