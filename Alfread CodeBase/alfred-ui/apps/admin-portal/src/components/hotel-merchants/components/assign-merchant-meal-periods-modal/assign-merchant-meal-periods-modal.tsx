import {
	StyledButton,
	StyledCheckbox,
	StyledDivider,
	StyledModal
} from "@/design-components"
import { Flex, Skeleton } from "@mantine/core"
import { customNotification } from "@/shared-utils"
import { filter, includes, map } from "lodash"
import { useEffect, useState } from "react"
import useAssignMerchantToHotel from "@/hooks/hotel/useAssignMerchantToHotel"
import useMerchantMealPeriods from "@/hooks/meal-period/useMerchantMealPeriods"
import { NoData } from "@/shared-components"
import { useQueryClient } from "@tanstack/react-query"

const AssignMerchantMealPeriodsModal = ({
	hotelId,
	refetchHotel,
	currentMerchant,
	assignMerchantMealPeriodsModalOpen,
	setAssignMerchantMealPeriodsModalOpen
}: any) => {
	const queryClient = useQueryClient()
	const [mealPeriodIds, setMealPeriodIds] = useState<any>([])

	const { data: mealPeriods, isLoading: mealPeriodsLoading } =
		useMerchantMealPeriods(
			{ merchantId: currentMerchant?.id },
			{ enabled: !!currentMerchant?.id }
		)

	useEffect(() => {
		setMealPeriodIds(map(currentMerchant?.mealPeriods, "id"))
	}, [assignMerchantMealPeriodsModalOpen])

	const { mutate: assignMerchantToHotel } = useAssignMerchantToHotel({
		onSuccess: () => {
			customNotification.success({
				title: "Assign merchant meal periods",
				message: "Meal periods assigned successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Assign merchant meal periods",
				message: "Meal periods failed to be assigned"
			})
		},
		onSettled: () => {
			refetchHotel()
			setMealPeriodIds([])
			setAssignMerchantMealPeriodsModalOpen(false)
			queryClient.invalidateQueries(["hotel_meal_periods"])
			queryClient.invalidateQueries(["menu_categories"])
		}
	})

	const onClose = () => {
		setAssignMerchantMealPeriodsModalOpen(false)
		setMealPeriodIds([])
	}

	const mealPeriodsThatCanBeAssigned = filter(
		mealPeriods?.data,
		mealPeriod =>
			!includes(map(currentMerchant?.mealPeriods, "id"), mealPeriod?.id)
	)

	return (
		<StyledModal
			size='lg'
			opened={assignMerchantMealPeriodsModalOpen}
			title={`Asssign meal periods to "${currentMerchant?.name}"`}
			onClose={onClose}
			modalBody={
				<>
					{mealPeriodsLoading ? (
						<Skeleton height={100} />
					) : (
						<>
							{mealPeriodsThatCanBeAssigned?.length ? (
								<>
									{map(mealPeriodsThatCanBeAssigned, mealPeriod => (
										<>
											<Flex justify='space-between' w='100%'>
												{mealPeriod?.name}
												<StyledCheckbox
													value={mealPeriod?.id}
													checked={includes(mealPeriodIds, mealPeriod?.id)}
													onChange={() => {
														if (includes(mealPeriodIds, mealPeriod?.id)) {
															setMealPeriodIds((prevState: any) =>
																filter(
																	prevState,
																	value => value !== mealPeriod?.id
																)
															)
														} else {
															setMealPeriodIds((prevState: any) => [
																...prevState,
																mealPeriod.id
															])
														}
													}}
												/>
											</Flex>
											<StyledDivider p={0} my={8} color='gray.3' size='xs' />
										</>
									))}
								</>
							) : (
								<NoData message='No meal periods found' />
							)}
						</>
					)}
				</>
			}
			modalFooter={
				<Flex justify='space-between'>
					<StyledButton variant='outline' color='dark' onClick={onClose}>
						Cancel
					</StyledButton>
					<StyledButton
						color='green'
						disabled={
							mealPeriodsThatCanBeAssigned?.length === 0 ||
							mealPeriodIds?.length === 0
						}
						onClick={() => {
							if (hotelId && currentMerchant?.id && mealPeriodIds?.length > 0) {
								assignMerchantToHotel({
									hotelId,
									merchantId: currentMerchant?.id,
									mealPeriodIds
								})
							}
						}}
					>
						Assign meal periods
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default AssignMerchantMealPeriodsModal
