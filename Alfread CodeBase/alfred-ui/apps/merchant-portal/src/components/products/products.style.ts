import styled from "@emotion/styled"
import { Tabs, Accordion } from "@mantine/core"

export const MenuPageContainer: any = styled.div``

export const AddCatalougeContainer: any = styled.div`
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
		height: 116px;
		padding-left: 24px;
		background: ${({ theme }) => theme.colors.gray[0]};
	}
`

export const StyledTab: any = styled(Tabs.Tab)<{ active: boolean }>`
	height: 100px;
	min-width: 200px;
	padding: 16px;
	margin-top: 16px;
	&[data-active="true"] {
		color: black;
		background: white;
		${props => props.theme.other.typography.md600};
	}
`

export const MenuTabContainer: any = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
`

export const MenuTitle: any = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${props => props.theme.other.typography.md700};
`

export const MenuTime: any = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${props => props.theme.other.typography.xs400};
`

export const AccordionStyled: any = styled(Accordion)`
	width: 100%;

	.mantine-Accordion-item {
		border: 1px solid ${({ theme }) => theme.colors.gray[3]};
		margin-bottom: 8px;
		border-radius: 4px;
	}

	.mantine-Accordion-control {
		padding: 16px;
	}

	.mantine-Accordion-content {
		padding: 16px;
	}
`

export const MobileMenuCard: any = styled.div`
	display: flex;
	padding: 12px;
	margin-bottom: 12px;
	border: 1px solid ${({ theme }) => theme.colors.gray[3]};
	border-radius: 8px;
	background: white;
`

export const MobileMenuImage: any = styled.div`
	width: 80px;
	height: 80px;
	margin-right: 12px;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 4px;
	}
`

export const MobileMenuContent: any = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`
export const MobileMenuItemName = styled.div`
	margin: 0 0 4px 0;
	${props => props.theme.other.typography.md600};
`
export const MobileMenuItemPrice = styled.div`
	margin: 0 0 8px 0;
	color: ${({ theme }) => theme.colors.gray[7]};
`
export const MobileMenuActions: any = styled.div`
	display: flex;
	justify-content: flex-end;
	margin-top: 8px;
`
