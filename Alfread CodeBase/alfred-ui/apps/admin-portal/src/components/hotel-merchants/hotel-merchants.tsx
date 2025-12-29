import { ActionIcon, Flex, Grid, Loader } from "@mantine/core"
import { orderBy, uniqBy } from "lodash"
import { customNotification, getMealPeriodWorkingHours } from "@/shared-utils"
import AssignMerchantModal from "./components/assign-merchant-modal"
import { useEffect, useState } from "react"
import useHotel from "@/hooks/hotel/useHotel"
import { useRouter } from "next/router"
import { ConfirmDeleteModal, NoData, PageStructure } from "@/shared-components"
import {
	PartnerCard,
	PartnerName,
	PartnerMealPeriods,
	PartnerMealPeriodsLabel,
	MealPeriodContainer
} from "./hotel-merchants.style"
import { StyledButton, StyledDivider } from "@/design-components"
import HotelDetailsMenu from "../shared/hotel-details-menu"
import { IconPlus, IconReorder, IconTrash } from "@tabler/icons-react"
import { ICON_SIZE } from "@/shared-constants"
import AssignMerchantMealPeriodsModal from "./components/assign-merchant-meal-periods-modal"
import useUnassignMerchantMealPeriods from "@/hooks/hotel/useUnassignMerchantMealPeriods"
import { useQueryClient } from "@tanstack/react-query"
import ReorderMerchantModal from "./components/reorder-merchant-modal"

