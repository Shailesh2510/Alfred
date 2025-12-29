import styled from "@emotion/styled"
import { Grid } from "@mantine/core"
import { DateTimePicker } from "@mantine/dates"

export const OrderPageContainer = styled.div`
	height: 100%;
	background: ${({ theme }) => theme.colors.white};
`

export const MenuAndCartContainer = styled.div`
	padding: 0 16px;
	position: relative;
`

export const GoBackToCart = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.headings.h3};
`

export const StyledDateTimePicker: any = styled(DateTimePicker as any)`
	.mantine-Input-input {
		color: white;
		${({ theme }) => theme.other.typography.md600};
	}
	.mantine-DateTimePicker-input {
		border-radius: 4px;
		${({ theme }) => theme.other.typography.lg700};
		border-color: ${({ theme }) => theme.colors.blue[5]};
		background-color: ${({ theme }) => theme.colors.blue[5]};
	}
	.mantine-DateTimePicker-placeholder {
		color: white;
		${({ theme }) => theme.other.typography.lg700};
	}
	.mantine-ActionIcon-root {
		color: white;
	}
`

export const ScheduledDate = styled.div`
	color: ${({ theme }) => theme.colors.gray[7]};
	display: flex;
	margin-top: 8px;
	padding: 8px 16px;
	border-radius: 4px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.md600};
	background-color: ${({ theme }) => theme.colors.green[1]};
`

export const CheckOutTimerContainer = styled.div`
	color: red;
	border: 2px solid red;
	padding: 4px;
	${({ theme }) => theme.other.typography.sm400};
	display: flex;
	align-items: center;
`

export const NoMerchantAvailable = styled(Grid)`
	margin-top: 16px;
	font-weight: 500;
	font-size: 18px;
`
