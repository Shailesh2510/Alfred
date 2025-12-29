import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { Header } from "@mantine/core"

export const StyledHeader: any = styled(Header)`
	z-index: 2;
	padding: 0;
	display: flex;
	background: white;
	border-bottom: 1px solid ${({ theme }) => theme.colors.gray[5]};
	box-shadow: 0px 7px 7px -5px rgba(0, 0, 0, 0.04),
		0px 10px 15px -5px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.05);
`

export const HeaderLogo: any = styled.div<{ lg?: boolean }>`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	padding-left: ${({ lg }: any) => (lg ? "6px" : "24px")};
	min-width: ${({ lg }: any) => (lg ? "70px" : "300px")};
	background: ${({ theme }) => theme.colors.gray[0]};
	border-right: 1px solid ${({ theme }) => theme.colors.gray[4]};

	@media (max-width: 768px) {
		min-width: 70px;
		padding: 0 8px;
		align-items: center;
	}
`

export const MobileFlex: any = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
`

export const HamburgerButton: any = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	padding: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: ${({ theme }) => theme.colors.gray[7]};

	&:hover {
		background: ${({ theme }) => theme.colors.gray[1]};
		border-radius: 4px;
	}
`

export const MainMenu: any = styled.div`
	width: 100%;
	display: flex;
	padding-left: 24px;
	align-items: center;
	justify-content: flex-start;
	min-width: 0;
`

export const ProfileSection: any = styled.div`
	display: flex;
	background: white;
	margin: 0 16px;
	align-items: center;
	justify-content: flex-end;
`
export const MobileProfileInfo: any = styled.div`
	padding: 12px 20px;
	display: flex;
	flex-direction: column;
	gap: 4px;
`
export const ProfileInfo: any = styled.div`
	display: flex;
	padding: 0 12px;
	align-items: flex-end;
	flex-direction: column;
`

export const MerchantName: any = styled.div`
	color: ${({ theme }) => theme.colors.gray[7]};
	${({ theme }) => theme.other.typography.sm600};
`

export const MerchantRole: any = styled.div`
	color: ${({ theme }) => theme.colors.gray[5]};
	${({ theme }) => theme.other.typography.sm400};
`

export const CurrentMerchant: any = styled.div`
	${({ theme }) => theme.other.typography.lg700};
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	max-height: 48px;
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
