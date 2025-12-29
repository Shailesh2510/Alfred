/* eslint-disable no-unused-vars */
import React, { useState } from "react"
import {
	StyledButton,
	StyledCheckbox,
	StyledDivider,
	StyledModal
} from "@/design-components"
import { Tooltip } from "@mantine/core"
import { customNotification } from "@/shared-utils"
import useSimilarHotels from "@/hooks/hotel/useSimilarHotels"
import useReplicateMenu from "@/hooks/menu/useReplicateMenu"
import { filter, includes, uniq } from "lodash"
import { NoData } from "@/shared-components"
import {
	ReplicateModalContainer,
	FromContainer,
	FromLabel,
	FromHotelName,
	EligibleHotelsLabel,
	LoadingContainer,
	HotelListItemContainer,
	HotelNameContainer,
	HotelNameWrapper,
	ModalFooterContainer,
	StyledTooltip
} from "./replicate-menu-styles"

interface ReplicateMenuModalProps {
	currentHotelId: string | string[] | undefined
	currentHotelName: string
	merchantIds?: number[]
	replicateMenuModalOpen: boolean
	setReplicateMenuModalOpen: (open: boolean) => void
}

const ReplicateMenuModal = ({
	currentHotelId,
	currentHotelName,
	merchantIds = [],
	replicateMenuModalOpen,
	setReplicateMenuModalOpen
}: ReplicateMenuModalProps) => {
	const [selectedHotels, setSelectedHotels] = useState<string[]>([])

	const { data: hotels, isLoading: hotelsLoading } = useSimilarHotels({
		hotelId: currentHotelId,
		isEnabled: replicateMenuModalOpen,
		retry: 1
	})

	const onClose = () => {
		setReplicateMenuModalOpen(false)
		setSelectedHotels([])
	}

	const { mutate: replicateMenu } = useReplicateMenu({
		onSuccess: (response: any) => {
			if (response.data[0].isPublishMenuTriggered) {
				onClose()
			}
		},
		onError: () => {
			customNotification.error({
				title: "Menu Replication",
				message: `Menu replication failed for ${currentHotelName}. Please try again.`
			})
		}
	})

	const availableHotels = filter(
		hotels?.data,
		hotel =>
			hotel.id.toString() !==
			(Array.isArray(currentHotelId)
				? currentHotelId[0]
				: currentHotelId
			)?.toString()
	)

	const handleReplication = () => {
		customNotification.info({
			title: "Menu Replication",
			message: "Menu replication in progress..."
		})

		setReplicateMenuModalOpen(false)

		const sourceHotelId = Array.isArray(currentHotelId)
			? parseInt(currentHotelId[0])
			: parseInt(currentHotelId as string)

		const targetHotelIds = selectedHotels.map(id => parseInt(id))

		const uniqueMerchantIds = uniq(merchantIds)

		replicateMenu([sourceHotelId, targetHotelIds, uniqueMerchantIds])
	}

	return (
		<StyledModal
			opened={replicateMenuModalOpen}
			title={`Replicate Menu`}
			onClose={onClose}
			modalBody={
				<>
					<ReplicateModalContainer>
						<FromContainer>
							<FromLabel>From:</FromLabel>
							<Tooltip
								label={currentHotelName}
								position='top'
								withArrow
								openDelay={300}
								withinPortal
								styles={StyledTooltip}
							>
								<FromHotelName>{currentHotelName}</FromHotelName>
							</Tooltip>
						</FromContainer>
						<StyledDivider p={0} color='gray.3' size='xs' />
						<EligibleHotelsLabel>List of Eligible Hotels:</EligibleHotelsLabel>
						{hotelsLoading ? (
							<LoadingContainer>
								<div>Loading...</div>
							</LoadingContainer>
						) : availableHotels?.length > 0 ? (
							<>
								{availableHotels?.map((hotel: any, index: number) => (
									<React.Fragment key={hotel.id}>
										<HotelListItemContainer>
											<HotelNameContainer>
												<StyledCheckbox
													value={hotel.id}
													checked={includes(selectedHotels, hotel.id)}
													onChange={() => {
														if (includes(selectedHotels, hotel.id)) {
															setSelectedHotels((prevState: string[]) =>
																filter(prevState, value => value !== hotel.id)
															)
														} else {
															setSelectedHotels((prevState: string[]) => [
																...prevState,
																hotel.id
															])
														}
													}}
												/>
												<Tooltip
													label={hotel.name}
													position='top'
													withArrow
													openDelay={300}
													withinPortal
													styles={StyledTooltip}
												>
													<HotelNameWrapper>
														<FromHotelName>{hotel.name}</FromHotelName>
													</HotelNameWrapper>
												</Tooltip>
											</HotelNameContainer>
										</HotelListItemContainer>
										{index < availableHotels.length - 1 && (
											<StyledDivider p={0} my={8} color='gray.3' size='xs' />
										)}
									</React.Fragment>
								))}
							</>
						) : (
							<NoData message='No hotels available for replication' />
						)}
					</ReplicateModalContainer>
				</>
			}
			modalFooter={
				<ModalFooterContainer
					style={{ justifyContent: "flex-end", gap: "8px" }}
				>
					<StyledButton
						disabled={
							availableHotels?.length === 0 || selectedHotels.length === 0
						}
						color='green'
						onClick={handleReplication}
					>
						Replicate
					</StyledButton>
					<StyledButton variant='outline' color='dark' onClick={onClose}>
						Cancel
					</StyledButton>
				</ModalFooterContainer>
			}
		/>
	)
}

export default ReplicateMenuModal
