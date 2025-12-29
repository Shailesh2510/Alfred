import styled from "@emotion/styled"

export const RideCheckoutContainer = styled.div`
	height: 100%;
	padding: 48px 24px;
	background: ${({ theme }) => theme.colors.white};
`

export const EmptyRideCartContainer = styled.div`
	padding: 48px;
	display: flex;
	border-radius: 8px;
	align-items: center;
	flex-direction: column;
	justify-content: center;
`

export const EmptyRideCartLabel = styled.div`
	padding: 48px;
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: center;
	color: ${({ theme }) => theme.colors.dark[3]};
	${({ theme }) => theme.other.typography.xl300};
`

export const RideCartPriceContainer = styled.div`
	padding: 24px 0 0 0;
	display: flex;
	flex-direction: column;
`

export const RideCartSubtotalPrice = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 12px;
	justify-content: center;
	${({ theme }) => theme.other.typography.sm700};
	color: ${({ theme }) => theme.colors.black};
`
export const ServiceFee = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.sm700};
	color: ${({ theme }) => theme.colors.black};
`

export const RideDiscountAmount = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.md700};
	color: ${({ theme }) => theme.colors.green[5]};
`

export const RideCartTotalPrice = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.headings.h3};
	color: ${({ theme }) => theme.colors.black};
`
export const RideDetailsText = styled.div`
	flex-grow: 1;
	text-align: center;
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.headings.h3};
`

export const VoucherCodeText = styled.div`
	${({ theme }) => theme.other.typography.sm500};
	color: ${({ theme }) => theme.colors.black};
`
export const VoucherAppliedContainer = styled.div`
	display: flex;
	align-items: right;
	justify-content: right;
`
export const AmbassadorCodeContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin: 12px 0;
`

export const AmbassadorCodeInput = styled.div`
	flex-grow: 1;
`

export const AmbassadorSuccessContainer = styled.div`
	display: flex;
	align-items: center;
	margin-top: 8px;
	padding: 8px;
	border-radius: 4px;
	background-color: ${({ theme }) => theme.colors.green[0]};
`

export const AmbassadorName = styled.div`
	${({ theme }) => theme.other.typography.sm500};
	color: ${({ theme }) => theme.colors.green[7]};
	margin-left: 8px;
`
