import { ActionIcon, Flex, Grid } from "@mantine/core"
import { StyledButton, StyledDivider } from "@/design-components"
import { CheckOutTimerContainer, GoBackToCart } from "../../order-page.style"
import { PAYMENT_METHOD } from "@/shared-constants"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { IconArrowLeft } from "@tabler/icons-react"
import useRefundVoucher from "@/hooks/voucher/useRefundVoucher"
import customNotification from "../../../../../../../shared/ui/shared-utils/customNotification"
import { cartActionTypes } from "@/components/order-page/reducers/cartReducerts"

const CheckoutPaymentForm = ({
	cartState,
	dispatchCart,
	setSecretKey
}: any) => {
	const router = useRouter()
	const stripe = useStripe()
	const elements = useElements()

	const [paymentEnabled, setPaymentEnabled] = useState(false)
	const [paymentInProgress, setPaymentInProgress] = useState(false)
	const [timeRemaining, setTimeRemaining] = useState(600)
	// eslint-disable-next-line no-unused-vars

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" })
	}, [])

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeRemaining(prevTime => {
				if (prevTime <= 1) {
					clearInterval(timer)
					return 0
				}
				return prevTime - 1
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [])

	useEffect(() => {
		if (timeRemaining <= 0) {
			customNotification.error({
				title: "Session expired",
				message: "Your session has expired. Please try again.",
				autoClose: true
			})
			handleBackClick()
		}
	}, [timeRemaining, cartState.currentHotel.webCode])

	const formatTime = (time: any) => {
		const minutes = Math.floor(time / 60)
		const seconds = time % 60
		return `${minutes < 10 ? "0" : ""}${minutes}:${
			seconds < 10 ? "0" : ""
		}${seconds}`
	}

	const { mutate: refundVoucher } = useRefundVoucher()

	const handleSubmit = async (event: any) => {
		setPaymentInProgress(true)
		event.preventDefault()

		if (!stripe || !elements) {
			return
		}

		const result = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/catering/order/${cartState?.order?.id}?orderStatus=success`
			}
		})

		if (result.error) {
			window.sessionStorage.setItem(
				"error_message",
				JSON.stringify({
					title: "Payment failed",
					message: "The payment has failed"
				})
			)
			router.push(`/${cartState.currentHotel.webCode}`)
		}
		setPaymentInProgress(false)
	}

	const handleBackClick = () => {
		refundVoucher(cartState?.order?.orderId)
		setSecretKey("")
		dispatchCart({ type: cartActionTypes.SET_ORDER_ID, id: "", orderId: 0 })
		dispatchCart({
			type: cartActionTypes.SET_SHOW_PAYMENT_PAGE,
			showPaymentPage: false
		})
	}

	return (
		<>
			<Grid.Col
				offsetXs={1}
				xs={10}
				offsetSm={1}
				sm={10}
				offsetMd={2}
				md={8}
				offsetLg={3}
				lg={6}
				offsetXl={3}
				xl={6}
			>
				<Flex align='flex-start' justify='space-between' mb={12}>
					<Flex align='center'>
						<ActionIcon onClick={handleBackClick}>
							<IconArrowLeft />
						</ActionIcon>
						<GoBackToCart>Check out</GoBackToCart>
					</Flex>
					<CheckOutTimerContainer>
						{formatTime(timeRemaining)}
					</CheckOutTimerContainer>
				</Flex>
			</Grid.Col>
			<Grid.Col
				offsetXs={1}
				xs={10}
				offsetSm={1}
				sm={5}
				offsetMd={2}
				md={4}
				offsetLg={3}
				lg={3}
				offsetXl={3}
				xl={3}
			>
				<StyledDivider label='Payment method' font='md700' mb={12} />
				{elements &&
				cartState?.order.orderType === PAYMENT_METHOD.CREDIT_CARD.value ? (
					<>
						<form onSubmit={handleSubmit}>
							<PaymentElement
								onChange={(event: any) => {
									if (event.complete === true) {
										setPaymentEnabled(true)
									} else {
										setPaymentEnabled(false)
									}
								}}
							/>
							<StyledButton
								type='submit'
								fullWidth={true}
								mt={24}
								mb={24}
								size='md'
								radius={8}
								color='indigo.9'
								loading={paymentInProgress}
								disabled={paymentInProgress || !stripe || !paymentEnabled}
							>
								Make payment
							</StyledButton>
						</form>
					</>
				) : null}
			</Grid.Col>
		</>
	)
}

export default CheckoutPaymentForm
