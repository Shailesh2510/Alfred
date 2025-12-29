import styled from "@emotion/styled"

export const MerchantsColumnContainer = styled.div``

export const StyledTableRow = styled.tr`
	cursor: pointer;
`

export const MerchantContainer = styled.div`
	padding: 24px;
`

export const GuestInformationContainer = styled.div`
	display: flex;
	flex-direction: column;
`

export const FieldLabel = styled.div`
	color: ${({ theme }) => theme.colors.gray[6]};
	${({ theme }) => theme.other.typography.md700};
`

export const FieldValue = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.md500};
`
