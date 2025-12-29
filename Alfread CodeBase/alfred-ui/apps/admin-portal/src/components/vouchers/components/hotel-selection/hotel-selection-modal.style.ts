import styled from "@emotion/styled"
import { Flex } from "@mantine/core"

export const HotelSelectionContainer = styled(Flex)`
	flex-direction: column;
	width: 100%;
	max-height: 70vh
	display: flex;
`

export const HotelListContainer = styled(Flex)`
	flex-direction: column;
	width: 100%;
	overflow-y: auto;
	padding: 0 16px;
	margin: 8px 0;
	flex: 1;

	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	&::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 4px;
	}
`

export const SelectAllContainer = styled(Flex)`
	padding: 16px;
	border-bottom: 1px solid #e9ecef;
	background: white;
	position: sticky;
	top: 0;
	z-index: 1;
`

export const HotelListItemContainer = styled(Flex)`
	padding: 12px 0;
	border-bottom: 1px solid #e9ecef;
	width: 100%;

	&:last-child {
		border-bottom: none;
	}
`

export const HotelNameContainer = styled(Flex)`
	align-items: center;
	gap: 12px;
	width: 100%;
`

export const HotelName = styled.div`
	font-size: 14px;
	color: #1a1b1e;
	flex: 1;
`

export const ModalFooterContainer = styled(Flex)`
	justify-content: end;
	padding: 12px 16px;
	gap: 16px;
	margin-top: auto;
	background: white;
`
