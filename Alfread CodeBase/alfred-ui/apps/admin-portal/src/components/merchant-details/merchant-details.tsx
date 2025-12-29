import { PageStructure } from "@/shared-components"
import { Flex, Grid, Loader } from "@mantine/core"
import { StyledContainerWithTitle, StyledDivider } from "@/design-components"
import { useRouter } from "next/router"
import useMerchant from "@/hooks/merchant/useMerchant"
import { FieldLabel, FieldValue } from "./merchant-details.style"
import MerchantDetailsMenu from "../shared/merchant-details-menu"

const Merchants = () => {
	const router = useRouter()
	const merchantId = router.query.id

	const { data: merchant, isLoading: merchantLoading } = useMerchant(
		{ merchantId },
		{
			enabled: !!merchantId
		}
	)

	const currentMerchant = merchant?.data?.[0]

	return (
		<PageStructure
			goBack
			title={
				currentMerchant?.name ? `${currentMerchant?.name} - Details` : null
			}
			subHeaderContent={<MerchantDetailsMenu merchantId={merchantId} />}
			headerContent={
				<Flex gap={16} mr={8} align='center'>
					<StyledDivider
						orientation='vertical'
						h={24}
						color='gray.5'
						m='auto'
					/>
				</Flex>
			}
			pageContent={
				<>
					{merchantLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<Grid gutter={36} m={12}>
							<Grid.Col xs={12} xl={8}>
								<StyledContainerWithTitle title='Merchant Information'>
									<Flex wrap='wrap' columnGap={8}>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Name</FieldLabel>
											<FieldValue>{currentMerchant?.name}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>City</FieldLabel>
											<FieldValue>{currentMerchant?.cityName}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Is active</FieldLabel>
											<FieldValue>
												{currentMerchant?.isActive ? "Yes" : "No"}
											</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Coordinates</FieldLabel>
											<FieldValue>{`Longitude: ${parseFloat(
												currentMerchant?.coordinates?.x
											).toFixed(4)} Latitude: ${parseFloat(
												currentMerchant?.coordinates?.y
											).toFixed(4)}`}</FieldValue>
										</Flex>
									</Flex>
								</StyledContainerWithTitle>
							</Grid.Col>
							<Grid.Col xs={12} xl={8}>
								<StyledContainerWithTitle title='Merchant Address'>
									<Flex wrap='wrap' columnGap={8}>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>City</FieldLabel>
											<FieldValue>{currentMerchant?.cityName}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Town</FieldLabel>
											<FieldValue>{currentMerchant?.addressTown}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Street</FieldLabel>
											<FieldValue>{currentMerchant?.addressStreet}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Zip code</FieldLabel>
											<FieldValue>{currentMerchant?.addressZipCode}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Number</FieldLabel>
											<FieldValue>{currentMerchant?.addressNumber}</FieldValue>
										</Flex>
									</Flex>
								</StyledContainerWithTitle>
							</Grid.Col>
							<Grid.Col xs={12} xl={8}>
								<StyledContainerWithTitle title='Merchant Contact'>
									<Flex wrap='wrap' columnGap={8}>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Contact email</FieldLabel>
											<FieldValue>{currentMerchant?.contactEmail}</FieldValue>
										</Flex>
										<Flex direction='column' columnGap={8} mr={80}>
											<FieldLabel>Contact phone</FieldLabel>
											<FieldValue>{currentMerchant?.contactPhone}</FieldValue>
										</Flex>
									</Flex>
								</StyledContainerWithTitle>
							</Grid.Col>
						</Grid>
					)}
				</>
			}
		/>
	)
}

export default Merchants
