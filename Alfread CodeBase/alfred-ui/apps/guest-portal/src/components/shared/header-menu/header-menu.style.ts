import styled from "@emotion/styled"
import { Header } from "@mantine/core"

interface StyledProps {
	$lg: boolean
}

export const StyledHeader = styled(Header, {
	shouldForwardProp: prop => prop !== "$lg"
})<StyledProps>`
	z-index: 2;
	display: flex;
	background: white;
	flex-direction: ${({ $lg }) => ($lg ? "column" : "row")};
	justify-content: ${({ $lg }) => ($lg ? "flex-start" : "space-between")};
	align-items: ${({ $lg }) => ($lg ? "stretch" : "center")};
	border-bottom: 1px solid ${({ theme }) => theme.colors.gray[5]};
	box-shadow: 0px 7px 7px -5px rgba(0, 0, 0, 0.04),
		0px 10px 15px -5px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.05);
`

export const LogoAndHotelNameWrapper = styled("div", {
	shouldForwardProp: prop => prop !== "$lg"
})<StyledProps>`
	display: flex;
	width: 100%;
	flex-direction: ${({ $lg }) => ($lg ? "column" : "row-reverse")};
`

export const HeaderLogo = styled("div", {
	shouldForwardProp: prop => prop !== "$lg"
})<StyledProps>`
	display: flex;
	align-items: center;
	justify-content: ${({ $lg }) => ($lg ? "center" : "flex-start")};
	flex-shrink: 0;
`

export const HotelName = styled("div", {
	shouldForwardProp: prop => prop !== "$lg"
})<StyledProps>`
	display: flex;
	align-items: center;
	justify-content: ${({ $lg }) => ($lg ? "center" : "flex-start")};
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	flex: 1;
	min-width: 0;
	${({ theme }) => theme.other.typography.md700};
`

export const GXPhoneNumber = styled("div", {
	shouldForwardProp: prop => prop !== "$lg"
})<StyledProps>`
	display: flex;
	align-items: center;
	white-space: nowrap;
	justify-content: center;
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.md400};
	a {
		text-decoration: none;
	}
`

export const HotelNameText = styled.div`
	max-width: 90vw;
	overflow: hidden;
	text-overflow: ellipsis;
`
