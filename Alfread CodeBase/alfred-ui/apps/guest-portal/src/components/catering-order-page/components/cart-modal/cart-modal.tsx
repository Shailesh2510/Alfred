import { StyledModal } from "@/design-components"
import React from "react"
import { Flex } from "@mantine/core"
import { cartActionTypes } from "../../reducers/cartReducer"
import Cart from "../cart/cart"
import { CartHeader } from "./cart-modal.style"

const CartModal = ({
	cartState,
	dispatchCart,
	setCartHasAlcohol,
	setScheduleOrderModalOpen,
	scheduleOrderModalOpen
}: any) => {
	const handleOnClose = () => {
		dispatchCart({ type: cartActionTypes.SET_SHOW_CART_MODAL, payload: false })
	}

	React.useEffect(() => {
		if (scheduleOrderModalOpen) {
			dispatchCart({
				type: cartActionTypes.SET_SHOW_CART_MODAL,
				payload: false
			})
		}
	}, [scheduleOrderModalOpen])

	return (
		<StyledModal
			size='md'
			centered={true}
			opened={cartState.showCartModal}
			onClose={handleOnClose}
			title={<CartHeader>Cart</CartHeader>}
			modalBody={
				<Flex direction='column' justify='center'>
					<Cart
						cartState={cartState}
						dispatchCart={dispatchCart}
						setCartHasAlcohol={setCartHasAlcohol}
						setScheduleOrderModalOpen={setScheduleOrderModalOpen}
					/>
				</Flex>
			}
		/>
	)
}

export default CartModal
