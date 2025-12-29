import useHotels from "@/hooks/hotel/useHotels"
import { WelcomeLabel, WelcomePageContainer } from "./welcome-page.style"
import {
	StyledButton,
	StyledSelect,
	StyledTextInput
} from "@/design-components"
import { useMemo, useState } from "react"
import { map } from "lodash"
import { Flex } from "@mantine/core"
import { cartActionTypes } from "../order-page/reducers/cartReducerts"
import { useRouter } from "next/router"
import { phone } from "phone"
import useReservationVoucher from "@/hooks/voucher/useReservationVoucher"
import { customNotification } from "@/shared-utils"

const WelcomePage = ({ dispatchCart }: any) => {
	const router = useRouter()

	const [lastName, setLastName] = useState<string>("")
	const [roomNumber, setRoomNumber] = useState<string>("")
	const [hotelWebCode, setHotelWebCode] = useState<any>("")

	const { data: hotels } = useHotels()

	const { mutate: getAutomaticVoucher, isLoading: reservationVoucherLoading } =
		useReservationVoucher({
			onSuccess: (response: any) => {
				dispatchCart({
					type: cartActionTypes.RESERVATION_DISCOUNT,
					clientName: response.guestName,
					clientEmail: response.guestEmail,
					roomNumber: response.roomNumber,
					voucherCode: response.voucherCode,
					clientNumber: phone(response.guestPhone).phoneNumber ?? ""
				})
				response.voucherCode
					? router.push(`/${hotelWebCode}?voucher=${response.voucherCode}`)
					: router.push(`/${hotelWebCode}`)
			},
			onError: () => {
				customNotification.error({
					title: "Reservation",
					message: "Reservation not found"
				})
			}
		})

	const hotelOptions = useMemo(
		() =>
			map(hotels, hotel => ({
				label: hotel?.name,
				value: hotel?.webCode
			})),
		[hotels]
	)

	return (
		<WelcomePageContainer>
			<Flex direction='column' rowGap={12}>
				<WelcomeLabel>Find your reservation</WelcomeLabel>
				<StyledSelect
					disabled={true}
					required
					searchable
					label='Hotel'
					width={400}
					value={hotelWebCode}
					placeholder='Hotel'
					data={hotelOptions}
					onChange={(value: string) => setHotelWebCode(value)}
				/>
				<Flex columnGap={12}>
					<StyledTextInput
						required
						label='Last Name'
						width={200}
						value={lastName}
						placeholder='Last Name'
						onChange={(event: any) => setLastName(event?.target?.value)}
					/>
					<StyledTextInput
						required
						label='Room Number'
						width={200}
						value={roomNumber}
						placeholder='Room Number'
						onChange={(event: any) => setRoomNumber(event?.target?.value)}
					/>
				</Flex>
				<StyledButton
					disabled={
						!(hotelWebCode && roomNumber && lastName) ||
						reservationVoucherLoading
					}
					onClick={() => {
						if (hotelWebCode && roomNumber && lastName) {
							getAutomaticVoucher({
								webCode: hotelWebCode,
								roomNumber,
								lastName
							})
						}
					}}
				>
					Submit
				</StyledButton>
			</Flex>
		</WelcomePageContainer>
	)
}

export default WelcomePage
