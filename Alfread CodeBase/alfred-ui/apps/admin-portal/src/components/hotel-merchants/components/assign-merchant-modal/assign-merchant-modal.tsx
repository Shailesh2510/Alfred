import {
	StyledButton,
	StyledModal,
	StyledMultiSelect,
	StyledSelect
} from "@/design-components"
import { Flex } from "@mantine/core"
import { customNotification } from "@/shared-utils"
import useAssignMerchantToHotel from "@/hooks/hotel/useAssignMerchantToHotel"
import { useInputState } from "@mantine/hooks"
import { NoData } from "@/shared-components"
import { filter, find, includes, map } from "lodash"
import useMerchants from "@/hooks/merchant/useMerchants"
import { useMemo } from "react"

const AssignMerchantModal = ({
	hotelId,
	hotelName,
	refetchHotel,
	assignedMerchants,
	assignMerchantModalOpen,
	setAssignMerchantModalOpen
}: any) => {
	const [merchantId, setMerchantId] = useInputState(null)
	const [mealPeriodIds, setMealPeriodIds] = useInputState([])

	const { data: merchants } = useMerchants()

	const allMerchants = merchants?.data

	const merchantsThatCanBeAssigned = useMemo(
		() =>
			filter(
				allMerchants,
				merchant => !includes(map(assignedMerchants, "id"), merchant?.id)
			),
		[allMerchants, assignedMerchants]
	)

	const { mutate: assignMerchantToHotel } = useAssignMerchantToHotel({
		onSuccess: () => {
			customNotification.success({
				title: "Assign merchant",
				message: "Merchant assigned successfully to the hotel"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Assign merchant",
				message: "Assigning merchant failed"
			})
		},
		onSettled: () => {
			refetchHotel()
			setMerchantId(null)
			setMealPeriodIds([])
			setAssignMerchantModalOpen(false)
		}
	})

	const merchantOptions = map(merchantsThatCanBeAssigned, merchant => ({
		value: merchant?.id,
		label: merchant?.name
	}))

	const mealPeriodOptions = (
		find(merchantsThatCanBeAssigned, { id: merchantId })?.mealPeriods || []
	)?.map((merchantMealPeriod: any) => ({
		value: merchantMealPeriod?.id,
		label: merchantMealPeriod?.name
	}))

	return (
		<StyledModal
			size='lg'
			opened={assignMerchantModalOpen}
			title={`Assign merchant to ${hotelName}`}
			onClose={() => setAssignMerchantModalOpen(false)}
			modalBody={
				<Flex direction='column'>
					{merchantsThatCanBeAssigned?.length ? (
						<>
							<StyledSelect
								required
								clearable
								label='Merchants'
								value={merchantId}
								data={merchantOptions}
								onChange={setMerchantId}
								mb={12}
							/>
							<StyledMultiSelect
								required
								clearable
								label='Meal periods'
								value={mealPeriodIds}
								disabled={!merchantId}
								data={mealPeriodOptions}
								onChange={setMealPeriodIds}
							/>
						</>
					) : (
						<NoData message='No merchants found' minHeight={200} />
					)}
				</Flex>
			}
			modalFooter={
				<Flex justify='space-between'>
					<StyledButton
						variant='outline'
						color='dark'
						onClick={() => setAssignMerchantModalOpen(false)}
					>
						Cancel
					</StyledButton>
					<StyledButton
						disabled={!merchantId || !mealPeriodIds?.length}
						color='green'
						onClick={() => {
							if (hotelId && merchantId) {
								assignMerchantToHotel({ hotelId, merchantId, mealPeriodIds })
							}
						}}
					>
						Assign merchant
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default AssignMerchantModal
