import styled from "@emotion/styled"
import { Timeline } from "@mantine/core"

export const OrderStatusContainer = styled.div`
	height: 100%;
	padding: 24px;
	background-color: ${props => props.theme.colors.white};
`

export const GoBackToCart = styled.div`
	margin-left: 8px;
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.headings.h3};
`

export const OrderStatusChildContainer = styled.div`
	padding: 16px;
	min-width: 350px;
	border-radius: 8px;
	margin-bottom: 16px;
	border: 1px solid ${({ theme }) => theme.colors.dark[0]};
`

export const StyledTimelineItem = styled(Timeline.Item)`
	.mantine-Timeline-itemTitle {
		${({ theme }) => theme.other.typography.md600};
	}
	.mantine-Timeline-itemContent {
		${({ theme }) => theme.other.typography.xs400};
	}
`

export const OrderSuccessMessage = styled.div`
	margin-bottom: 24px;
	color: ${({ theme }) => theme.colors.green[4]};
	${({ theme }) => theme.other.typography.headings.h1};
`

export const OrderCanceledMessage = styled.div`
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

export const OrderInfoContainer = styled.div`
	padding: 16px;
	border-radius: 8px;
	margin-bottom: 16px;
	border: 1px solid ${({ theme }) => theme.colors.dark[0]};
`

export const OrderInfoLabel = styled.div`
	${({ theme }) => theme.other.typography.md500};
`

export const OrderAmountLabel = styled.div`
	${({ theme }) => theme.other.typography.lg700};
`

export const OrderModifierInfoLabel = styled.div`
	margin-left: 24px;
	display: list-item;
	${({ theme }) => theme.other.typography.sm400};
`

export const OrderModifierInfoValue = styled.div`
	${({ theme }) => theme.other.typography.xs400};
`
