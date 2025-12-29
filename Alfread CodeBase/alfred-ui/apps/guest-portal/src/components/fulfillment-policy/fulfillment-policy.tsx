/* eslint-disable react/no-unescaped-entities */
import React from "react"
import {
	GoBackToMenu,
	FulfillmentPolicyContainer
} from "./fulfillment-policy.style"
import { ActionIcon, Flex } from "@mantine/core"
import { useRouter } from "next/router"
import { IconArrowLeft } from "@tabler/icons-react"

const FulfillmentPolicy = () => {
	const router = useRouter()
	return (
		<FulfillmentPolicyContainer>
			<Flex align='center' mb={12}>
				<ActionIcon
					onClick={() => {
						router.push(`/`)
					}}
					variant='transparent'
				>
					<IconArrowLeft />
				</ActionIcon>
				<GoBackToMenu>Back to menu</GoBackToMenu>
			</Flex>

			<h2>Fulfillment Policy</h2>
			<p>Last Updated: September 19, 2024</p>
			<p>
				Welcome to Alfred! We are committed to providing you with a seamless and
				satisfying hotel room service ordering experience. This Fulfillment
				Policy outlines our procedures and guidelines to ensure your order is
				processed efficiently.
			</p>
			<ol>
				<li>
					<h3>Order Confirmation</h3>
					<p>
						After your order is placed, you will receive a text confirmation
						once the restaurant has confirmed your order. There will be a link
						with your order details as well as an order tracker. Please review
						this information carefully to ensure accuracy.
					</p>
				</li>
				<li>
					<h3>Preparation and Dispatch</h3>
					<p>
						Preparation Time: Orders are typically prepared within 15-30 minutes
						from the time of confirmation, depending on the restaurant's kitchen
						capacity and order volume.
					</p>
					<p>
						Dispatch Notification: You will receive a text notification when
						your order has been picked up by a delivery personnel.
					</p>
				</li>
				<li>
					<h3>Delivery Timeframe</h3>
					<p>
						Estimated Delivery: We aim to deliver your order within 30 min after
						dispatch. Factors such as traffic, weather, and distance may affect
						delivery times.
					</p>
					<p>
						Real-time Tracking: You can track your delivery status through the
						link in your text notifications.
					</p>
				</li>
				<li>
					<h3>Order Modifications</h3>
					<p>
						Change Requests: If you need to modify or cancel your order, please
						contact our customer support team before it reaches the “Order
						Processed” stage. After this period, we may not be able to
						accommodate changes due to restaurant preparation schedules.
					</p>
				</li>
				<li>
					<h3>Order Accuracy</h3>
					<p>
						While we strive for accuracy, please make sure to double-check your
						order before finalizing it. If there is a discrepancy with your
						order upon delivery, please contact our customer support team
						immediately.
					</p>
				</li>
				<li>
					<h3>Delivery Issues</h3>
					<p>
						If you encounter any issues with your delivery (e.g., late delivery,
						missing items, or damaged food), please reach out to our customer
						support team within 24 hours of receiving your order. We will
						investigate and resolve the issue promptly.
					</p>
				</li>
				<li>
					<h3>Refunds and Returns</h3>
					<p>
						Refund Policy: If a refund is deemed appropriate it will be
						processed within 3-5 business days.
					</p>
					<p>
						Return Policy: For food safety reasons, we do not accept returns of
						delivered food items.
					</p>
				</li>
				<li>
					<h3>Contact Us</h3>
					<p>
						For any questions or concerns regarding your order fulfillment,
						please contact our customer support team at +1 (844) 738-0342.
					</p>
				</li>
			</ol>
			<p>
				Thank you for choosing Alfred! We appreciate your business and look
				forward to serving you.
			</p>
		</FulfillmentPolicyContainer>
	)
}

export default FulfillmentPolicy
