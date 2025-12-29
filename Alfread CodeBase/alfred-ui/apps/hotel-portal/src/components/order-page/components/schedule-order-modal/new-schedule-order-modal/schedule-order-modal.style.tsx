import styled from "@emotion/styled"
import { isMobileOnly } from "react-device-detect"

export const ProductName = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.headings.h1};
`

export const ProductDescription = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm400};
`

export const ModalSubtitle = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.lg700};
`

export const SectionSubtitle = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.sm700};
`

export const PriceAfterDiscount = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) => theme.other.typography.headings.h3};
`

export const ModifierOptionPrice = styled.div`
	color: ${({ theme }) => theme.colors.black};
	${({ theme }) =>
		isMobileOnly ? theme.other.typography.sm700 : theme.other.typography.md700};
`

export const DatesContainerNew = styled.div`
	overflow-x: scroll;
	padding: 10px;
	gap: 10px;
	display: flex;
	flex-direction: row;
`
