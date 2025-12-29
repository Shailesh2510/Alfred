import styled from "@emotion/styled"

export const WelcomePageContainer = styled.div`
	height: 100%;
	padding: 0 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${({ theme }) => theme.colors.white};
`

export const WelcomeLabel = styled.div`
	text-align: center;
	${({ theme }) => theme.other.typography.headings.h2};
`

export const WelcomeSubText = styled.div`
	${({ theme }) => theme.other.typography.md600};
	color: ${({ theme }) => theme.colors.gray[9]};
`
