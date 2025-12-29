import styled from "@emotion/styled"

export const FulfillmentPolicyContainer = styled.div`
	padding: 20px 200px;
`

export const GoBackToMenu = styled.div`
	margin-left: 8px;
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.headings.h3};
`
