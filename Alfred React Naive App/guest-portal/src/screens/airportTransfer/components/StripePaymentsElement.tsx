import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React, { useImperativeHandle } from 'react'
import { SnackbarType } from '@/src/types/others'
import { useSnackbarStore } from '@/src/store/useSnackbarStore'
import { useRideStore } from '@/src/store/useRideStore'
import { router } from 'expo-router'
import { useCartStore } from '@/src/store/useCartStore'
import useRefundVoucher from '@/src/hooks/useRefundVoucher'
import { useGlobalStore } from '@/src/store/useGlobalStore'

const StripePaymentsElement = ({
	setPaymentEnabled,
	setPaymentInProgress,
	paymentRef,
	isRideBooking = false,
	cancelOrder
}: any) => {
	const stripe = useStripe()
	const elements = useElements()

	const { mutate: refundVoucher } = useRefundVoucher()

	const { setPaymentPending, setShowPaymentInProgressModal } = useGlobalStore()

	const { rideNonce, removeRide, orderId } = useRideStore()

	const {
		order: { nonce, orderId: foodOrderId },
		voucherCode,
		resetOrder
	} = useCartStore()

	const { setSnackbarMessage } = useSnackbarStore()

	const handleSubmit = async (clientSecret: string, event?: any) => {
		if (event) {
			event.preventDefault()
		}
		setPaymentInProgress(true)

		if (!stripe || !elements) {
			return
		}

		const return_url = `${globalThis.location.origin}/order-status/${isRideBooking ? rideNonce : nonce}`
		const submitResult = await elements.submit()
		if (submitResult.error) {
			setPaymentInProgress(false)
			setPaymentPending(false)
			setShowPaymentInProgressModal(false)
			setPaymentPending(false)
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
			if (result?.error?.payment_intent === undefined) {
				cancelOrder({
					orderId: isRideBooking ? orderId : foodOrderId,
					orderCancelPayload: {
						reason: 'Payment Failed',
						option: 'Payment Failed'
					}
				})
			} else {
				if (voucherCode) {
					refundVoucher(foodOrderId?.toString())
				}
				setSnackbarMessage(
					true,
					SnackbarType.ERROR,
					'Payment failed',
					'The payment has failed, Please try again!'
				)
				setPaymentPending(false)
				setPaymentInProgress(false)
				setShowPaymentInProgressModal(false)
				router.back()
			}
		} else {
			setPaymentPending(false)
			setShowPaymentInProgressModal(false)
			setPaymentInProgress(false)
			resetOrder()
			setPaymentPending(false)
			removeRide()
		}
	}

	useImperativeHandle(paymentRef, () => ({
		submit: (clientSecret: string) => handleSubmit(clientSecret, null)
	}))

	return (
		<>
			<form ref={paymentRef} onSubmit={event => handleSubmit('', event)}>
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
