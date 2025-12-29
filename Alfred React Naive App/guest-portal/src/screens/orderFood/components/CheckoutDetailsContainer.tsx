import React, { useState } from 'react'
import { View, Pressable } from 'react-native'
import { Text } from '@components/ui/text'
import { Ionicons } from '@expo/vector-icons'
import { useCartStore } from '@/src/store/useCartStore'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import { QuestionMarkIcon } from '@/src/components/ui/icons/QuestionMarkIcon'
import { formatPrice } from '@/src/utils/validation-utils/formatPrice'
import useVoucher from '@/src/hooks/useVoucher'
import { useSnackbarStore } from '@/src/store/useSnackbarStore'
import { SnackbarType } from '@/src/types/others'
import ServiceFeeModal from '@/src/components/modals/ServiceFeeModal'
import { DEFAULT_IN_HOUSE_DELIVERY_FEE_AMOUNT_USD } from '@/src/utils/constants'
import areSimilarCoordinates from '@/src/utils/validation-utils/areSimilarCoordinates'
import { useLocalSearchParams } from 'expo-router'
import { calculateDeliveryFee } from '@/src/utils/validation-utils/calculateDeliveryFee'
import { CommentSection } from './review-order-items/CommentSection'
import { PromoCodeSection } from './review-order-items/PromoCodeSection'
import { CloseIcon } from '@/src/components/ui/icons/CloseIcon'
import useTotalPrice from '@/src/utils/validation-utils/calculateTotalPrice'

const getTotalPrice = (item: any, modifierOptions: any) => {
	const modifiersTotal =
		modifierOptions?.reduce(
			(sum: any, option: any) => sum + (option.price || 0),
			0
		) || 0
	const itemTotalWithModifiers = (item.price + modifiersTotal) * item.quantity
	return itemTotalWithModifiers.toFixed(2)
}

