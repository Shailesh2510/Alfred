import { IconTag } from "@tabler/icons-react"
import { StyledButton, StyledTextInput } from "@/design-components"
import { Flex, Grid, Alert } from "@mantine/core"
import {
	VoucherInputContainer,
	VoucherInfoLabel,
	VoucherInfoContainer
} from "./discount.style"
import { DISCOUNT_VOUCHER_TYPE, VOUCHER_TYPES } from "@/shared-constants"
import { showPrice } from "@/shared-utils"
import { useEffect } from "react"
import { useRouter } from "next/router"
import useQueryString from "@/custom-hooks/useQueryString"
import useCartStore from "../../stores/useCartStore"
import useGlobalStore from "@/globalStore/globalStore"
import useRideStore from "@/components/merchant-offerings/store/useRideStore"

const getBannerLabel = (voucher: any) => {
	let bannerLabel = ""

	if (voucher?.claimed_date) {
		bannerLabel = "Voucher code is already claimed"
	}

	if (voucher) {
		switch (voucher?.type) {
			case VOUCHER_TYPES.DISCOUNT.value: {
				if (voucher?.amount_type === DISCOUNT_VOUCHER_TYPE.PERCENTAGE.value) {
					return `Total amount: ${parseFloat(voucher.total_amount)?.toFixed(
						2
					)}%`
				} else if (voucher?.amount_type === DISCOUNT_VOUCHER_TYPE.FIXED.value) {
					return `Total amount: ${showPrice(voucher.total_amount)}`
				}
				return ""
			}
			case VOUCHER_TYPES.PER_DIEM.value: {
				return `Total amount: ${showPrice(
					voucher.total_amount
				)} Amount remaining: ${showPrice(
					voucher.total_amount - voucher.amount_used
				)}`
			}
		}
	}

	return bannerLabel
}

const Discount = ({ voucherLoading, fetchVoucher }: any) => {
	const router = useRouter()
	const queryString = useQueryString()

	const voucherCodeFromRoute = router.query.voucher

	const { voucherCode, setVoucherCode, order, setVoucher, setOrderTip } =
		useCartStore()

	const {
		setRideVoucher,
		voucherCode: rideVoucherCode,
		setRideVoucherCode,
		ride
	} = useRideStore()

	const { currentHotelDetails } = useGlobalStore()

	const bannerLabel = getBannerLabel(order?.voucher)

	useEffect(() => {
		if (router.isReady && currentHotelDetails && voucherCodeFromRoute) {
			const voucherCode = Array.isArray(voucherCodeFromRoute)
				? voucherCodeFromRoute[0]
				: voucherCodeFromRoute

			setVoucherCode(voucherCode)
			setRideVoucherCode(voucherCode)
			fetchVoucher({
				voucherCode: voucherCodeFromRoute,
				hotelId: currentHotelDetails.id
			})
		}
	}, [voucherCodeFromRoute, currentHotelDetails])

	const voucher = order?.voucher || ride?.voucher

	return (
		<Grid py={36}>
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
				<VoucherInputContainer>
					<Grid align='center'>
						<Grid.Col md={12} xl={7}>
							<Flex align='center' columnGap={8}>
								<IconTag size={22} />
								<VoucherInfoLabel>
									Get your discount by entering your voucher promo code
								</VoucherInfoLabel>
							</Flex>
						</Grid.Col>
						<Grid.Col md={12} xl={5}>
							<Flex align='center' columnGap={8}>
								<StyledTextInput
									clearable
									placeholder='Enter promo code here'
									tabIndex={-1}
									onFocus={(e: { target: { blur: () => void } }) => {
										if (document.activeElement?.id === "search-input") {
											e.target.blur()
										}
									}}
									onKeyDown={(e: {
										key: string
										currentTarget: { blur: () => any }
										preventDefault: () => void
										stopPropagation: () => void
									}) => {
										if (e.key === "Enter") {
											e.preventDefault()
											e.stopPropagation()
											e.currentTarget.blur()
										}
									}}
									style={{ flexGrow: 100 }}
									value={voucherCode || rideVoucherCode}
									onChange={(event: any) => {
										setVoucherCode(event.target.value)
										setRideVoucherCode(event.target.value)
									}}
								/>
								<StyledButton
									loading={voucherLoading}
									onClick={() => {
										fetchVoucher({
											voucherCode: voucherCode || rideVoucherCode,
											hotelId: currentHotelDetails.id
										})
									}}
								>
									Submit
								</StyledButton>
							</Flex>
						</Grid.Col>
					</Grid>
				</VoucherInputContainer>
				{!voucherLoading && voucher ? (
					<>
						{voucher?.type ? (
							<Alert
								radius={8}
								color='green'
								variant='filled'
								withCloseButton
								onClose={() => {
									queryString([{ fieldName: "voucher", value: "" }])
									setVoucher(null)
									setRideVoucher(null)
									setVoucherCode("")
									setRideVoucherCode("")
									setOrderTip(0)
								}}
							>
								<VoucherInfoContainer>
									<div>
										Voucher code:&nbsp; <b>{voucher?.code}</b>
									</div>
									<div>{bannerLabel}</div>
								</VoucherInfoContainer>
							</Alert>
						) : (
							<Alert
								radius={8}
								color='red'
								variant='filled'
								withCloseButton
								onClose={() => {
									queryString([{ fieldName: "voucher", value: "" }])
									setVoucher(null)
									setRideVoucher(null)
									setVoucherCode("")
									setRideVoucherCode("")
									setOrderTip(0)
								}}
							>
								<VoucherInfoContainer>Voucher not found</VoucherInfoContainer>
							</Alert>
						)}
					</>
				) : null}
			</Grid.Col>
		</Grid>
	)
}

export default Discount
