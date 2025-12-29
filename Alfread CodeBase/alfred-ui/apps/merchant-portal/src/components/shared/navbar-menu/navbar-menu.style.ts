import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Navbar } from "@mantine/core"
import Link from "next/link"

export const StyledLink: any = styled(Link)`
	text-decoration: none;
`

export const StyledNavbar: any = styled(Navbar)<{
	lg: boolean
	isOpen?: boolean
}>`
	z-index: 200;
	height: 100%;
	padding: 12px;
	width: ${({ lg }: any) => (lg ? `70px` : "300px")};
	background: ${({ theme }) => theme.colors.gray[0]};
	border-right: 1px solid ${({ theme }) => theme.colors.gray[4]};

	@media (max-width: 1200px) {
		width: 70px;
		height: 100vh;
		position: fixed;
		top: 70px;
		left: 0;
		transform: translateX(${({ isOpen }) => (isOpen ? "0" : "-100%")});
		transition: transform 0.3s ease;
		overflow-y: auto;
	}
`

export const NavbarMenuContainer: any = styled.div``

export const NavbarMenuItem: any = styled.div`
	display: flex;
	cursor: pointer;
	width: 100%;

	@media (max-width: 1200px) {
		justify-content: center;
		padding: 8px 0;
	}
`

export const NavbarMenuItemIcon: any = styled.div<{ active?: boolean }>`
	min-width: 40px;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	${({ active, theme }) =>
		active
			? css`
					color: ${theme.colors.indigo[9]};
					background: ${theme.colors.gray[1]};
					border-left: 2px solid ${theme.colors.indigo[9]};
			  `
			: css`
					color: ${theme.colors.dark[6]};
					background: ${theme.colors.gray[0]};
			  `};

	@media (max-width: 1200px) {
		margin-right: 0;
		width: 100%;
		height: 32px;
		background: none;
		border-left: none;
	}
`

export const NavbarMenuItemText: any = styled.div<{ active?: boolean }>`
	width: 100%;
	height: 48px;
	display: flex;
	align-items: center;
	padding-left: 8px;
	${({ theme }) => theme.other.typography.sm500};
	${({ active, theme }) =>
		active
			? css`
					color: ${theme.colors.indigo[9]};
					background: ${theme.colors.gray[1]};
			  `
			: css`
					color: ${theme.colors.dark[6]};
					background: ${theme.colors.gray[0]};
			  `};

	@media (max-width: 1200px) {
		display: none;
	}
`

export const NavbarMobileContainer: any = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;

	@media (min-width: 1201px) {
		flex-direction: row;
		width: auto;
	}
`

export const NavbarMobileLabel: any = styled.div<{ active?: boolean }>`
	text-align: center;
	margin-top: 4px;
	font-size: 12px;
	${({ active, theme }) =>
		active
			? css`
					color: ${theme.colors.indigo[9]};
			  `
			: css`
					color: ${theme.colors.dark[6]};
			  `};

	@media (min-width: 1200px) {
		display: none;
	}
`

export const MobileProfileInfo: any = styled.div`
	padding: 12px 20px;
	display: flex;
	flex-direction: column;
	gap: 4px;
`
