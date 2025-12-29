import { Grid } from "@mantine/core"
import {
	StyledCountryPhoneNumber,
	StyledNumberInput,
	StyledTextInput
} from "@/design-components"
import useCartStore from "../../stores/useCartStore"
import useGlobalStore from "@/globalStore/globalStore"
const CheckoutGuestForm = ({ form }: any) => {
	const {
		setOrderClientName,
		setOrderClientNumber,
		setOrderClientEmail,
		setOrderRoomNumber,
		setOrderTip,
		setOrderComment,
		setCalculatedAdditionalTip
	} = useCartStore()

	const { currentHotelDetails } = useGlobalStore()

	return (
		<>
			<Grid.Col>
				<StyledTextInput
					label='Name'
					required
					{...form.getInputProps("clientName")}
					onChange={(clientName: any) => {
						form.setFieldValue("clientName", clientName?.target.value)
						setOrderClientName(clientName?.target.value)
					}}
				/>
				<StyledTextInput
					label='Room number'
					{...form.getInputProps("roomNumber")}
					required
					onChange={(roomNumber: any) => {
						form.setFieldValue("roomNumber", roomNumber?.target.value)
						setOrderRoomNumber(roomNumber?.target.value)
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
						setOrderClientNumber(formattedValue)
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
						setOrderClientEmail(clientEmail?.target.value)
					}}
				/>
				{!currentHotelDetails?.enableAutomaticTip ? (
					<StyledNumberInput
						mb={12}
						precision={2}
						label='Add Tip (Optional)'
						{...form.getInputProps("tip")}
						onChange={(tip: any) => {
							const validTip = isNaN(tip) || tip < 0 ? 0 : tip
							form.setFieldValue("tip", validTip)
							setOrderTip(validTip)
							setCalculatedAdditionalTip(0)
						}}
					/>
				) : null}
				<StyledTextInput
					label='Comment'
					size='lg'
					minRows={2}
					{...form.getInputProps("comment")}
					onChange={(comment: any) => {
						form.setFieldValue("comment", comment?.target.value)
						setOrderComment(comment?.target.value)
					}}
				/>
			</Grid.Col>
		</>
	)
}

export default CheckoutGuestForm
