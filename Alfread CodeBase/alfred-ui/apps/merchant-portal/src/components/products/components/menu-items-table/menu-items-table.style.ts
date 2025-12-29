import styled from "@emotion/styled"
import { Image } from "@mantine/core"

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

export const ModifierContainer = styled.div`
	border-bottom: 1px solid ${({ theme }) => theme.colors.gray[3]};
`

export const ModifierOption = styled.div`
	display: flex;
	margin-left: 40px;
	justify-content: space-between;
`
