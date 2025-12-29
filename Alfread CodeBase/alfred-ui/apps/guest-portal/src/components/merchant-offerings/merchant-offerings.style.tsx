import styled from "@emotion/styled"

export const MerchantOfferingsContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	min-height: 100vh;
	padding: 2rem;
	box-sizing: border-box;
`

export const ServiceTitle = styled.h1`
	font-weight: 500;
	font-size: 18px;
	margin-bottom: 2rem;
	text-align: center;
	margin-top: 1rem;
`

export const MerchantOfferingsGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 2rem;
	justify-content: center;
	align-items: center;
	width: 100%;
	max-width: 1200px;

	@media (min-width: 768px) {
		flex-direction: row;
	}
`

export const MerchantOfferingsName = styled.div`
	font-weight: 500;
	font-size: 1rem;
	text-align: center;
	margin-top: 1rem;
`

export const DivRibbon = styled.div`
	--f: 0.5em; /* control the folded part*/
	--r: 0.3em; /* control the ribbon shape */

	font-size: 0.8em;

	position: absolute;
	top: 10px;
	right: calc(-1 * var(--f));
	padding-inline: 0.5em;
	line-height: 1.8;
	background: #b3ebf2;
	border-right: var(--f) solid #0000;
	border-bottom: var(--f) solid #0005;
	border-left: var(--r) solid #0000;
	clip-path: polygon(
		0 0,
		100% 0,
		100% calc(100% - var(--f)),
		calc(100% - var(--f)) 100%,
		calc(100% - var(--f)) calc(100% - var(--f)),
		0 calc(100% - var(--f)),
		var(--r) calc(50% - var(--f) / 2)
	);
`
