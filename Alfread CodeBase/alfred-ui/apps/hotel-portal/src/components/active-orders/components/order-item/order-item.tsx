import { useRouter } from "next/router"
import { showPrice } from "@/shared-utils"
import {
	OrderBody,
	OrderContainer,
	OrderFooter,
	OrderHeader,
	OrderID,
	OrderTime,
	OrderInfoContainer,
	OrderInfoData,
	OrderInfoLabel,
	OrderTotalPrice,
	ReferredByContainer
} from "./order-item.style"
import { useMediaQuery } from "@mantine/hooks"
import { MERCHANT_TYPE_RIDES, PAYMENT_METHOD } from "@/shared-constants"

const OrderItem = ({
	orderId,
	orderNonce,
	orderTime,
	roomName,
	clientName,
	grandTotal,
	merchantType,
	isPaid,
	ambassadorName,
	paymentType
}: any) => {
	const router = useRouter()
	const isMobile = useMediaQuery("(max-width: 1000px)")

	return (
		<OrderContainer
			isRide={merchantType === MERCHANT_TYPE_RIDES}
			key={orderId}
			onClick={() => router.push(`/order-list/${orderId}`)}
		>
			<OrderHeader>
				<OrderID>
					{merchantType === MERCHANT_TYPE_RIDES ? `Ride: ` : `Food: `}#
					{orderNonce}
				</OrderID>
				<OrderTime>{orderTime}</OrderTime>
			</OrderHeader>
			<OrderBody>
				{merchantType !== MERCHANT_TYPE_RIDES && (
					<OrderInfoContainer isMobile={isMobile}>
						<OrderInfoLabel>Room:</OrderInfoLabel>
						<OrderInfoData>{roomName}</OrderInfoData>
					</OrderInfoContainer>
				)}
				<OrderInfoContainer isMobile={isMobile}>
					<OrderInfoLabel>Name:</OrderInfoLabel>
					<OrderInfoData>{clientName}</OrderInfoData>
				</OrderInfoContainer>
				{ambassadorName && (
					<ReferredByContainer>
						<OrderInfoLabel>Referred By:</OrderInfoLabel>
						<OrderInfoData>{ambassadorName}</OrderInfoData>
					</ReferredByContainer>
				)}
			</OrderBody>
			<OrderFooter>
				<OrderInfoContainer isMobile={isMobile}>
					<OrderInfoLabel>Payment:</OrderInfoLabel>
					<OrderTotalPrice>
						{paymentType === PAYMENT_METHOD.ROOM_CHARGE.value
							? PAYMENT_METHOD.ROOM_CHARGE.label
							: isPaid
							? `Completed`
							: `Pending`}
					</OrderTotalPrice>
				</OrderInfoContainer>
				<OrderInfoContainer isMobile={isMobile}>
					<OrderInfoLabel>Total:</OrderInfoLabel>
					<OrderTotalPrice>{showPrice(grandTotal)}</OrderTotalPrice>
				</OrderInfoContainer>
			</OrderFooter>
		</OrderContainer>
	)
}

export default OrderItem
