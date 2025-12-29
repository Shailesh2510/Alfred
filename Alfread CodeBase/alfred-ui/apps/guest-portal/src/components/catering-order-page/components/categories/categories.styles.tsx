import styled from "@emotion/styled"

export const CategoriesContainer = styled.div<{ isScrollable: boolean }>`
	overflow-x: ${({ isScrollable }) => (isScrollable ? "scroll" : "hidden")};
	padding: 8px;
	gap: 10px;
	display: flex;
	flex-direction: row;
`
