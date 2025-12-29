import "@aws-amplify/ui-react/styles.css"
import {
	AppShell,
	MantineProvider,
	useMantineTheme,
	Flex,
	Image
} from "@mantine/core"
import type { AppProps } from "next/app"
import HeaderMenu from "@/components/shared/header-menu"
import { colors, typography } from "@/design-system"
import NavbarMenu from "@/components/shared/navbar-menu"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Head from "next/head"
import { Global, css } from "@emotion/react"
import { Auth } from "aws-amplify"
import { Authenticator } from "@aws-amplify/ui-react"
import { Notifications } from "@mantine/notifications"
import { useBreakPoints } from "@/shared-hooks"
import "react-phone-input-2/lib/high-res.css"

const LOCAL_HOST_URL = "http://localhost:8080/"

const isLocalhost = () => {
	if (typeof window !== "undefined") {
		return Boolean(
			window.location.hostname === "localhost" ||
				window.location.hostname.match(
					/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
				)
		)
	}
	return false
}

Auth.configure({
	region: "eu-west-2",
	mandatorySignIn: true,
	identityPoolRegion: "eu-west-2",
	authenticationFlowType: "USER_SRP_AUTH",
	userPoolId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL_ID,
	userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
	identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
	oauth: {
		responseType: "code",
		domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
		scope: ["email", "openid", "profile", "aws.cognito.signin.user.admin"],
		redirectSignIn: isLocalhost()
			? LOCAL_HOST_URL
			: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN_URL,
		redirectSignOut: isLocalhost()
			? LOCAL_HOST_URL
			: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT_URL
	}
})

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 0,
			cacheTime: 0,
			refetchOnWindowFocus: false
		}
	}
})

const components = {
	SignIn: {
		Header() {
			return (
				<Flex align='center' justify='center' my={30} mx={80}>
					<Image alt='Get Alfred logo' src='./get-alfred-logo.png' m='auto' />
				</Flex>
			)
		}
	},
	ResetPassword: {
		Header() {
			return (
				<Flex align='center' justify='center' my={10} mx={40}>
					<Image alt='Get Alfred logo' src='./get-alfred-logo.png' m='auto' />
				</Flex>
			)
		}
	}
}

const App = ({ Component, pageProps }: AppProps) => {
	const theme = useMantineTheme()
	const { lg } = useBreakPoints()

	return (
		<Authenticator
			loginMechanisms={["email"]}
			hideSignUp={true}
			components={components}
		>
			{({ signOut, user }) => (
				<QueryClientProvider client={queryClient}>
					<Head>
						<title>Get Alfred</title>
						<meta
							name='viewport'
							content='minimum-scale=1, initial-scale=1, width=device-width'
						/>
					</Head>
					<MantineProvider
						withGlobalStyles
						withNormalizeCSS
						theme={{
							colors: colors as any,
							primaryColor: "primary",
							other: { typography },
							defaultRadius: 0,
							colorScheme: "light",
							fontFamily: "Inter, sans-serif"
						}}
					>
						<Notifications position='top-right' limit={5} />
						<AppShell
							padding={0}
							styles={{
								main: {
									background: theme.colors.gray[0],
									position: "relative",
									zIndex: 1
								}
							}}
							header={<HeaderMenu user={user} signOut={signOut} />}
							navbar={<NavbarMenu user={user} />}
						>
							<Global
								styles={css`
									.mantine-AppShell-main {
										padding-top: 70px;

										@media (min-width: 1200px) {
											padding-left: ${lg ? "70px" : "250px"};
											transition: padding-left 0.3s ease;
										}

										@media (max-width: 1200px) {
											padding-left: 0 !important;
											margin-left: 0 !important;
										}
									}

									.mantine-AppShell-navbar {
										@media (max-width: 1200px) {
											position: fixed;
											width: 70px !important;
											z-index: 200;
										}
									}

									.mantine-Header-root {
										z-index: 201;
										position: fixed;
										top: 0;
										left: 0;
										right: 0;
									}
								`}
							/>
							<Component {...pageProps} />
						</AppShell>
					</MantineProvider>
				</QueryClientProvider>
			)}
		</Authenticator>
	)
}

export default App
