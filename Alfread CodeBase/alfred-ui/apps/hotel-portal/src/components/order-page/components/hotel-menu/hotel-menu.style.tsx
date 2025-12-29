import styled from "@emotion/styled"

export const MealPeriodTitle = styled.div`
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
