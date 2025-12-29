import styled from "@emotion/styled"
import { List } from "@mantine/core"

interface StyledProps {
	$sm: boolean
}

export const CheckoutItemContainer = styled.div`
	padding: 16px 0;
`

export const ProductDetails = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
`

export const ItemOption = styled(List.Item)`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm400};
	b {
		${({ theme }) => theme.other.typography.sm700};
	}
`
export const ProductName = styled("div", {
	shouldForwardProp: prop => prop !== "$sm"
})<StyledProps>`
	max-width: ${({ $sm }) => ($sm ? "13rem" : "17rem")};
	${({ theme }) => theme.other.typography.md700};
	color: ${({ theme }) => theme.colors.dark[6]};
`

export const ProductPrice = styled.div`
	${({ theme }) => theme.other.typography.md700};
	color: ${({ theme }) => theme.colors.dark[6]};
`
