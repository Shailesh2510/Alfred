import styled from "@emotion/styled"

export const ProductItemContainer = styled.div`
	display: flex;
	// flex-direction: column;
	padding: 16px;
	border-radius: 8px;
	height: 100%;
	justify-content: space-between;
	border: 1px solid ${({ theme }) => theme.colors.gray[2]};
	box-shadow: 0px 7px 7px -5px rgba(0, 0, 0, 0.04),
		0px 10px 15px -5px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.05);
`

export const ProductItemName = styled.div`
	${({ theme }) => theme.other.typography.lg700};
`

export const ProductItemDescription = styled.div`
	${({ theme }) => theme.other.typography.sm400};
`

export const ProductItemPrice = styled.div`
	${({ theme }) => theme.other.typography.md700};
	color: ${({ theme }) => theme.colors.black};
`

export const ImageContainer = styled.div`
	position: relative;
	display: flex;
	justify-content: center;
	width: 162px;
	height: 162px;
`
