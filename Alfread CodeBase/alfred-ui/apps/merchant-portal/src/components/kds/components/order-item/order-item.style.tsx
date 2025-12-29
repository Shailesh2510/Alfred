import { ORDER_STATUS } from "@/shared-constants"
import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const OrderContainer: any = styled.div<{ status: string }>`
	display: flex;
	width: 350px;
	height: fit-content;
	margin: 0 35px 47px 0;
	flex-direction: column;
	border-radius: 8px;
	${props =>
		props.status === ORDER_STATUS.PENDING.value &&
		css`
			background-color: ${props.theme.colors.yellow[0]};
		`}
	${props =>
		props.status === ORDER_STATUS.CONFIRMED.value &&
		css`
			background-color: ${props.theme.colors.orange[0]};
		`}
  ${props =>
		props.status === ORDER_STATUS.PREPARATION.value &&
		css`
			background-color: ${props.theme.colors.red[0]};
		`}
  ${props =>
		props.status === ORDER_STATUS.IN_DELIVERY.value &&
		css`
			background-color: ${props.theme.colors.primary[0]};
		`}
  ${props =>
		props.status === ORDER_STATUS.DELIVERED.value &&
		css`
			background-color: ${props.theme.colors.green[0]};
		`}
  ${props =>
		props.status === ORDER_STATUS.CANCELED.value &&
		css`
			background-color: ${props.theme.colors.gray[0]};
		`}
  ${props =>
		props.status === ORDER_STATUS.SCHEDULED.value &&
		css`
			background-color: ${props.theme.colors.violet[0]};
		`}
  border: 1px solid ${({ theme }) => theme.colors.gray[4]};
`

export const OrderHeader: any = styled.div<{ status: string }>`
	margin: 2px;
	padding: 12px;
	display: flex;
	flex-direction: column;
	color: white;
	border-radius: 6px 6px 0px 0px;
	${props =>
		props.status === ORDER_STATUS.PENDING.value &&
		css`
			background-color: ${props.theme.colors.yellow[5]};
		`}
	${props =>
		props.status === ORDER_STATUS.CONFIRMED.value &&
		css`
			background-color: ${props.theme.colors.orange[6]};
		`}
  ${props =>
		props.status === ORDER_STATUS.PREPARATION.value &&
		css`
			background-color: ${props.theme.colors.red[7]};
		`}
  ${props =>
		props.status === ORDER_STATUS.IN_DELIVERY.value &&
		css`
			background-color: ${props.theme.colors.primary[6]};
		`}
  ${props =>
		props.status === ORDER_STATUS.DELIVERED.value &&
		css`
			background-color: ${props.theme.colors.green[8]};
		`}
  ${props =>
		props.status === ORDER_STATUS.CANCELED.value &&
		css`
			background-color: ${props.theme.colors.gray[6]};
		`}
  ${props =>
		props.status === ORDER_STATUS.SCHEDULED.value &&
		css`
			background-color: ${props.theme.colors.violet[8]};
		`}
`

export const OrderDetailContainer: any = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	justify-content: space-between;
`

export const OrderIDStatusContainer: any = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`
export const OrderID: any = styled.div`
	${({ theme }) => theme.other.typography.lg700};
`

export const OrderStatus: any = styled.div`
	${({ theme }) => theme.other.typography.md500};
`

export const OrderTimeContainer: any = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
	white-space: nowrap;
	${({ theme }) => theme?.other.typography.md400};
`

export const OrderTime: any = styled.div`
	${({ theme }) => theme.other.typography.md400};
	font-weight: bold;
	margin-right: 4px;
`

export const OrderTimeLabel: any = styled.div`
	${({ theme }) => theme.other.typography.md400};
`

export const OrderBody: any = styled.div`
	padding: 24px;
`

export const OrderItemContainer: any = styled.div``

export const OrderItem: any = styled.div`
	display: flex;
`

export const OrderItemQuantity: any = styled.div`
	margin-right: 16px;
	${({ theme }) => theme.other.typography.lg600};
`

export const OrderItemName: any = styled.div`
	${({ theme }) => theme.other.typography.lg600};
`

export const OrderItemModifierList: any = styled.ul`
	margin: 0;
	padding-left: 42px;
`

export const OrderItemModifierContainer: any = styled.div``

export const OrderItemModifier: any = styled.li`
	${({ theme }) => theme.other.typography.lg400};
`

export const OrderItemModifierName: any = styled.div`
	${({ theme }) => theme.other.typography.lg600};
`

export const OrderItemModifierOptionList: any = styled.ul`
	margin: 0;
	padding-left: 24px;
`

export const OrderItemModifierOptionContainer: any = styled.div``

export const OrderBodyContainer: any = styled.div`
	&:hover {
		cursor: pointer;
	}
`

export const OrderItemModifierOption: any = styled.li`
	display: flex;
	padding-left: 0;
	${({ theme }) => theme.other.typography.lg400};
`

export const OrderItemModifierOptionQuantity: any = styled.div`
	margin-right: 16px;
	${({ theme }) => theme.other.typography.lg600};
`

export const OrderItemModifierOptionName: any = styled.div`
	${({ theme }) => theme.other.typography.lg600};
`

export const OrderCommentContainer: any = styled.div`
	padding: 8px 16px;
	border-top: 1px solid ${({ theme }) => theme.colors.gray[4]};
`

export const OrderCommentTitle: any = styled.div`
	${({ theme }) => theme.other.typography.md600};
`

export const OrderComment: any = styled.div`
	${({ theme }) => theme.other.typography.md400};
`

export const OrderFooter: any = styled.div`
	padding: 16px;
	border-top: 1px solid ${({ theme }) => theme.colors.gray[4]};
`
