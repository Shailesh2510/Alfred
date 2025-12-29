import { StyledModal } from "@/design-components"
import React from "react"
import { Flex } from "@mantine/core"
import { CartHeader } from "./cart-modal.style"
import NewCart from "../cart/new-cart"
import useCartStore from "../../stores/useCartStore"

const NewCartModal = ({
	mealPeriodStartHour,
	mealPeriodEndHour,
	setShowAlcoholConsentModal,
	setScheduleOrderModalOpen,
	scheduleOrderModalOpen
}: any) => {
	const { setShowCartModal, showCartModal } = useCartStore()

	const handleOnClose = () => {
		setShowCartModal(false)
	}

	React.useEffect(() => {
		if (scheduleOrderModalOpen) {
			setShowCartModal(false)
		}
	}, [scheduleOrderModalOpen])

	return (
		<StyledModal
			size='md'
			centered={true}
			opened={showCartModal}
			onClose={handleOnClose}
			title={<CartHeader>Cart</CartHeader>}
			modalBody={
				<Flex direction='column' justify='center'>
					<NewCart
						setScheduleOrderModalOpen={setScheduleOrderModalOpen}
						mealPeriodStartHour={mealPeriodStartHour}
						mealPeriodEndHour={mealPeriodEndHour}
						setShowAlcoholConsentModal={setShowAlcoholConsentModal}
					/>
				</Flex>
			}
		/>
	)
}

export default NewCartModal
