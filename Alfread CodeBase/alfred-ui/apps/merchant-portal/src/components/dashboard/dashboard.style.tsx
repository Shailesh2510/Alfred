import styled from "@emotion/styled"

export const WelcomeMessage: any = styled.div`
	display: flex;
	width: 100%;
	margin-bottom: 40px;
	justify-content: center;
	color: ${({ theme }) => theme.colors.dark[5]};
	${({ theme }) => theme.other.typography.headings.h1};
`

export const PageSubtitle: any = styled.div`
	margin-bottom: 30px;
	${({ theme }) => theme.other.typography.headings.h2};
`

export const PartnerCard: any = styled.div`
	padding: 24px;
	border-radius: 8px;
	box-shadow: 4px 4px 10px 2px rgba(0, 0, 0, 0.2);
`

export const PartnerName: any = styled.div`
	margin-bottom: 24px;
	${({ theme }) => theme.other.typography.headings.h3}
`

export const PartnerPhone: any = styled.div`
	margin-bottom: 8px;
	b {
		${({ theme }) => theme.other.typography.md600};
	}
`

export const PartnerEmail: any = styled.div`
	margin-bottom: 8px;
	b {
		${({ theme }) => theme.other.typography.md600};
	}
`

export const PartnerMealPeriod: any = styled.div`
	b {
		${({ theme }) => theme.other.typography.md600};
	}
`
