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
import { cartActionTypes } from "../../reducers/cartReducer"
import { useEffect } from "react"
import { useRouter } from "next/router"
import useQueryString from "@/custom-hooks/useQueryString"

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

const Discount = ({
	cartState,
	voucherLoading,
	fetchVoucher,
	dispatchCart
}: any) => {
	const router = useRouter()
	const queryString = useQueryString()

	const voucherCode = router.query.voucher

	const bannerLabel = getBannerLabel(cartState?.order?.voucher)

	useEffect(() => {
		if (router.isReady && cartState?.currentHotel && voucherCode) {
			dispatchCart({ type: cartActionTypes.SET_VOUCHER_CODE, voucherCode })
			fetchVoucher({
				voucherCode: voucherCode,
				hotelId: cartState?.currentHotel?.id
			})
		}
	}, [voucherCode, cartState?.currentHotel])

	const voucher = cartState?.order?.voucher

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
									value={cartState?.voucherCode}
									onChange={(event: any) =>
										dispatchCart({
											type: cartActionTypes.SET_VOUCHER_CODE,
											voucherCode: event.target.value
										})
									}
								/>
								<StyledButton
									loading={voucherLoading}
									onClick={() => {
										fetchVoucher({
											voucherCode: cartState?.voucherCode,
											hotelId: cartState?.currentHotel?.id
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
									dispatchCart({
										type: cartActionTypes.SET_VOUCHER,
										voucher: null
									})
									dispatchCart({
										type: cartActionTypes.SET_VOUCHER_CODE,
										voucherCode: ""
									})
									dispatchCart({
										type: cartActionTypes.SET_ORDER_TIP,
										tip: 0
									})
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
									dispatchCart({
										type: cartActionTypes.SET_VOUCHER,
										voucher: null
									})
									dispatchCart({
										type: cartActionTypes.SET_VOUCHER_CODE,
										voucherCode: ""
									})
									dispatchCart({
										type: cartActionTypes.SET_ORDER_TIP,
										tip: 0
									})
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
