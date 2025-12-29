import styled from "@emotion/styled"
import { Accordion, Tabs } from "@mantine/core"

export const MenuPageContainer = styled.div``

export const AddCatalougeContainer = styled.div`
	width: 100%;
	height: 64px;
	display: flex;
	padding: 0 24px;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid ${({ theme }) => theme.colors.gray[5]};
`
export const StyledTabs: any = styled(Tabs)<{ active: boolean }>`
	.mantine-Tabs-root {
		height: 100%;
	}
	.mantine-Tabs-panel {
		padding: 0;
		height: 100%;
	}
	.mantine-Tabs-tabsList {
		height: 166px;
		padding-left: 24px;
		background: ${({ theme }) => theme.colors.gray[0]};
		display: flex;
		overflow-x: auto;
		overflow-y: hidden;
		flex-wrap: nowrap;
		scrollbar-width: auto;
		-webkit-overflow-scrolling: touch;
		&::-webkit-scrollbar {
			height: 8px;
		}
		&::-webkit-scrollbar-thumb {
			background-color: ${({ theme }) => theme.colors.gray[4]};
			border-radius: 4px;
		}
		&::-webkit-scrollbar-track {
			background-color: ${({ theme }) => theme.colors.gray[2]};
		}
	}
`

export const StyledTab: any = styled(Tabs.Tab)<{ active: boolean }>`
	height: 150px;
	min-width: 200px;
	flex: 0 0 auto;
	padding: 16px;
	margin-top: 16px;
	flex-shrink: 0;
	&[data-active="true"] {
		color: black;
		background: white;
		${props => props.theme.other.typography.md600};
	}
`

export const MenuTabContainer = styled.div`
	width: 200px;
	display: flex;
	flex-direction: column;
`

export const MenuTitle = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${props => props.theme.other.typography.md700};
`

export const MenuTime = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${props => props.theme.other.typography.xs400};
`

export const RestaurantTitle = styled.div`
	color: ${({ theme }) => theme.colors.dark[6]};
	${props => props.theme.other.typography.sm700};
`

export const RestaurantID = styled.div`
	color: ${({ theme }) => theme.colors.dark[2]};
	${props => props.theme.other.typography.sm400};
`

export const StyledAccordion: any = styled(Accordion)`
	.mantine-Accordion-item {
		margin: 24px;
		border-radius: 8px;
		border: 1px solid ${({ theme }) => theme.colors.gray[4]};
	}
	.mantine-Accordion-control {
		border-radius: 8px;
		justify-content: space-between;
	}
	.mantine-Accordion-label {
		display: flex;
		align-items: center;
		${props => props.theme.other.typography.md500};
	}
	.mantine-Accordion-content {
		padding: 0;
	}
`
