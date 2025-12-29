import {
	StyledButton,
	StyledModal,
	StyledNumberInput
} from "@/design-components"
import { Flex } from "@mantine/core"
import { useForm } from "@mantine/form"
import { isEmpty, toNumber } from "lodash"
import { customNotification } from "@/shared-utils"
import useVoucherRefund from "@/hooks/payment/useVoucherRefund"
import { useEffect } from "react"

const RefundVoucherModal = ({
	orderId,
	refundVoucherModalOpen,
	setRefundVoucherModalOpen,
	refetchOrder,
	appliedVoucherAmount
}: any) => {
	const form = useForm({
		validateInputOnChange: true,
		validate: (values: any) => {
			const errors: { amount?: string } = {}

			if (values.amount <= 0) {
				errors.amount = "Amount must be greater than 0"
			} else if (values.amount > appliedVoucherAmount) {
				errors.amount = `Amount cannot be greater than voucher used (Max refund: ${appliedVoucherAmount})`
			}

			return errors
		},
		transformValues(values: any) {
			return {
				amount: toNumber(values.amount).toFixed(2)
			}
		}
	})

	const { mutate: voucherRefund } = useVoucherRefund({
		onSuccess: () => {
			customNotification.success({
				title: "Refund voucher",
				message: "voucher refunded successfully"
			})
			refetchOrder()
		},
		onError: () => {
			customNotification.error({
				title: "Refund voucher",
				message: "Voucher refund failed"
			})
		}
	})

	useEffect(() => {
		if (appliedVoucherAmount) {
			form.setValues({
				amount: toNumber(appliedVoucherAmount)
			})
		}
	}, [appliedVoucherAmount])

	const onClose = () => {
		form.reset()
		setRefundVoucherModalOpen(false)
	}

	return (
		<StyledModal
			size='lg'
			opened={refundVoucherModalOpen}
			title={"Refund Voucher"}
			onClose={onClose}
			modalBody={
				<Flex direction='column' rowGap={16}>
					<StyledNumberInput
						required
						precision={2}
						label='Refund voucher amount'
						placeholder='Refund voucher amount'
						{...form.getInputProps("amount")}
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
								voucherRefund({
									orderId,
									...(form.getTransformedValues(form.values) || [])
								})
							}
							onClose()
						}}
					>
						Refund Voucher
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default RefundVoucherModal
