import React from "react"
import Link from "next/link"
import { StyledFooter } from "./footer-menu.style"

const FooterMenu: React.FC = () => {
	return (
		<StyledFooter>
			<Link href='/privacy-policy'>Privacy Policy</Link>
			<Link href='/fulfillment-policy'>Fulfillment Policy</Link>
		</StyledFooter>
	)
}

export default FooterMenu
