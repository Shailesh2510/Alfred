import styled from "@emotion/styled"

export const MerchantsContainer = styled.div`
	display: flex;
	flex-direction: column;
`

export const MerchantsGrid = styled.div`
	flex-grow: 1;
`

export const MerchantsFooter = styled.div``

export const PartnerCard = styled.div`
	padding: 24px;
	border-radius: 8px;
	box-shadow: 4px 4px 10px 2px rgba(0, 0, 0, 0.2);
`

export const PartnerName = styled.div`
	margin-bottom: 12px;
	${({ theme }) => theme.other.typography.headings.h3}
`

export const PartnerMealPeriods = styled.div``

export const PartnerMealPeriodsLabel = styled.div`
	margin-bottom: 12px;
	${({ theme }) => theme.other.typography.md600};
`

export const MealPeriodContainer = styled.div`
	margin-bottom: 12px;
`
