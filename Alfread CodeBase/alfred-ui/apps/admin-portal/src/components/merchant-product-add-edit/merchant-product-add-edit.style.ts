import styled from "@emotion/styled"

export const AddEditProductContainer = styled.div`
	height: 100%;
	display: flex;
	padding: 24px;
	position: relative;
	flex-direction: column;
	justify-items: space-between;
`

export const AddEditProductFooter = styled.div`
	width: 100%;
	height: 70px;
	padding: 16px;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	box-shadow: 0px -7px 7px -5px rgba(0, 0, 0, 0.04),
		0px -10px 15px -5px rgba(0, 0, 0, 0.05), 0px -1px 3px rgba(0, 0, 0, 0.05);
`

export const ProductStockLabel: any = styled.div<{ outOfStock: boolean }>`
	color: ${({ theme }) => theme.colors.black};
	${props => props.theme.other.typography.md400};
	b {
		text-transform: uppercase;
		color: ${({ outOfStock, theme }) =>
			outOfStock ? theme.colors.red[5] : theme.colors.green[5]};
		${props => props.theme.other.typography.md400};
	}
`

export const InStockAfterLabel: any = styled.div<{ outOfStock: boolean }>`
	color: ${({ theme }) => theme.colors.black};
	${props => props.theme.other.typography.md400};
	b {
		color: ${({ outOfStock, theme }) =>
			outOfStock ? theme.colors.red[5] : theme.colors.green[5]};
		${props => props.theme.other.typography.md400};
	}
`
