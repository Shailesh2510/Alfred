import styled from "@emotion/styled"
import { Switch } from "@mantine/core"

export const StatusTitle = styled.div`
	color: ${({ theme }) => theme.colors.gray[9]};
	${({ theme }) => theme.other.typography.md500};
`

export const StatusLabel = styled.div`
	color: ${({ theme }) => theme.colors.dark[5]};
	${({ theme }) => theme.other.typography.sm500};
`

export const StatusContainer = styled.div`
	padding: 16px 24px;
`

export const StyledSwitch = styled(Switch)`
	.mantine-Switch-body {
		width: 44px;
		height: 22px;
	}
`

export const StatusSwitchContainer = styled.div`
	width: 100%;
	height: 82px;
	padding: 16px;
	display: flex;
	border-radius: 8px;
	margin: 16px 0 32px 0;
	background: ${({ theme }) => theme.colors.indigo[0]};
	border: 1px solid ${({ theme }) => theme.colors.gray[4]};
`

export const StatusSwitchLabelContainer = styled.div`
	display: flex;
	margin-left: 12px;
	flex-direction: column;
`

export const StatusSwitchLabel = styled.div`
	color: ${({ theme }) => theme.colors.gray[9]};
	${({ theme }) => theme.other.typography.md500};
`

export const StatusSwitchDescription = styled.div`
	color: ${({ theme }) => theme.colors.gray[6]};
	${({ theme }) => theme.other.typography.md400};
`
