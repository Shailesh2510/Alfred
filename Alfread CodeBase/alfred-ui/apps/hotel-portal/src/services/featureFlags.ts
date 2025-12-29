import { AWS_DEFAULT_REGION } from "@/shared-constants"
import {
	AppConfigDataClient,
	StartConfigurationSessionCommand,
	GetLatestConfigurationCommand
} from "@aws-sdk/client-appconfigdata"

export const fetchFeatureFlags = async () => {
	const appConfigDataClient = new AppConfigDataClient({
		region: AWS_DEFAULT_REGION,
		credentials: {
			accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
			secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!
		}
	})

	try {
		// Start a configuration session
		const startSessionCommand = new StartConfigurationSessionCommand({
			ApplicationIdentifier:
				process.env.NEXT_PUBLIC_AWS_APP_CONFIG_APPLICATION_ID,
			EnvironmentIdentifier:
				process.env.NEXT_PUBLIC_AWS_APP_CONFIG_ENVIRONMENT_ID,
			ConfigurationProfileIdentifier:
				process.env.NEXT_PUBLIC_AWS_APP_CONFIG_CONFIGURATION_PROFILE_ID
		})
		const sessionResponse = await appConfigDataClient.send(startSessionCommand)

		if (!sessionResponse.InitialConfigurationToken) {
			throw new Error("Failed to retrieve initial configuration token.")
		}

		// Get the latest configuration data
		const getConfigCommand = new GetLatestConfigurationCommand({
			ConfigurationToken: sessionResponse.InitialConfigurationToken
		})
		const configResponse = await appConfigDataClient.send(getConfigCommand)

		const configData = configResponse.Configuration
			? JSON.parse(new TextDecoder().decode(configResponse.Configuration))
			: null

		return configData // Your configuration data (feature flags)
	} catch (error) {
		console.error("Error fetching configuration:", error)
		throw error
	}
}
