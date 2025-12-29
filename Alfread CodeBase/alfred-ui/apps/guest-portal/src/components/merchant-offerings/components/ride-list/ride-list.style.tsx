import styled from "@emotion/styled"

export const RideListContainer = styled.div`
	height: 100%;
	background: ${({ theme }) => theme.colors.white};
`

export const RideListAndCartContainer = styled.div`
	padding: 0 16px;
	position: relative;
`

export const RideOptionsTitle = styled.div`
	display: flex;
	align-items: center;
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.lg400};
	b {
		margin-right: 8px;
		color: ${({ theme }) => theme.colors.black};
		${({ theme }) => theme.other.typography.headings.h2};
	}
`
export const AllInclusiveText = styled.div`
	display: flex;
	align-items: center;
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm500};
`
