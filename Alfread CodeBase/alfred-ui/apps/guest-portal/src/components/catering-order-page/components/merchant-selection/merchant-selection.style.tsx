import styled from "@emotion/styled"
import { Grid } from "@mantine/core"

export const MerchantGrid = styled(Grid)`
	margin: 4px;
`

export const MerchantName = styled.div`
	font-weight: 500;
	font-size: medium;
`

export const MerchantAddress = styled.div`
	font-size: small;
`

export const MerchantSelectionDescription = styled(Grid)`
	padding: 16px;
	font-weight: 500;
	font-size: 18px;
	margin: 0 !important; // Override negative margins
`
export const MerchantDescription = styled.div`
	font-size: small;
	font-weight: 600;
	background-color: ${({ theme }) => theme.colors.gray[0]};
	color: ${({ theme }) => theme.colors.gray[8]};
	border-radius: 4px;
	padding: 2px 8px;
	width: fit-content;
`
