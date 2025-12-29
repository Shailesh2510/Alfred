import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Navbar } from "@mantine/core"
import Link from "next/link"

export const StyledLink = styled(Link)`
	text-decoration: none;
`

export const StyledNavbar: any = styled(Navbar)`
	z-index: 1;
	height: 100%;
	padding: 12px;
	width: ${({ lg }: any) => (lg ? `70px` : "300px")};
	background: ${({ theme }) => theme.colors.gray[0]};
	border-right: 1px solid ${({ theme }) => theme.colors.gray[4]};
`

export const NavbarMenuContainer = styled.div``

export const NavbarMenuItem: any = styled.div`
	display: flex;
`

export const NavbarMenuItemIcon = styled.div<{ active?: boolean }>`
	min-width: 40px;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 2px;
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
`

export const NavbarMenuItemText = styled.div<{ active?: boolean }>`
	width: 100%;
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
`

// export const NavbarMenuSubItem: any = styled.div`
//   margin-left: 42px;
// `;

// export const NavbarMenuSubItemText = styled.div<{ active?: boolean }>`
//   width: 100%;
//   height: 48px;
//   display: flex;
//   align-items: center;
//   padding-left: 8px;
//   ${({ theme }) => theme.other.typography.sm500};
//   ${({ active, theme }) =>
//     active
//       ? css`
//           color: ${theme.colors.indigo[9]};
//           background: ${theme.colors.gray[1]};
//           border-left: 2px solid ${theme.colors.indigo[9]};
//         `
//       : css`
//           color: ${theme.colors.dark[6]};
//           background: ${theme.colors.gray[0]};
//         `};
// `;
