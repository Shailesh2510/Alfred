import styled from "@emotion/styled"

export const SubHeaderContainer = styled.div`
	padding: 16px 24px;
	border-bottom: 1px solid ${({ theme }) => theme.colors.dark[0]};
`

export const MealPeriodContainer = styled.div`
	display: flex;
	align-items: center;
	column-gap: 8px;
`

export const SubHeaderCategoriesContainer = styled.div<{
	isSmallScreen: boolean
}>`
	padding: 6px 24px;
	border-bottom: 1px solid ${({ theme }) => theme.colors.dark[0]};
	position: sticky;
	top: ${({ isSmallScreen }) => (isSmallScreen ? "4.5rem" : "4.2rem")};
	background-color: ${({ theme }) => theme.colors.white};
	z-index: 1;
`
