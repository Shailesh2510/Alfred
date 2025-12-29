import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import router from "next/router"
import React, { useImperativeHandle } from "react"
import useCartStore from "../../stores/useCartStore"
import useRefundVoucher from "@/hooks/voucher/useRefundVoucher"
import { customNotification } from "@/shared-utils"

const StripePaymentsElement = ({
	setPaymentEnabled,
	setPaymentInProgress,
	paymentRef,
	openOrderDetailsAccordion,
	cancelOrder
}: any) => {
	const stripe = useStripe()
	const elements = useElements()
	const { campaign_uid, short_code } = router.query

	const { mutate: refundVoucher } = useRefundVoucher()

	const { order, voucherCode, resetOrder, setOpenPaymentFailedModal } =
		useCartStore()

	const handleSubmit = async (clientSecret: string, event?: any) => {
		if (event) {
			event.preventDefault()
		}
		setPaymentInProgress(true)

		if (!stripe || !elements) {
			return
		}

		let return_url = `${window.location.origin}/order/${order?.id}?orderStatus=success`
		if (campaign_uid && short_code) {
			return_url += `&campaign_uid=${campaign_uid}&short_code=${short_code}`
		}

		const submitResult = await elements.submit()
		if (submitResult.error) {
			setPaymentInProgress(false)
			return
		}

		const result = await stripe.confirmPayment({
			elements,
			clientSecret: clientSecret,
			confirmParams: {
				return_url
			}
		})

		if (result.error) {
			if (!result?.error?.payment_intent) {
				cancelOrder({
					orderId: order?.orderId,
					orderCancelPayload: {
						reason: "Payment Failed",
						option: "Payment Failed"
					}
				})
			} else {
				openOrderDetailsAccordion()
				if (voucherCode) {
					refundVoucher(order?.orderId?.toString())
				}
				customNotification.error({
					title: "Payment failed",
					message: "The payment has failed, Please try again!"
				})
				setPaymentInProgress(false)
				setOpenPaymentFailedModal(true)
				router.back()
			}
		} else {
			setPaymentInProgress(false)
			resetOrder()
		}
	}

	useImperativeHandle(paymentRef, () => ({
		submit: (clientSecret: string) => handleSubmit(clientSecret, null)
	}))

	return (
		<>
			<form ref={paymentRef} onSubmit={event => handleSubmit("", event)}>
				<PaymentElement
					onChange={(event: any) => {
						if (event.complete === true) {
							setPaymentEnabled(true)
						} else {
							setPaymentEnabled(false)
						}
					}}
				/>
			</form>
		</>
	)
}

export default StripePaymentsElement
