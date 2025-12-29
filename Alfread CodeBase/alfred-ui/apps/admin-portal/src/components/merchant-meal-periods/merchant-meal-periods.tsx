import { ConfirmDeleteModal, PageStructure } from "@/shared-components"
import {
	IconDotsVertical,
	IconEdit,
	IconPlus,
	IconTrash
} from "@tabler/icons-react"
import { ActionIcon, Divider, Flex, Loader, Menu } from "@mantine/core"
import { StyledButton, StyledSearch, StyledTable } from "@/design-components"
import { useInputState } from "@mantine/hooks"
import Link from "next/link"
import { filter } from "lodash"
import { useRouter } from "next/router"
import { NoData } from "@/shared-components"
import { customNotification, getMealPeriodWorkingHours } from "@/shared-utils"
import MerchantDetailsMenu from "../shared/merchant-details-menu"
import useMerchant from "@/hooks/merchant/useMerchant"
import useMerchantMealPeriods from "@/hooks/meal-period/useMerchantMealPeriods"
import { ICON_SIZE } from "@/shared-constants"
import { useState } from "react"
import useDeleteMerchantMealPeriod from "@/hooks/meal-period/useDeleteMerchantMealperiod"

const MealPeriods = () => {
	const router = useRouter()
	const merchantId = router.query.id

	const [mealPeriodFilter, setMealPeriodFilter] = useInputState<any>("")
	const [deleteModalOpen, setDeleteModalOpen] = useState<any>(false)
	const [mealPeriodToDelete, setMealPeriodToDelete] = useState<any>(null)

	const { data: merchant, isLoading: merchantLoading } = useMerchant(
		{ merchantId },
		{
			enabled: !!merchantId
		}
	)

	const {
		data: merchantMealPeriods,
		isLoading: merchantMealPeriodsLoading,
		refetch: refetchMerchantMealPeriods
	} = useMerchantMealPeriods({ merchantId }, { enabled: !!merchantId })

	const { mutate: deleteMerchantMealPeriod } = useDeleteMerchantMealPeriod({
		onSuccess: () => {
			customNotification.success({
				title: "Delete meal period",
				message: "Meal period deleted successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Delete meal period",
				message: "Meal period deletion failed"
			})
		},
		onSettled: () => {
			refetchMerchantMealPeriods()
			setMealPeriodToDelete(null)
		}
	})

	const currentMerchant = merchant?.data?.[0]

	let tableContent = merchantMealPeriods?.data || []
	if (mealPeriodFilter) {
		tableContent = filter(merchantMealPeriods?.data || [], product =>
			product?.name.toLowerCase().includes(mealPeriodFilter?.toLowerCase())
		)
	}

	return (
		<PageStructure
			goBack
			title={
				currentMerchant?.name ? `${currentMerchant?.name} - Meal Periods` : null
			}
			subHeaderContent={<MerchantDetailsMenu merchantId={merchantId} />}
			headerContent={
				<Flex gap={16} mr={8} align='center'>
					<StyledSearch
						value={mealPeriodFilter}
						onChange={setMealPeriodFilter}
						placeholder='Search for Meal Periods'
					/>
					<Divider orientation='vertical' h={24} color='gray.5' m='auto' />
					<Link href={`/merchants/${merchantId}/meal-periods/add`}>
						<StyledButton
							color='dark'
							variant='outline'
							leftIcon={<IconPlus size={22} color='black' />}
						>
							Add Meal Period
						</StyledButton>
					</Link>
				</Flex>
			}
			pageContent={
				<>
					{merchantLoading || merchantMealPeriodsLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>
							{tableContent.length === 0 ? (
								<NoData message='No meal periods found' minHeight={600} />
							) : (
								<StyledTable highlightOnHover>
									<thead>
										<tr>
											<th>ID</th>
											<th>Name</th>
											<th>Start Hour</th>
											<th>End Hour</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{tableContent.map((mealPeriod: any) => {
											const {
												mealPeriodStartTimeString,
												mealPeriodEndTimeString
											} = getMealPeriodWorkingHours({
												timezone: mealPeriod?.timezone,
												startHour: mealPeriod?.startHour,
												endHour: mealPeriod?.endHour
											})

											return (
												<tr key={mealPeriod.id}>
													<td>#{mealPeriod.id}</td>
													<td>{mealPeriod.name}</td>
													<td>{mealPeriodStartTimeString}</td>
													<td>{mealPeriodEndTimeString}</td>
													<td>
														<Menu
															width={200}
															shadow='xl'
															withArrow
															trigger='hover'
														>
															<Menu.Target>
																<ActionIcon>
																	<IconDotsVertical size={22} />
																</ActionIcon>
															</Menu.Target>
															<Menu.Dropdown>
																<Flex
																	direction='column'
																	align='center'
																	justify='center'
																	gap={16}
																	p={16}
																>
																	<StyledButton
																		fullWidth
																		color='dark'
																		variant='outline'
																		leftIcon={
																			<IconEdit
																				size={ICON_SIZE}
																				color='black'
																			/>
																		}
																		onClick={() =>
																			router.push(
																				`/merchants/${merchantId}/meal-periods/edit/${mealPeriod?.id}`
																			)
																		}
																	>
																		Edit
																	</StyledButton>
																	<StyledButton
																		fullWidth
																		color='dark'
																		variant='outline'
																		leftIcon={
																			<IconTrash
																				size={ICON_SIZE}
																				color='black'
																			/>
																		}
																		onClick={() => {
																			setDeleteModalOpen(true)
																			setMealPeriodToDelete(mealPeriod)
																		}}
																	>
																		Delete
																	</StyledButton>
																</Flex>
															</Menu.Dropdown>
														</Menu>
													</td>
												</tr>
											)
										})}
									</tbody>
								</StyledTable>
							)}
						</>
					)}
					<ConfirmDeleteModal
						title='Delete meal period'
						message={
							<>
								Are you sure you want to remove the meal period `
								<b>{mealPeriodToDelete?.name}</b>`?
							</>
						}
						modalOpen={deleteModalOpen}
						setModalOpen={setDeleteModalOpen}
						onClose={() => setMealPeriodToDelete(null)}
						onDelete={() => {
							if (merchantId && mealPeriodToDelete?.id) {
								deleteMerchantMealPeriod({
									merchantId,
									mealPeriodId: mealPeriodToDelete?.id
								})
							}
						}}
					/>
				</>
			}
		/>
	)
}

export default MealPeriods
