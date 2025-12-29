import styled from "@emotion/styled"

export const CartContainer = styled.div<{ isSmallScreen: boolean }>`
	top: 80px;
	margin-top: ${({ isSmallScreen }) => (isSmallScreen ? "0px" : "48px")};
	position: sticky;
`

export const EmptyCartContainer = styled.div`
	margin: 48px 0;
	display: flex;
	border-radius: 8px;
	align-items: center;
	flex-direction: column;
	justify-content: center;
`

export const EmptyCartLabel = styled.div`
	margin: 48px 0;
	text-align: center;
	color: ${({ theme }) => theme.colors.dark[3]};
	${({ theme }) => theme.other.typography.xl300};
`

export const CartPriceContainer = styled.div`
	padding: 24px 0;
	display: flex;
	flex-direction: column;
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
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.sm700};
	color: ${({ theme }) => theme.colors.black};
`

export const CartTaxesAndFees = styled.div`
	display: flex;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.sm700};
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

export const CheckoutDisabled = styled.div`
	color: white;
	display: flex;
	row-gap: 16px;
	margin-top: 8px;
	padding: 8px 16px;
	border-radius: 4px;
	flex-direction: column;
	justify-content: center;
	${({ theme }) => theme.other.typography.md600};
	background-color: ${({ theme }) => theme.colors.red[4]};
`
