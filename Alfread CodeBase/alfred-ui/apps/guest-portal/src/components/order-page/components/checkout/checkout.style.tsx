import styled from "@emotion/styled"

export const CheckoutContainer = styled.div`
	height: 100%;
	padding: 48px 24px;
	background: ${({ theme }) => theme.colors.white};
`

export const EmptyCartContainer = styled.div`
	padding: 48px;
	display: flex;
	border-radius: 8px;
	align-items: center;
	flex-direction: column;
	justify-content: center;
`

export const CutleriesLabel = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.md600};
`

export const EmptyCartLabel = styled.div`
	padding: 48px;
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: center;
	color: ${({ theme }) => theme.colors.dark[3]};
	${({ theme }) => theme.other.typography.xl300};
`

export const CartPriceContainer = styled.div`
	padding: 24px 0 0 0;
	display: flex;
	flex-direction: column;
`

export const GoBackToCart = styled.div`
	margin-left: 8px;
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.headings.h3};
`

export const CartSubtotalPrice = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.sm700};
	color: ${({ theme }) => theme.colors.black};
`

export const CartDeliveryFee = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.xs400};
	color: ${({ theme }) => theme.colors.black};
`

export const CartTip = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.sm700};
	color: ${({ theme }) => theme.colors.black};
`

export const CartTaxAmount = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.xs400};
	color: ${({ theme }) => theme.colors.black};
`

export const DiscountAmount = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.md700};
	color: ${({ theme }) => theme.colors.green[5]};
`

export const CartTotalPrice = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.headings.h3};
	color: ${({ theme }) => theme.colors.black};
`

export const OrderDetailsText = styled.div`
	flex-grow: 1;
	text-align: center;
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.headings.h3};
`

export const ConsentText = styled.div`
	display: flex;
	align-items: center;
	${({ theme }) => theme.other.typography.sm500};
	color: ${({ theme }) => theme.colors.black};
`
export const RefundPolicyText = styled.div`
	display: flex;
	${({ theme }) => theme.other.typography.xxs500};
	color: ${({ theme }) => theme.colors.red[8]};
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
