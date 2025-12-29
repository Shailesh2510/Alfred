import styled from "@emotion/styled"
import { Header, Image, keyframes } from "@mantine/core"

export const StyledHeader = styled(Header)`
	z-index: 2;
	padding: 0;
	display: flex;
	background: white;
	justify-content: space-between;
	border-bottom: 1px solid ${({ theme }) => theme.colors.gray[5]};
	box-shadow: 0px 7px 7px -5px rgba(0, 0, 0, 0.04),
		0px 10px 15px -5px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.05);
`

export const HeaderLogo: any = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	padding-left: ${({ lg }: any) => (lg ? "6px" : "24px")};
	min-width: ${({ lg }: any) => (lg ? "70px" : "300px")};
	background: ${({ theme }) => theme.colors.gray[0]};
	border-right: 1px solid ${({ theme }) => theme.colors.gray[4]};
`

export const ProfileSection = styled.div`
	display: flex;
	background: white;
	margin: 0 16px;
	align-items: center;
	justify-content: flex-end;
`

export const ImpersonateContainer = styled.div`
	display: flex;
	column-gap: 8px;
	align-items: center;
`

export const ProfileInfo = styled.div`
	display: flex;
	padding: 0 12px;
	align-items: flex-end;
	flex-direction: column;
`

export const MerchantName = styled.div`
	color: ${({ theme }) => theme.colors.gray[7]};
	${({ theme }) => theme.other.typography.sm600};
`

export const MerchantRole = styled.div`
	color: ${({ theme }) => theme.colors.gray[5]};
	${({ theme }) => theme.other.typography.sm400};
`

export const ProfileImage = styled(Image)`
	margin-left: 12px;
	border-radius: 40px;
	width: 42px !important;
	height: 42px !important;
	border: 1px solid ${({ theme }) => theme.colors.gray[5]};
`
const changeColor = keyframes`
  0% { background-color: red; } 
  100% { background-color: white; } 
`
export const PendingOrders: any = styled.div`
	display: flex;
	margin: 12px;
	color: black;
	padding: 8px 12px;
	align-items: center;
	justify-content: center;
	background-color: black;
	animation-name: ${changeColor};
	animation-duration: 2s;
	animation-iteration-count: infinite;
	${({ theme }) => theme.other.typography.xxl700};
`
