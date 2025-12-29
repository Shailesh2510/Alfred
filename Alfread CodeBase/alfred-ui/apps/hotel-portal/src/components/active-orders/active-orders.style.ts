import styled from "@emotion/styled"
import { Grid } from "@mantine/core"

export const OrdersColumnContainer = styled.div`
	display: flex;
	height: 100%;
	flex-direction: column;
	font-size: 15px;
	border-right: 1px solid ${({ theme }) => theme.colors.gray[5]};
`

export const OrdersColumnHeader = styled.div`
	padding: 24px 16px;
	font-size: 15px;
	font-weight: 700;
	border-bottom: 1px solid ${({ theme }) => theme.colors.gray[5]};
`

export const OrdersContainer = styled.div`
	display: flex;
	padding: 16px;
	flex-direction: column;
`

export const StyledGrid = styled(Grid)`
	height: calc(100vh - 160px);
`
export const NoOrdersMessage = styled.div`
	text-align: center;
	padding: 16px;
	color: ${({ theme }) => theme.colors.gray[6]};
`
