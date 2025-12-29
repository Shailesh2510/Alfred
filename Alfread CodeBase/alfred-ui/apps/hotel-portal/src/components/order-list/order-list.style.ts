import styled from "@emotion/styled"

export const MerchantContainer = styled.div`
	display: flex;
	flex-direction: column;
`

export const MerchantName = styled.div`
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md600};
`

export const MerchantId = styled.div`
	color: ${({ theme }) => theme.colors.dark[2]};
	${({ theme }) => theme.other.typography.sm400};
`

export const TotalPrice = styled.div`
	color: ${({ theme }) => theme.colors.dark[5]};
	${({ theme }) => theme.other.typography.md700};
`

export const StyledTableRow = styled.tr`
	cursor: pointer;
`
