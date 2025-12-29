import {
	AppShell,
	MantineProvider,
	useMantineTheme,
	Global
} from "@mantine/core"
import type { AppProps } from "next/app"
import HeaderMenu from "@/components/shared/header-menu"
import FooterMenu from "@/components/shared/footer-menu"
import { colors, typography } from "@/design-system"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Head from "next/head"
import { useEffect, useReducer, useState } from "react"
import cartReducer, {
	initialState
} from "@/components/order-page/reducers/cartReducerts"
import { Notifications } from "@mantine/notifications"
import "react-phone-input-2/lib/high-res.css"

import { fetchFeatureFlags } from "@/services/featureFlags"
import featureFlagReducer, {
	featureFlagActionTypes,
	initialFeatureFlagState
} from "@/components/order-page/reducers/featureFlagReducer"
import useGlobalStore from "@/globalStore/globalStore"
import { FlexLoader } from "@/shared-components"

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 0,
			cacheTime: 0,
			refetchOnWindowFocus: true
		}
	}
})

export default function App({ Component, pageProps }: AppProps) {
	const theme = useMantineTheme()

	const [cartState, dispatchCart] = useReducer(cartReducer, initialState)
	const [featureFlagState, dispatchFeatureFlag] = useReducer(
		featureFlagReducer,
		initialFeatureFlagState
	)

	const [areFeatureFlagsLoading, setAreFeatureFlagsLoading] =
		useState<boolean>(false)

	const { setFeatureFlags } = useGlobalStore()

	useEffect(() => {
		const loadFeatureFlags = async () => {
			setAreFeatureFlagsLoading(true)
			try {
				const featureFlagsResponse = await fetchFeatureFlags()
				if (featureFlagsResponse) {
					dispatchFeatureFlag({
						type: featureFlagActionTypes.SET_FEATURE_FLAGS,
						featureFlags: featureFlagsResponse
					})
					setFeatureFlags(featureFlagsResponse)
					setAreFeatureFlagsLoading(false)
				}
			} catch (error) {
				setAreFeatureFlagsLoading(false)
				console.error("Error loading feature flags:", error)
			}
		}

		loadFeatureFlags()
	}, [])

	return (
		<QueryClientProvider client={queryClient}>
			<Head>
				<title>Get Alfred</title>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
				/>
				{/* <!-- 1200x1200 Image for Facebook --> */}
				<meta
					property='og:image'
					content='https://app.getalfred.com/get-alfred-logo-400x400.png'
				/>
				<meta property='og:image:width' content='1200' />
				<meta property='og:image:height' content='1200' />

				{/* <!-- 400x400 Image for LinkedIn --> */}
				<meta
					property='og:image'
					content='https://app.getalfred.com/get-alfred-logo-400x400.png'
				/>
				<meta property='og:image:width' content='400' />
				<meta property='og:image:height' content='400' />

				{/* <!-- 120x120 Image for Twitter --> */}
				<meta
					property='og:image'
					content='https://app.getalfred.com/get-alfred-logo-400x400.png'
				/>
				<meta property='og:image:width' content='120' />
				<meta property='og:image:height' content='120' />
			</Head>
			<MantineProvider
				withGlobalStyles
				withNormalizeCSS
				theme={{
					colors: colors as any,
					primaryColor: "primary",
					other: {
						typography
					},
					defaultRadius: 0,
					colorScheme: "light",
					fontFamily: "Inter, sans-serif"
				}}
			>
				<Global
					styles={{
						"input, textarea": {
							fontSize: "16px"
						}
					}}
				/>
				<Notifications position='top-right' limit={5} />
				<AppShell
					padding={0}
					styles={{
						main: {
							background: theme.colors.gray[0]
						}
					}}
					header={<HeaderMenu />}
				>
					{areFeatureFlagsLoading ? (
						<FlexLoader />
					) : (
						<Component
							{...pageProps}
							cartState={cartState}
							featureFlagState={featureFlagState}
							dispatchCart={dispatchCart}
						/>
					)}
					<FooterMenu />
				</AppShell>
			</MantineProvider>
		</QueryClientProvider>
	)
}
