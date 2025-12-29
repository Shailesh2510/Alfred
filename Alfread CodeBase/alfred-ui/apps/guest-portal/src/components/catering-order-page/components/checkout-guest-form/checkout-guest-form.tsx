import { Grid } from "@mantine/core"
import { StyledCountryPhoneNumber, StyledTextInput } from "@/design-components"
import { cartActionTypes } from "@/components/order-page/reducers/cartReducerts"

const CheckoutGuestForm = ({ dispatchCart, form }: any) => {
	return (
		<>
			<Grid.Col>
				<StyledTextInput
					label='Name'
					required
					{...form.getInputProps("clientName")}
					onChange={(clientName: any) => {
						form.setFieldValue("clientName", clientName?.target.value)
						dispatchCart({
							type: cartActionTypes.SET_ORDER_CLIENT_NAME,
							clientName: clientName?.target.value
						})
					}}
				/>
				<StyledCountryPhoneNumber
					label='Phone number'
					value={form.getInputProps("clientNumber").value}
					onChange={(
						value: any,
						data: any,
						event: any,
						formattedValue: any
					) => {
						form.setFieldValue("clientNumber", formattedValue)
						dispatchCart({
							type: cartActionTypes.SET_ORDER_CLIENT_NUMBER,
							clientNumber: formattedValue
						})
					}}
					error={form.errors.clientNumber}
				/>
				<StyledTextInput
					label='Email'
					required
					mb={12}
					{...form.getInputProps("clientEmail")}
					onChange={(clientEmail: any) => {
						form.setFieldValue("clientEmail", clientEmail?.target.value)
						dispatchCart({
							type: cartActionTypes.SET_ORDER_CLIENT_EMAIL,
							clientEmail: clientEmail?.target.value
						})
					}}
				/>
				<StyledTextInput
					label='Comment'
					size='lg'
					minRows={2}
					{...form.getInputProps("comment")}
					onChange={(comment: any) => {
						form.setFieldValue("comment", comment?.target.value)
						dispatchCart({
							type: cartActionTypes.SET_ORDER_COMMENT,
							comment: comment?.target.value
						})
					}}
				/>
			</Grid.Col>
		</>
	)
}

export default CheckoutGuestForm
