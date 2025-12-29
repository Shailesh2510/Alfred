/* eslint-disable no-unused-vars */
import { StyledButton, StyledModal } from "@/design-components"
import {
	DragDropContext,
	Draggable,
	Droppable,
	DropResult
} from "@hello-pangea/dnd"
import { Flex, Text } from "@mantine/core"
import React, { useState } from "react"
import { NoData } from "@/shared-components"
import {
	MerchantsContainer,
	MerchantItem
} from "./reorder-merchant-modal.style"
import { IconGripVertical } from "@tabler/icons-react"
import { customNotification } from "@/shared-utils"
import useOrderMerchantsToHotel from "@/hooks/hotel/useOrderMerchantsToHotel"

type AssignMerchantOrderModalProps = {
	hotelId: number
	assignedMerchants: any[]
	setMerchantOrderModalOpen: (value: boolean) => void
	merchantOrderModalOpen: boolean
	refetchHotel: any
}

const ReorderMerchantModal = ({
	hotelId,
	assignedMerchants,
	setMerchantOrderModalOpen,
	merchantOrderModalOpen,
	refetchHotel
}: AssignMerchantOrderModalProps) => {
	const [merchants, setMerchants] = useState<any>(assignedMerchants || [])

	const handleDragEnd = (result: DropResult) => {
		const { source, destination } = result

		if (!destination || source.index === destination.index) {
			return
		}

		const newMerchants = Array.from(merchants)
		const [reorderedItem] = newMerchants.splice(source.index, 1)
		newMerchants.splice(destination.index, 0, reorderedItem)

		setMerchants(newMerchants)
	}

	const { mutate: reOrderMerchantsForHotel } = useOrderMerchantsToHotel({
		onSuccess: (response: boolean) => {
			if (response) {
				customNotification.success({
					title: "ReOrder Merchants",
					message: `Merchants order positions are updated successfully.`
				})
				setMerchantOrderModalOpen(false)
				refetchHotel()
			} else {
				customNotification.error({
					title: "ReOrder Merchants",
					message: `Failed to update merchants order positions. Please try again.`
				})
			}
		}
	})

	const handleReOrderSubmit = (merchantList: any) => {
		const transformedMerchants = merchantList.map(
			(merchant: any, index: number) => ({
				merchantId: merchant.id,
				orderPosition: index + 1
			})
		)

		reOrderMerchantsForHotel({
			hotelId: hotelId,
			merchants: transformedMerchants
		})
	}

	return (
		<StyledModal
			size='lg'
			opened={merchantOrderModalOpen}
			title='Set Merchant Order'
			onClose={() => setMerchantOrderModalOpen(false)}
			styles={{
				content: { overflowX: "hidden", width: "100%" }
			}}
			modalBody={
				<Flex direction='column'>
					{merchants?.length ? (
						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId='merchant-order' direction='vertical'>
								{provided => (
									<MerchantsContainer
										ref={provided.innerRef}
										{...provided.droppableProps}
									>
										{merchants?.map((merchant: any, index: number) => (
											<Draggable
												key={merchant.id}
												index={index}
												draggableId={merchant.id.toString()}
											>
												{provided => (
													<MerchantItem
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
													>
														<IconGripVertical
															size={18}
															stroke={1.5}
															style={{ marginRight: 12 }}
														/>
														<Text>{merchant.name}</Text>
													</MerchantItem>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</MerchantsContainer>
								)}
							</Droppable>
						</DragDropContext>
					) : (
						<NoData message='No merchants found' minHeight={200} />
					)}
				</Flex>
			}
			modalFooter={
				<Flex justify='flex-end' gap='md'>
					<StyledButton
						variant='outline'
						color='dark'
						onClick={() => setMerchantOrderModalOpen(false)}
					>
						Cancel
					</StyledButton>
					<StyledButton
						disabled={!merchants?.length}
						color='green'
						onClick={() => {
							handleReOrderSubmit(merchants)
						}}
					>
						Confirm
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default ReorderMerchantModal
