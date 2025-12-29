import styled from "@emotion/styled"
import { Flex } from "@mantine/core"

export const ReplicateModalContainer = styled(Flex)`
	flex-direction: column;
	gap: 6px;
	max-width: 100%;
	overflow-x: hidden;
`

export const FromContainer = styled(Flex)`
	align-items: center;
	gap: 8px;
`

export const FromLabel = styled.div`
	font-weight: 600;
	font-size: 14px;
`

export const FromHotelName = styled.div<{ $bold?: boolean }>`
	font-size: 14px;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-weight: ${props => (props.$bold ? 700 : 400)};
`

export const EligibleHotelsLabel = styled.div`
	font-weight: 500;
	font-size: 14px;
	padding-top: 16px;
	padding-bottom: 16px;
`

export const LoadingContainer = styled(Flex)`
	justify-content: center;
	align-items: center;
	height: 100px;
`

export const HotelListItemContainer = styled(Flex)`
	justify-content: space-between;
	width: 100%;
	align-items: center;
`

export const HotelNameContainer = styled(Flex)`
	align-items: center;
	gap: 12px;
	max-width: 100%;
`

export const HotelNameWrapper = styled(Flex)`
	align-items: center;
	white-space: nowrap;
	max-width: 90%;
`

export const ModalFooterContainer = styled(Flex)`
	justify-content: space-between;
`

export const StyledTooltip = {
	tooltip: {
		fontSize: "14px",
		padding: "0.25rem 0.5rem",
		zIndex: 1000
	}
}
