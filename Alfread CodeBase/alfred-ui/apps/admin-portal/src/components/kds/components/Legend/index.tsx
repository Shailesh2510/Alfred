import React from "react"
import { ScrollArea, Flex, Loader, Tooltip } from "@mantine/core"
import useMerchants from "@/hooks/merchant/useMerchants"

interface Merchant {
	id: string
	name: string
	color: string
}

interface MerchantLegendProps {
	hotelId: string | null
}

export const MerchantLegend: React.FC<MerchantLegendProps> = ({ hotelId }) => {
	const { data, isLoading } = useMerchants(hotelId || undefined)

	const merchants = React.useMemo(() => {
		if (!data) {
			return []
		}
		const merchantsArray = Array.isArray(data.data)
			? data.data
			: Array.isArray(data)
			? data
			: []
		return merchantsArray.sort((a: Merchant, b: Merchant) =>
			a.name.localeCompare(b.name)
		)
	}, [data])

	if (isLoading) {
		return <Loader size='sm' />
	}

	return (
		<ScrollArea>
			<Flex align='center' justify='flex-start' wrap='wrap' gap='xs'>
				{merchants.map((merchant: Merchant) => (
					<div key={merchant.id}>
						<Tooltip
							label={merchant.name}
							position='top'
							withArrow
							openDelay={300}
							styles={{
								tooltip: {
									fontSize: "0.75rem",
									padding: "0.25rem 0.5rem"
								}
							}}
						>
							<Flex
								align='center'
								gap='0.5rem'
								style={{
									whiteSpace: "nowrap"
								}}
							>
								<div
									style={{
										width: "1.25rem",
										height: "1.25rem",
										backgroundColor: merchant.color || "#808080",
										borderRadius: "0.25rem"
									}}
								/>
								<span
									style={{
										fontSize: "0.75rem",
										maxWidth: "6.25rem",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap"
									}}
								>
									{merchant.name}
								</span>
							</Flex>
						</Tooltip>
					</div>
				))}
			</Flex>
		</ScrollArea>
	)
}
