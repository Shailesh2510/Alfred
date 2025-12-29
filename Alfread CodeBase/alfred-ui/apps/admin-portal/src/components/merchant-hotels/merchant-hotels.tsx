import { PageStructure } from "@/shared-components"
import { Loader, Checkbox, Button, Tooltip } from "@mantine/core"
import { StyledTable } from "@/design-components"
import { useRouter } from "next/router"
import { NoData } from "@/shared-components"
import MerchantDetailsMenu from "../shared/merchant-details-menu"
import useMerchant from "@/hooks/merchant/useMerchant"
import useHotels from "@/hooks/hotel/useHotels"
import useMerchantMealPeriods from "@/hooks/meal-period/useMerchantMealPeriods"
import useGetAssignHotelsToMerchant from "@/hooks/merchant/useAssignHotelToMerchant"
import useAssignHotelsWithMealPeriodsToMerchant from "@/hooks/merchant/useAssignHotelsWithMealPeriodsToMerchant"
import { useState, useEffect } from "react"
import AssignHotelModal from "./components/assign-hotel-modal"
import {
	HotelStatus,
	AssignHotelsWithMealPeriodsToMerchant,
	HotelMealPeriodAssignment
} from "./components/interfaces/assign-hotels-to-merchant"
import {
	HotelMerchantContainer,
	HeaderContainer,
	TableContainer,
	LoaderContainer,
	NoDataContainer
} from "./merchant-hotels.style"

const HotelMerchant = () => {
	const router = useRouter()
	const merchantId = Number(router.query.id)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const [hotelStatuses, setHotelStatuses] = useState<
		Record<string, HotelStatus>
	>({})

	const { data: merchant, isLoading: merchantLoading } = useMerchant(
		{ merchantId },
		{
			enabled: !!merchantId
		}
	)

	const { data: hotels, isLoading: hotelsLoading } = useHotels({
		enabled: !!merchantId
	})

	const { data: merchantMealPeriods, isLoading: merchantMealPeriodsLoading } =
		useMerchantMealPeriods({ merchantId }, { enabled: !!merchantId })

	const {
		mutate: fetchAssignedHotels,
		data: assignedHotelsData,
		isLoading: assignedHotelsLoading
	} = useGetAssignHotelsToMerchant()

	const { mutate: assignHotels, isLoading: isAssigning } =
		useAssignHotelsWithMealPeriodsToMerchant({
			onSuccess: () => {
				setIsModalOpen(false)
				fetchAssignedHotels({ merchantId })
			}
		})

	const currentMerchant = merchant?.data?.[0]
	const hotelsList = hotels?.data || []
	const mealPeriods = merchantMealPeriods?.data || []

	useEffect(() => {
		if (merchantId) {
			fetchAssignedHotels({ merchantId })
		}
	}, [merchantId, fetchAssignedHotels])

	useEffect(() => {
		if (assignedHotelsData?.data) {
			const initialStatuses: Record<string, HotelStatus> = {}

			assignedHotelsData.data.forEach((hotel: any) => {
				initialStatuses[hotel.hotelId] = {
					active: hotel.isActive
				}

				hotel.associatedMealPeriods.forEach((mealPeriod: any) => {
					initialStatuses[hotel.hotelId][mealPeriod.mealPeriodId] = true
				})
			})

			setHotelStatuses(initialStatuses)
		}
	}, [assignedHotelsData])

	const handleStatusChange = (
		hotelId: string,
		column: string,
		value: boolean
	) => {
		setHotelStatuses(prev => {
			const updatedStatus = { ...(prev[hotelId] || {}) }

			if (column === "active") {
				updatedStatus.active = value
				if (!value) {
					mealPeriods.forEach((period: any) => {
						updatedStatus[period.id] = false
					})
				} else {
					mealPeriods.forEach((period: any) => {
						updatedStatus[period.id] = true
					})
				}
			} else {
				if (updatedStatus.active) {
					updatedStatus[column] = value
				}
			}

			return {
				...prev,
				[hotelId]: updatedStatus
			}
		})
	}

	const prepareHotelMappings = (): HotelMealPeriodAssignment[] => {
		return Object.entries(hotelStatuses)
			.filter(([_, status]) => status.active)
			.map(([hotelId, status]) => ({
				hotelId: Number(hotelId),
				mealPeriodIds: Object.entries(status)
					.filter(([key, value]) => key !== "active" && value)
					.map(([key]) => Number(key))
			}))
	}

	const handleSave = () => {
		const payload: AssignHotelsWithMealPeriodsToMerchant = {
			merchantId,
			hotelMealPeriodMappings: prepareHotelMappings()
		}
		assignHotels(payload)
	}

	const isLoading =
		merchantLoading ||
		hotelsLoading ||
		merchantMealPeriodsLoading ||
		assignedHotelsLoading

	return (
		<HotelMerchantContainer>
			<PageStructure
				goBack
				title={
					currentMerchant?.name ? `${currentMerchant?.name} - Hotels` : null
				}
				subHeaderContent={
					<HeaderContainer>
						<MerchantDetailsMenu merchantId={merchantId} />
						<Button onClick={() => setIsModalOpen(true)} disabled={isLoading}>
							Save Changes
						</Button>
					</HeaderContainer>
				}
				pageContent={
					<>
						{isLoading ? (
							<LoaderContainer>
								<Loader />
							</LoaderContainer>
						) : (
							<>
								{hotelsList.length === 0 ? (
									<NoDataContainer>
										<NoData message='No hotels found' minHeight={600} />
									</NoDataContainer>
								) : (
									<TableContainer>
										<StyledTable highlightOnHover>
											<thead>
												<tr>
													<th>Hotel Name</th>
													<th>Active</th>
													{mealPeriods.map((period: any) => (
														<th key={period.id}>{period.name}</th>
													))}
												</tr>
											</thead>
											<tbody>
												{hotelsList.map((hotel: any) => (
													<tr key={hotel.id}>
														<td>
															<Tooltip
																label={hotel.name}
																multiline
																position='bottom-start'
																withinPortal
															>
																<span>{hotel.name}</span>
															</Tooltip>
														</td>
														<td>
															<Checkbox
																checked={
																	hotelStatuses[hotel.id]?.active || false
																}
																onChange={event =>
																	handleStatusChange(
																		hotel.id,
																		"active",
																		event.currentTarget.checked
																	)
																}
															/>
														</td>
														{mealPeriods.map((period: any) => (
															<td key={period.id}>
																<Checkbox
																	checked={
																		hotelStatuses[hotel.id]?.[period.id] ||
																		false
																	}
																	onChange={event =>
																		handleStatusChange(
																			hotel.id,
																			period.id,
																			event.currentTarget.checked
																		)
																	}
																	disabled={!hotelStatuses[hotel.id]?.active}
																/>
															</td>
														))}
													</tr>
												))}
											</tbody>
										</StyledTable>
									</TableContainer>
								)}
							</>
						)}

						<AssignHotelModal
							isOpen={isModalOpen}
							onClose={() => setIsModalOpen(false)}
							onConfirm={handleSave}
							isLoading={isAssigning}
						/>
					</>
				}
			/>
		</HotelMerchantContainer>
	)
}

export default HotelMerchant