const HotelMerchants = () => {
	const router = useRouter()
	const hotelId = router.query.id
	const queryClient = useQueryClient()

	const [currentMerchant, setCurrentMerchant] = useState<any>(null)
	const [merchantMealPeriodToDelete, setMerchantMealPeriodToDelete] =
		useState<any>(null)
	const [assignedMerchants, setAssignedMerchants] = useState<any>([])
	const [assignMerchantModalOpen, setAssignMerchantModalOpen] =
		useState<boolean>(false)
	const [merchantOrderModalOpen, setMerchantOrderModalOpen] =
		useState<boolean>(false)
	const [
		assignMerchantMealPeriodsModalOpen,
		setAssignMerchantMealPeriodsModalOpen
	] = useState<boolean>(false)
	const [showDeleteMerchantMealPeriodModalOpen, setShowDeleteMenuItemModal] =
		useState<boolean>(false)

	const {
		data: hotel,
		isLoading: hotelLoading,
		refetch: refetchHotel
	} = useHotel(
		{ hotelId },
		{
			enabled: !!hotelId
		}
	)

	const { mutate: unassignMerchantsToHotel } = useUnassignMerchantMealPeriods({
		onSuccess: () => {
			customNotification.success({
				title: "Unassign merchant meal period",
				message: "Meal period unassigned successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Unassign merchant meal period",
				message: "Meal period failed to be unassigned"
			})
		},
		onSettled: () => {
			refetchHotel()
			setMerchantMealPeriodToDelete(null)
			queryClient.invalidateQueries(["hotel_meal_periods"])
			queryClient.invalidateQueries(["menu_categories"])
		}
	})

	const currentHotel = hotel?.data?.[0]
	useEffect(() => {
		if (currentHotel) {
			const currentHotelMerchants = uniqBy(currentHotel.hotelMerchants, "id")
			const sortedMerchants = orderBy(currentHotelMerchants, [
				"order_position",
				"id"
			])

			setAssignedMerchants(sortedMerchants)
		}
	}, [hotel])

	return (
		<PageStructure
			goBack
			title={currentHotel?.name ? `${currentHotel?.name} - Merchants` : null}
			subHeaderContent={
				<Flex w='100%' justify='space-between'>
					<HotelDetailsMenu hotelId={hotelId} />
					<StyledButton
						color='dark'
						leftIcon={<IconReorder size={ICON_SIZE} color='black' />}
						variant='outline'
						onClick={(event: any) => {
							event.stopPropagation()
							setMerchantOrderModalOpen(true)
						}}
					>
						Set Merchant Order
					</StyledButton>
				</Flex>
			}
			headerContent={
				<Flex gap={16} mr={8} align='center'>
					<StyledButton
						color='dark'
						leftIcon={<IconPlus size={ICON_SIZE} color='black' />}
						variant='outline'
						onClick={(event: any) => {
							event.stopPropagation()
							setAssignMerchantModalOpen(true)
						}}
					>
						Assign Merchants
					</StyledButton>
				</Flex>
			}
			pageContent={
				<>
					{hotelLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<Grid mb={24} gutter={24} m={6}>
							{assignedMerchants?.length ? (
								<>
									{assignedMerchants?.map((merchant: any) => (
										<Grid.Col key={merchant?.id} xs={12} lg={4}>
											<PartnerCard>
												<Flex justify='space-between'>
													<PartnerName>{merchant?.name}</PartnerName>
													<StyledButton
														color='dark'
														leftIcon={
															<IconPlus size={ICON_SIZE} color='black' />
														}
														variant='outline'
														onClick={() => {
															setCurrentMerchant(merchant)
															setAssignMerchantMealPeriodsModalOpen(true)
														}}
													>
														Assign meal periods
													</StyledButton>
												</Flex>
												<PartnerMealPeriods>
													<PartnerMealPeriodsLabel>
														Meal Periods:
													</PartnerMealPeriodsLabel>
													{merchant?.mealPeriods?.length ? (
														<>
															{orderBy(merchant?.mealPeriods, "startHour")?.map(
																(mealPeriod: any) => {
																	const {
																		mealPeriodStartTimeString,
																		mealPeriodEndTimeString
																	} = getMealPeriodWorkingHours({
																		startHour: mealPeriod?.startHour,
																		endHour: mealPeriod?.endHour,
																		timezone: merchant?.timezone
																	})

																	return (
																		<MealPeriodContainer key={mealPeriod?.id}>
																			<Grid>
																				<Grid.Col span={6}>
																					{mealPeriod?.name}
																				</Grid.Col>
																				<Grid.Col span={5}>
																					{`${mealPeriodStartTimeString} - ${mealPeriodEndTimeString}`}
																				</Grid.Col>
																				<Grid.Col span={1}>
																					<ActionIcon>
																						<IconTrash
																							size={ICON_SIZE}
																							color='black'
																							onClick={() => {
																								setCurrentMerchant(merchant)
																								setMerchantMealPeriodToDelete(
																									mealPeriod
																								)
																								setShowDeleteMenuItemModal(true)
																							}}
																						/>
																					</ActionIcon>
																				</Grid.Col>
																			</Grid>
																			<StyledDivider
																				p={0}
																				m={0}
																				size='xs'
																				color='gray.3'
																			/>
																		</MealPeriodContainer>
																	)
																}
															)}
														</>
													) : (
														<div>-</div>
													)}
												</PartnerMealPeriods>
											</PartnerCard>
										</Grid.Col>
									))}
								</>
							) : (
								<Flex mih={400} w='100%' justify='center' align='center'>
									<NoData message='No merchants assigned' />
								</Flex>
							)}
						</Grid>
					)}
					<AssignMerchantModal
						hotelId={currentHotel?.id}
						refetchHotel={refetchHotel}
						hotelName={currentHotel?.name}
						assignedMerchants={assignedMerchants}
						assignMerchantModalOpen={assignMerchantModalOpen}
						setAssignMerchantModalOpen={setAssignMerchantModalOpen}
					/>
					{assignedMerchants.length > 0 ? (
						<ReorderMerchantModal
							hotelId={currentHotel?.id}
							assignedMerchants={assignedMerchants}
							setMerchantOrderModalOpen={setMerchantOrderModalOpen}
							merchantOrderModalOpen={merchantOrderModalOpen}
							refetchHotel={refetchHotel}
						/>
					) : null}
					<AssignMerchantMealPeriodsModal
						hotelId={currentHotel?.id}
						refetchHotel={refetchHotel}
						hotelName={currentHotel?.name}
						currentMerchant={currentMerchant}
						assignMerchantMealPeriodsModalOpen={
							assignMerchantMealPeriodsModalOpen
						}
						setAssignMerchantMealPeriodsModalOpen={
							setAssignMerchantMealPeriodsModalOpen
						}
					/>
					<ConfirmDeleteModal
						title='Delete merchant meal period'
						message={
							<>
								Are you sure you want to remove the `
								<b>{merchantMealPeriodToDelete?.name}</b>` meal period from
								merchant?
							</>
						}
						modalOpen={showDeleteMerchantMealPeriodModalOpen}
						setModalOpen={setShowDeleteMenuItemModal}
						onClose={() => setMerchantMealPeriodToDelete(null)}
						onDelete={() => {
							if (
								merchantMealPeriodToDelete?.id &&
								hotelId &&
								currentMerchant?.id
							) {
								unassignMerchantsToHotel({
									hotelId,
									merchantId: currentMerchant?.id,
									mealPeriodIds: [merchantMealPeriodToDelete?.id]
								})
							}
						}}
					/>
				</>
			}
		/>
	)
}
export default HotelMerchants
