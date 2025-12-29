import styled from "@emotion/styled"

export const OrderContainer = styled.div<{ isRide: boolean }>`
	width: 100%;
	border-radius: 8px;
	margin-bottom: 16px;
	cursor: pointer;
	background: ${({ theme, isRide }) =>
		isRide ? theme.colors.lightBlue : theme.colors.lightYellow};
	border: 1px solid ${({ theme }) => theme.colors.gray[4]};
`

export const OrderHeader = styled.div`
	display: grid;
	flex-direction: column;
	padding: 8px 12px;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid ${({ theme }) => theme.colors.gray[4]};
`

export const OrderID = styled.div`
	${({ theme }) => theme.other.typography.md700}
`

export const OrderTime = styled.div`
	${({ theme }) => theme.other.typography.md700}
`

export const OrderBody = styled.div`
	height: auto;
	padding: 8px;
	border-bottom: 1px solid ${({ theme }) => theme.colors.gray[4]};
`

export const OrderInfoContainer = styled.div<{ isMobile: boolean }>`
	display: ${props => (props.isMobile ? "grid" : "flex")};
	flex-direction: ${props => (props.isMobile ? "column" : "row")};
`
export const ReferredByContainer = styled.div`
	display: "flex";
	flex-direction: "column";
`

export const OrderInfoLabel = styled.div`
	margin-right: 6px;
	${({ theme }) => theme.other.typography.sm400}
`

export const OrderInfoData = styled.div`
	${({ theme }) => theme.other.typography.sm700}
`

export const OrderFooter = styled.div`
	height: auto;
	padding: 8px;
`

export const OrderTotalPrice = styled.div`
	color: ${({ theme }) => theme.colors.gray[9]};
	${({ theme }) => theme.other.typography.md700};
`

export const OrderMerchantName = styled.div`
	margin-right: 5px;
	color: ${({ theme }) => theme.colors.gray[9]};
	${({ theme }) => theme.other.typography.sm700};
`
