import styled from "@emotion/styled"

export const OrderContainer = styled.div`
	padding: 24px;
`

export const GuestInformationContainer = styled.div`
	display: flex;
	flex-direction: column;
`

export const GuestInfo = styled.div``

export const FieldLabel = styled.div`
	color: ${({ theme }) => theme.colors.gray[6]};
	${({ theme }) => theme.other.typography.md700};
`

export const FieldValue = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.md500};
`

export const OrderItemQuantity = styled.div`
	margin-right: 20px;
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md600};
`

export const OrderItemLabel = styled.div`
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md600};
`

export const OrderItemPrice = styled.div`
	margin-left: 40px;
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md600};
`

export const OrderModifierLabel = styled.div`
	margin-left: 20px;
	display: list-item;
	list-style-position: inside;
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md400};
`

export const OrderModifierOptionQuantity = styled.div`
	margin-left: 40px;
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md400};
`

export const OrderModifierOptionLabel = styled.div`
	margin-left: 40px;
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md400};
`

export const OrderModifierOptionPrice = styled.div`
	margin-left: 40px;
	color: ${({ theme }) => theme.colors.dark[6]};
	${({ theme }) => theme.other.typography.md400};
`

export const OrderSubtotal = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm700};
`

export const OrderTax = styled.div`
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

export const VoucherFieldValue = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm400};
`

export const VoucherFieldLabel = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm700};
`

export const OrderTotal = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.headings.h2};
`

export const OrderCommentLabel = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.md600};
`

export const OrderComment = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.md400};
`
