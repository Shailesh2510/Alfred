import { createGetInitialProps } from "@mantine/next"
import Document, { Head, Html, Main, NextScript } from "next/document"
import Script from "next/script"

const getInitialProps = createGetInitialProps()
export default class _Document extends Document {
	static getInitialProps = getInitialProps

	render() {
		return (
			<Html>
				<Head>
					<Script
						id='google-tag-manager'
						strategy='afterInteractive'
						dangerouslySetInnerHTML={{
							__html: `
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-NZ83TDBK');
            `
						}}
					/>
					<link
						rel='shortcut icon'
						type='image/x-icon'
						href='get-alfred-logo.png'
					/>
				</Head>
				<body>
					<noscript>
						<iframe
							src='https://www.googletagmanager.com/ns.html?id=GTM-NZ83TDBK'
							height='0'
							width='0'
							style={{ display: "none", visibility: "hidden" }}
						></iframe>
					</noscript>
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}
