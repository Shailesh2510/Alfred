import styled from "@emotion/styled"

export const OrderContainer: any = styled.div`
	padding: 24px;
`

export const GuestInformationContainer: any = styled.div`
	display: flex;
	flex-direction: column;
`

export const GuestInfo = styled.div``

export const FieldLabel: any = styled.div`
	color: ${({ theme }) => theme.colors.gray[6]};
	${({ theme }) => theme.other.typography.md700};
`

export const FieldValue: any = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.md500};
`

export const OrderItemQuantity: any = styled.div`
	margin-right: 20px;
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md600};
`

export const OrderItemLabel: any = styled.div`
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md600};
`

export const OrderItemPrice: any = styled.div`
	margin-left: 40px;
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md600};
`

export const OrderModifierLabel: any = styled.div`
	margin-left: 20px;
	display: list-item;
	list-style-position: inside;
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md400};
`

export const OrderModifierOptionQuantity: any = styled.div`
	margin-left: 40px;
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md400};
`

export const OrderModifierOptionLabel: any = styled.div`
	margin-left: 40px;
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md400};
`

export const OrderModifierOptionPrice: any = styled.div`
	margin-left: 40px;
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md400};
`

export const OrderSubtotal: any = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm700};
`

export const OrderTax: any = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm700};
`

export const OrderDiscountAmount: any = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.sm700};
	color: ${({ theme }) => theme.colors.green[5]};
`

export const VoucherFieldValue: any = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm400};
`

export const VoucherFieldLabel: any = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm700};
`

export const OrderTotal: any = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.headings.h2};
`

export const OrderCommentLabel: any = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.md600};
`

export const OrderComment: any = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.md400};
`
