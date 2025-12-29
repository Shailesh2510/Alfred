import styled from "@emotion/styled"

export const RideStatusContainer = styled.div`
	height: 100%;
	padding: 24px;
	background-color: ${props => props.theme.colors.white};
`

export const RideSuccessMessage = styled.div`
	margin-bottom: 24px;
	color: ${({ theme }) => theme.colors.green[4]};
	${({ theme }) => theme.other.typography.headings.h1};
`
export const RideConfirmedMessage = styled.div`
	margin-bottom: 24px;
	${({ theme }) => theme.other.typography.lg400};
	max-width: 600px;
	word-wrap: break-word;
`

export const RideCanceledMessage = styled.div`
	margin-bottom: 24px;
	color: ${({ theme }) => theme.colors.gray[6]};
	${({ theme }) => theme.other.typography.headings.h1};
`

export const FieldLabel = styled.div`
	${({ theme }) => theme.other.typography.headings.h3};
`

export const FieldValue = styled.div`
	${({ theme }) => theme.other.typography.xxl400};
`

export const RideInfoContainer = styled.div`
	padding: 16px;
	border-radius: 8px;
	margin-bottom: 16px;
	border: 1px solid ${({ theme }) => theme.colors.dark[0]};
`

export const RideInfoLabel = styled.div`
	${({ theme }) => theme.other.typography.md500};
`

export const RideAmountLabel = styled.div`
	${({ theme }) => theme.other.typography.lg700};
`

export const ServiceFee = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.sm700};
	color: ${({ theme }) => theme.colors.black};
`

export const RideDiscountLabel = styled.div`
	${({ theme }) => theme.other.typography.md500};
`

export const RideDiscountAmount = styled.div`
	color: ${({ theme }) => theme.colors.green[5]};
	${({ theme }) => theme.other.typography.md600};
`
