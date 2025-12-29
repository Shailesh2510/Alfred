import styled from "@emotion/styled"
import { Header, Image } from "@mantine/core"
interface HeaderLogoProps {
	lg?: boolean
	theme?: any
}
export const StyledHeader: any = styled(Header)`
	z-index: 2;
	padding: 0;
	display: flex;
	background: white;
	justify-content: space-between;
	border-bottom: 1px solid ${({ theme }) => theme.colors.gray[5]};
	box-shadow: 0px 7px 7px -5px rgba(0, 0, 0, 0.04),
		0px 10px 15px -5px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.05);
`

export const CurrentHotel = styled.div`
	${({ theme }) => theme.other.typography.lg700};
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	max-height: 48px;
`

export const MainMenu = styled.div`
	width: 100%;
	display: flex;
	padding-left: 24px;
	align-items: center;
	min-width: 0;
`
export const HeaderLogo = styled.div<HeaderLogoProps>`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	padding-left: ${({ lg }) => (lg ? "6px" : "24px")};
	min-width: ${({ lg }) => (lg ? "70px" : "250px")};
	background: ${({ theme }) => theme.colors.gray[0]};
	border-right: 1px solid ${({ theme }) => theme.colors.gray[4]};

	@media (max-width: 768px) {
		min-width: 70px;
		padding: 0 8px;
		align-items: center;
	}
`
export const MobileFlex = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
`

export const HamburgerButton = styled.button`
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

export const ProfileSection: any = styled.div`
	display: flex;
	background: white;
	margin: 0 16px;
	align-items: center;
	justify-content: flex-end;
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
export const MobileProfileInfo = styled.div`
	padding: 12px 20px;
	display: flex;
	flex-direction: column;
	gap: 4px;
`

export const MerchantRole: any = styled.div`
	color: ${({ theme }) => theme.colors.gray[5]};
	${({ theme }) => theme.other.typography.sm400};
`

export const ProfileImage: any = styled(Image)`
	margin-left: 12px;
	border-radius: 40px;
	width: 42px !important;
	height: 42px !important;
	border: 1px solid ${({ theme }) => theme.colors.gray[5]};
`
