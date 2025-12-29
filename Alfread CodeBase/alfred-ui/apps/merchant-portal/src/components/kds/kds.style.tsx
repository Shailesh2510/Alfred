import styled from "@emotion/styled"
import { Flex, Tabs } from "@mantine/core"

export const StyledTabs: any = styled(Tabs)<{ active: boolean }>`
	.mantine-Tabs-root {
		height: 100%;
	}
	.mantine-Tabs-panel {
		height: 100%;
	}
	.mantine-Tabs-tabsList {
		height: 62px;
		padding-top: 14px;
		padding-left: 24px;
		background: ${({ theme }) => theme.colors.gray[0]};
	}
`

export const StyledTab: any = styled(Tabs.Tab)<{ active: boolean }>`
	height: 48px;
	min-width: 150px;
	color: ${({ theme }) => theme.colors.gray[5]};
	${props => props.theme.other.typography.md600};
	&[data-active="true"] {
		color: black;
		background: white;
		${props => props.theme.other.typography.md600};
	}
`

export const LastUpdatedContainer: any = styled.div`
	display: flex;
	justify-content: flex-end;
	padding-right: 12px;
`

export const StyledFlex: any = styled(Flex)`
	padding: 15px 24px 24px 24px;
	flex-wrap: wrap;
`
