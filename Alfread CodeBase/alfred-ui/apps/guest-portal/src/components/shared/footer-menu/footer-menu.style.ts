import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Flex } from "@mantine/core"

export const StyledFooter = styled(Flex)<{ lg?: boolean }>`
	z-index: 2;
	padding: 8px;
	width: 100%;
	background: white;
	box-shadow: 0px -1px 3px rgba(0, 0, 0, 0.05),
		0px -7px 7px -5px rgba(0, 0, 0, 0.04),
		0px -10px 15px -5px rgba(0, 0, 0, 0.05);
	${({ lg }) =>
		lg
			? css`
					flex-direction: column;
					align-items: center;
			  `
			: css`
					flex-direction: row;
					justify-content: center;
					align-items: center;
			  `};

	a {
		margin: 0 12px;
		text-decoration: none;
	}
`
