import styled from "@emotion/styled"

export const OrderPageHeaderContainer = styled.div`
	padding: 16px 24px;
	border-bottom: 1px solid ${({ theme }) => theme.colors.dark[0]};
`

export const HotelName = styled.div<{ smallScreen: boolean }>`
	${({ theme }) => theme.other.typography.headings.h1};
	color: ${({ theme }) => theme.colors.black};
	font-size: ${({ smallScreen }) => (smallScreen ? "24px" : "36px")} !important;
`
