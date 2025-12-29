import styled from "@emotion/styled"

export const ConsentDescription = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm400};
`

export const ConsentRequest = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm600};
	margin-top: 20px;
`
