import styled from "@emotion/styled"

export const VoucherInputContainer = styled.div`
	gap: 16px;
	padding: 8px;
	border-radius: 8px;
	margin-bottom: 12px;
	border: 1px solid ${({ theme }) => theme.colors.dark[0]};
`

export const VoucherInfoLabel = styled.div`
	${({ theme }) => theme.other.typography.md600};
	color: ${({ theme }) => theme.colors.gray[9]};
`

export const VoucherInfoContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	${({ theme }) => theme.other.typography.md400};
	b {
		${({ theme }) => theme.other.typography.md600};
	}
`
