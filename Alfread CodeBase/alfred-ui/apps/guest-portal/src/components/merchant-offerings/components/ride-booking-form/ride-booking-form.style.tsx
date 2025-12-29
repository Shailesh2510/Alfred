import styled from "@emotion/styled"

export const RideBookingContainer = styled.div`
	height: 100%;
	padding: 48px 24px;
	background: ${({ theme }) => theme.colors.white};
`
export const BookRideText = styled.div`
	flex-grow: 1;
	text-align: center;
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.headings.h3};
`
