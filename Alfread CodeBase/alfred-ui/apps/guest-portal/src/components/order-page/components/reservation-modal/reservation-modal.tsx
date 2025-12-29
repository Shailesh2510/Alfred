import { StyledButton, StyledModal, StyledTextInput } from "@/design-components"
import React, { useState } from "react"
import { Flex } from "@mantine/core"
import { customNotification } from "@/shared-utils"
import { useRouter } from "next/router"
import useReservationVoucher from "@/hooks/voucher/useReservationVoucher"
import phone from "phone"
import useCartStore from "../../stores/useCartStore"

const ReservationModal = ({
	showReservationConfirmation,
	setShowReservationConfirmation
}: any) => {
	const router = useRouter()
	const { hotelId } = router.query
	const [lastName, setLastName] = useState<string>("")
	const [roomNumber, setRoomNumber] = useState<string>("")
	const { setReservationDiscount } = useCartStore()

	const { mutate: getAutomaticVoucher, isLoading: reservationVoucherLoading } =
		useReservationVoucher({
			onSuccess: (response: any) => {
				setReservationDiscount({
					clientName: response.guestName,
					clientEmail: response.guestEmail,
					roomNumber: response.roomNumber,
					voucherCode: response.voucherCode,
					clientNumber: phone(response.guestPhone).phoneNumber ?? ""
				})
				setShowReservationConfirmation(false)
				response.voucherCode
					? router.push(`/${hotelId}?voucher=${response.voucherCode}`)
					: router.push(`/${hotelId}`)
			},
			onError: () => {
				customNotification.error({
					title: "Reservation",
					message: "Reservation not found"
				})
				setLastName("")
				setRoomNumber("")
			}
		})

	return (
		<StyledModal
			size='md'
			centered={true}
			opened={showReservationConfirmation}
			onClose={() => setShowReservationConfirmation(false)}
			title='Find your reservation'
			modalBody={
				<Flex rowGap={12} direction='column'>
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
			}
			modalFooter={
				<StyledButton
					fullWidth
					disabled={
						!(hotelId && roomNumber && lastName) || reservationVoucherLoading
					}
					onClick={() => {
						if (hotelId && roomNumber && lastName) {
							getAutomaticVoucher({
								webCode: hotelId,
								roomNumber,
								lastName
							})
						}
					}}
				>
					Submit
				</StyledButton>
			}
		/>
	)
}

export default ReservationModal
