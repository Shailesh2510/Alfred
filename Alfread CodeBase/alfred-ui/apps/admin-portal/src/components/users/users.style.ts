import styled from "@emotion/styled"
import { Switch } from "@mantine/core"

export const UsersDateLabel = styled.div`
	color: ${({ theme }) => theme.colors.dark[5]};
	${({ theme }) => theme.other.typography.sm500};
`

export const UserDetailContainer = styled.div`
	display: flex;
	flex-direction: column;
`

export const UserName = styled.div`
	color: ${({ theme }) => theme.colors.gray[9]};
	${({ theme }) => theme.other.typography.sm400};
`

export const UserEmail = styled.div`
	color: ${({ theme }) => theme.colors.gray[5]};
	${({ theme }) => theme.other.typography.sm400};
`

export const UserStatus = styled.div`
	color: ${({ theme }) => theme.colors.gray[9]};
	${({ theme }) => theme.other.typography.sm500};
`

export const StyledSwitch = styled(Switch)`
	.mantine-Switch-body {
		width: 36px;
		height: 20px;
	}
`
