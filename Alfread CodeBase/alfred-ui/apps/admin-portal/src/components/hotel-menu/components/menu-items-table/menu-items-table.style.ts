import styled from "@emotion/styled"
import { Image } from "@mantine/core"

export const ProductID = styled.div`
	${({ theme }) => theme.other.typography.sm500};
`

export const ProductDetailContainer = styled.div`
	display: flex;
	align-items: center;
`

export const ProductImage = styled(Image)`
	width: 42px !important;
	height: 42px !important;
	margin-right: 8px;
	border-radius: 5px;
`

export const ProductName = styled.div`
	${({ theme }) => theme.other.typography.lg600};
`

export const ProductPrice = styled.div`
	${({ theme }) => theme.other.typography.md700};
`