const CheckoutDetailsContainer = () => {
	const { merchantId } = useLocalSearchParams<{ merchantId: string }>()
	const [isExpanded, setIsExpanded] = useState(true)
	const [isServiceFeeModalVisible, setServiceFeeModalVisible] = useState(false)
	const [showPromoCodeInput, setShowPromoCodeInput] = useState(false)
	const { merchantDetails, currentHotelDetails, selectedMerchantCoordinates } =
		useGlobalStore()
	const { setSnackbarMessage } = useSnackbarStore()
	const {
		order,
		setOrderComment,
		setVoucher,
		deliveryFee,
		tipByUser,
		setVoucherCode
	} = useCartStore()

	const { mutate: fetchVoucher, isPending } = useVoucher({
		onSuccess: (data: any) => {
			if (data) {
				setVoucher({
					code: data.code,
					total_amount: data.total_amount,
					type: data.type,
					amount_type: data.amount_type,
					id: data.id
				})
				setVoucherCode('')
			} else {
				setSnackbarMessage(
					true,
					SnackbarType.ERROR,
					'Invalid Code',
					'Please enter a valid promo code'
				)
				setVoucher(null)
				setVoucherCode('')
			}
			setShowPromoCodeInput(false)
		}
	})

	const handleApplyPromoCode = async (code: string) => {
		fetchVoucher({
			voucherCode: code,
			hotelId: currentHotelDetails?._id?.toString() || ''
		})
	}

	const handleRemovePromoCode = () => {
		setVoucher(null)
		setVoucherCode('')
	}

	const selectedMerchantDetails = merchantDetails.find(merchant => {
		return merchant.id === +merchantId
	})

	const hasDeliveryFee = areSimilarCoordinates(
		currentHotelDetails?.coordinates,
		selectedMerchantCoordinates
	)
		? false
		: currentHotelDetails?.hasDeliveryFee

	const {
		totalPrice,
		undiscountedSubTotalPrice,
		taxAmount,
		totalDifference,
		serviceFee,
		calculatedTip
	} = useTotalPrice({
		voucher: order.voucher,
		tip: tipByUser,
		items: order?.items,
		taxRate: selectedMerchantDetails?.tax_rate || 0,
		isTaxExempt: currentHotelDetails?.isTaxExempt,
		deliveryFee: calculateDeliveryFee(
			hasDeliveryFee ?? true,
			selectedMerchantDetails?.has_third_party_delivery ?? true,
			deliveryFee,
			currentHotelDetails?.deliveryFee ??
				DEFAULT_IN_HOUSE_DELIVERY_FEE_AMOUNT_USD
		),
		hasDeliveryFee: hasDeliveryFee,
		isMandatoryTipEnabled: currentHotelDetails?.enableAutomaticTip,
		isDeliveryInSamePlace: areSimilarCoordinates(
			currentHotelDetails?.coordinates,
			selectedMerchantCoordinates
		),
		tipByUser: order.tip
	})

	return (
		<View>
			<Pressable
				onPress={() => setIsExpanded(!isExpanded)}
				className='flex-row justify-between items-center p-[12] bg-gray-300'
			>
				<Text variant='h5' className='font-bold text-blue-700'>
					Order Details
				</Text>
				<Ionicons
					name={isExpanded ? 'chevron-up' : 'chevron-down'}
					size={20}
					color='#052151'
				/>
			</Pressable>
			{isExpanded && (
				<View className='bg-gray-250'>
					{order.items.map(item => (
						<View
							key={item.cartItemId}
							className='flex-row justify-between py-[16] px-[24]'
						>
							<Text variant='p2Medium' className='text-blue-700'>
								{`${item.quantity} x ${item.name}`}
							</Text>
							<Text variant='p2Medium' className='text-blue-700'>
								$
								{getTotalPrice(
									item,
									item?.modifiers

										?.map((modifier: { options: any }) => modifier.options)
										.flat() || []
								)}
							</Text>
						</View>
					))}
					<View className='px-[24]'>
						<CommentSection />
					</View>
					<View className='px-[24]'>
						<View className='h-[1px] bg-white my-4' />
						<View className='flex-row justify-between py-[16]'>
							<Text variant='p2Heavy' className='text-blue-700'>
								Subtotal
							</Text>
							<Text variant='p2Heavy' className='text-blue-700'>
								{formatPrice(undiscountedSubTotalPrice)}
							</Text>
						</View>
						<View className='h-[1px] bg-white mb-4' />
						<View className='flex-row justify-between items-center mb-3'>
							<View className='flex-row items-center'>
								<Text variant='p2Medium' className='text-blue-700 mr-1'>
									Service Fee
								</Text>
								<Pressable onPress={() => setServiceFeeModalVisible(true)}>
									<QuestionMarkIcon width='16' height='16' color='#052151' />
								</Pressable>
							</View>
							<Text variant='p2Medium' className='text-blue-700'>
								{formatPrice(serviceFee)}
							</Text>
						</View>

						<View className='flex-row justify-between mb-3'>
							<Text variant='p2Medium' className='text-blue-700'>
								{`Tip`} ({tipByUser * 100}%)
							</Text>
							<Text variant='p2Medium' className='text-blue-700'>
								{formatPrice(calculatedTip)}
							</Text>
						</View>

						<View className='flex-row justify-between mb-3'>
							<Text variant='p2Medium' className='text-blue-700'>
								Tax
							</Text>
							<Text variant='p2Medium' className='text-blue-700'>
								{formatPrice(taxAmount)}
							</Text>
						</View>

						{order.voucher?.code ? (
							<View className='flex-row justify-between items-center py-[16]'>
								<View className='flex-row items-center gap-[8]'>
									<Text variant='p2Medium' className='text-utility-green500'>
										{order.voucher?.code}
									</Text>
									<Pressable onPress={handleRemovePromoCode}>
										<CloseIcon color='#2454A4' height='16' width='16' />
									</Pressable>
								</View>
								<Text variant='p2Medium' className='text-utility-green500'>
									-{formatPrice(totalDifference)}
								</Text>
							</View>
						) : null}

						<View className='h-[1px] bg-white my-4' />

						<View className='flex-row justify-between'>
							<Text variant='h4' className='text-blue-700'>
								Total
							</Text>
							<Text variant='h4' className='text-blue-700'>
								{formatPrice(totalPrice)}
							</Text>
						</View>
						<View className='py-[16]'>
							<PromoCodeSection
								onApply={handleApplyPromoCode}
								appliedCode={order.voucher?.code}
								isLoading={isPending}
								setShowInput={setShowPromoCodeInput}
								showInput={showPromoCodeInput}
							/>
						</View>
					</View>
				</View>
			)}

			<ServiceFeeModal
				visible={isServiceFeeModalVisible}
				onClose={() => setServiceFeeModalVisible(false)}
			/>
		</View>
	)
}

export default CheckoutDetailsContainer
