import styled from "@emotion/styled"

export const HotelMerchantContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
`

export const HeaderContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	padding: 16px 0;
`

export const TableContainer = styled.div`
	width: 100%;

	td:first-of-type {
		max-width: 150px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		cursor: default;

		span {
			display: block;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			&:hover {
				text-decoration: none;
			}
		}
	}

	th:not(:first-child),
	td:not(:first-child) {
		text-align: center;
	}

	td:first-of-type:hover {
		cursor: default;
	}

	.mantine-Checkbox-root {
		display: flex;
		justify-content: center;
		margin: 0 auto;
	}

	td,
	th {
		padding: 12px 16px;
		vertical-align: middle;
	}

	.mantine-Tooltip-tooltip {
		text-decoration: none;
	}
`

export const LoaderContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 600px;
	width: 100%;
`

export const NoDataContainer = styled.div`
	min-height: 600px;
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
`
