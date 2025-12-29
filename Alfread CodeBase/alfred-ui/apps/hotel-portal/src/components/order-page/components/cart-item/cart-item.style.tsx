import styled from "@emotion/styled"
import { List } from "@mantine/core"

export const CartItemContainer = styled.div`
	padding: 16px 0;
`

export const ProductName = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.lg600};
	color: ${({ theme }) => theme.colors.dark[6]};
`

export const ItemOption = styled(List.Item)`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm400};
	b {
		${({ theme }) => theme.other.typography.sm700};
	}
`

export const ImageContainer = styled.div`
	position: relative;
`
