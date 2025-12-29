import {
	StyledButton,
	StyledModal,
	StyledNumberInput,
	StyledSelect,
	StyledTextarea
} from "@/design-components"
import usePaymentRefund from "@/hooks/payment/usePaymentRefund"
import { Flex } from "@mantine/core"
import { useForm } from "@mantine/form"
import { isEmpty, orderBy } from "lodash"
import { customNotification } from "@/shared-utils"

const REFUND_REASON: any = {
	REQUESTED_BY_CUSTOMER: {
		value: "requested_by_customer",
		label: "Requested by customer"
	}
}

const RefundModal = ({ orderId, refundModalOpen, setRefundModalOpen }: any) => {
	const form = useForm({
		initialValues: {
			note: "",
			reason: "",
			amount: 0
		},
		validate: (values: any) => {
			return {
				amount: values.amount > 0 ? null : "Amount is required",
				reason: values.reason?.length ? null : "Reason is required"
			}
		},
		transformValues(values: any) {
			return {
				note: values.note,
				reason: values.reason,
				amount: values.amount?.toString()
			}
		}
	})

	const { mutate: paymentRefund } = usePaymentRefund({
		onSuccess: () => {
			customNotification.success({
				title: "Refund order",
				message: "Order refunded successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Refund order",
				message: "Order refund failed"
			})
		}
	})

	const refundReasonOptions = orderBy(Object.values(REFUND_REASON), "label")

	const onClose = () => {
		form.reset()
		setRefundModalOpen(false)
	}

	return (
		<StyledModal
			size='lg'
			opened={refundModalOpen}
			title={"Refund order"}
			onClose={onClose}
			modalBody={
				<Flex direction='column' rowGap={16}>
					<StyledNumberInput
						required
						min={0}
						max={100}
						suffix='%'
						precision={2}
						label='Refund amount'
						placeholder='Refund amount'
						{...form.getInputProps("amount")}
					/>
					<StyledSelect
						required
						label='Refund reason'
						placeholder='Refund reason'
						data={refundReasonOptions}
						{...form.getInputProps("reason")}
					/>
					<StyledTextarea
						label='Refund note'
						placeholder='Refund note'
						{...form.getInputProps("note")}
					/>
				</Flex>
			}
			modalFooter={
				<Flex justify='space-between'>
					<StyledButton variant='outline' color='dark' onClick={onClose}>
						Cancel
					</StyledButton>
					<StyledButton
						disabled={!form.isValid()}
						color='green'
						onClick={() => {
							form.validate().errors
							if (isEmpty(form.validate().errors)) {
								paymentRefund({
									orderId,
									...(form.getTransformedValues(form.values) || [])
								})
							}
							onClose()
						}}
					>
						Refund order
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default RefundModal
