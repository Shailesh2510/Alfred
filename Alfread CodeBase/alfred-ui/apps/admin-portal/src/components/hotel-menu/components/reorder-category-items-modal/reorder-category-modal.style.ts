import styled from "@emotion/styled"

export const MenuItemsContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 10px;
	background-color: #f9fafb;
	border-radius: 8px;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`

export const MenuItem = styled.div`
	display: flex;
	align-items: center;
	padding: 12px 16px;
	background-color: #ffffff;
	border-radius: 8px;
	border: 1px solid #e5e7eb;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	transition: all 0.2s ease;
	&:hover {
		background-color: #f3f4f6;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	&:active {
		background-color: #e5e7eb;
	}
`
