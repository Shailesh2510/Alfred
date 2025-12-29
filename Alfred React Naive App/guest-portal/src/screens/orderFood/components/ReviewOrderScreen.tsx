import React, { useEffect, useState } from 'react'
import { View, Image, Pressable } from 'react-native'
import { Text } from '@components/ui/text'
import { CartItem } from './review-order-items/CartItem'
import { CommentSection } from './review-order-items/CommentSection'
import { PromoCodeSection } from './review-order-items/PromoCodeSection'
import { TipSelector } from './review-order-items/TipSelector'
import { QuestionMarkIcon } from '@/src/components/ui/icons/QuestionMarkIcon'
import ServiceFeeModal from '@/src/components/modals/ServiceFeeModal'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { StickyCheckoutButton } from './review-order-items/StickyCheckoutButton'
import { useCartStore } from '@/src/store/useCartStore'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import { useSnackbarStore } from '@/src/store/useSnackbarStore'
import CustomCounterButton from '@/src/components/ui/CustomCounterButton'
import { CloseIcon } from '@/src/components/ui/icons/CloseIcon'
import useVoucher from '@/src/hooks/useVoucher'
import { SnackbarType } from '@/src/types/others'
import { formatPrice } from '@/src/utils/validation-utils/formatPrice'
import { CartActions } from './review-order-items/CartActions'
import areSimilarCoordinates from '@/src/utils/validation-utils/areSimilarCoordinates'
import LoadingScreen from '@/src/components/ui/loading-screen'
import { calculateDeliveryFee } from '@/src/utils/validation-utils/calculateDeliveryFee'
import {
	DEFAULT_IN_HOUSE_DELIVERY_FEE_AMOUNT_USD,
	DEFAULT_TIMEZONE
} from '@/src/utils/constants'
import useTotalPrice from '@/src/utils/validation-utils/calculateTotalPrice'
import FallbackImage from '@/src/components/ui/FallbackImage'
import { formatInTimeZone } from 'date-fns-tz'
import { SectionDivider } from '@/src/components/ui/SectionDivider'
import { EmptyBagIcon } from '@/src/components/ui/icons/EmptyBagIcon'
import { AddIcon } from '@/src/components/ui/icons/AddIcon'
import { WarningIcon } from '@/src/components/ui/icons/WarningIcon'
import { convertTo12Hour } from '@/src/utils/time-utils/convertTo12Hour'
import AlcoholConsentModal from '@/src/components/modals/AlcoholConsentModal'

export const ReviewOrderScreen: React.FC = () => {
	const { hotelId, merchantId } = useLocalSearchParams<{
		hotelId: string
		merchantId: string
	}>()
	const [showPromoCodeInput, setShowPromoCodeInput] = useState(false)
	const [isAlcoholConsentModalVisible, setAlcoholConsentModalVisible] =
		useState(false)
	const {
		merchantDetails,
		currentHotelDetails,
		selectedMerchantCoordinates,
		showLoadingScreen,
		setCurrentHotelId,
		setSchedulerModalVisible,
		setRefetchMenuItems
	} = useGlobalStore()
	const { setSnackbarMessage } = useSnackbarStore()
	const {
		order,
		setTipByUser,
		removeOrderItem,
		changeOrderItemQuantity,
		setVoucher,
		deliveryFee,
		setOrderCutleries,
		tipByUser,
		setVoucherCode,
		resetOrderItems,
		setHasAlcohol
	} = useCartStore()

	useEffect(() => {
		setCurrentHotelId(hotelId)
	}, [])

	const [isServiceFeeModalVisible, setServiceFeeModalVisible] = useState(false)
	const isCartEmpty = order.items.length === 0

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

	const checkForAlcoholItems = () => {
		return order.items.some(item => {
			return item.tags?.some(
				(tag: string) =>
					typeof tag === 'string' && tag.toLowerCase().includes('alcohol')
			)
		})
	}

	const handleRemovePromoCode = () => {
		setVoucher(null)
		setVoucherCode('')
	}

	const selectedMerchantDetails = merchantDetails.find(merchant => {
		return merchant.id === +merchantId
	})

	const orderItemsNotAvailable = order.items.find(
		item => item.itemExists === false
	)

	const cartData = {
		restaurantName: selectedMerchantDetails?.name || '',
		estimatedDelivery: selectedMerchantDetails?.eta
			? `${selectedMerchantDetails.eta} min`
			: '',
		logoUrl: selectedMerchantDetails?.image_url || ''
	}

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

	const handleIncrement = (cartItemId: string) => {
		const item = order.items.find(item => item.cartItemId === cartItemId)
		if (item) {
			changeOrderItemQuantity(cartItemId, item.quantity + 1)
		}
	}

	const handleDecrement = (cartItemId: string) => {
		const item = order.items.find(item => item.cartItemId === cartItemId)
		if (item) {
			if (item.quantity === 1) {
				if (order.items.length === 1) {
					resetOrderItems()
					setTipByUser(0)
				} else {
					removeOrderItem(cartItemId)
				}
			} else {
				changeOrderItemQuantity(cartItemId, item.quantity - 1)
			}
		}
	}
	const handleCheckout = () => {
		const hasAlcohol = checkForAlcoholItems()
		setHasAlcohol(hasAlcohol)

		if (hasAlcohol) {
			setAlcoholConsentModalVisible(true)
		} else {
			router.push(`/${hotelId}/order-food/${merchantId}/checkout`)
		}
	}

	const handleAgreeAndContinue = () => {
		setAlcoholConsentModalVisible(false)
		router.push(`/${hotelId}/order-food/${merchantId}/checkout`)
	}

	if (showLoadingScreen) {
		return <LoadingScreen visible={showLoadingScreen} />
	}

	return (
		<View className='flex-1 bg-gray-300'>
			<View className='sticky top-0 left-0 right-0 z-10'>
				<View className='bg-white px-[20] flex-row items-center justify-center shadow-sm'>
					<Pressable onPress={() => router.back()}>
						<Ionicons
							name='arrow-back-circle'
							size={30}
							className='text-blue-500'
						/>
					</Pressable>
					<View className='flex-1 py-[12]'>
						<Text variant='h5' className='text-blue-700 text-center'>
							{`My Order`}
						</Text>
					</View>
				</View>
			</View>
			{order.scheduledDate === 'ASAP' ? null : (
				<View className=' bg-blue-600 py-[10]'>
					<View className='flex-row items-center justify-center '>
						<Text className='text-white text-center' variant='p2Medium'>
							{`${formatInTimeZone(new Date(order.scheduledDate), currentHotelDetails?.timezone || DEFAULT_TIMEZONE, "MMMM do, yyyy 'at' h:mm a")}`}
						</Text>
						<Pressable
							onPress={() => {
								setSchedulerModalVisible(true)
								setRefetchMenuItems(true)
							}}
						>
							<Text
								className='text-white border-b border-white ml-[24]'
								variant='p2Medium'
							>
								{`edit`}
							</Text>
						</Pressable>
					</View>
				</View>
			)}
			<View className='p-[20] flex-1'>
				<View className='flex-row items-center mb-[16]'>
					<View className='w-[60] h-[60] mr-[14]'>
						{cartData.logoUrl ? (
							<Image
								source={{ uri: cartData.logoUrl }}
								className='w-full h-full rounded-lg'
								resizeMode='cover'
							/>
						) : (
							<FallbackImage
								containerStyle={{ width: 60, height: 60, borderRadius: 8 }}
								logoSize={60}
								showText={false}
							/>
						)}
					</View>
					<View className='flex-1'>
						<Text
							variant='h1'
							className='text-blue-700 pb-[8] max-w-full'
							numberOfLines={2}
						>
							{cartData.restaurantName}
						</Text>
						<Text variant='p2Roman' className='text-gray-700'>
							{`Delivery estimate:`} {cartData.estimatedDelivery}
						</Text>
					</View>
				</View>
				<SectionDivider color='gray-250' />
				{isCartEmpty ? (
					<View className='mt-[12]'>
						<View className='flex-row items-center justify-center bg-white p-4 rounded-lg'>
							<EmptyBagIcon width='20' height='20' color='#5B687D' />
							<Text variant='p2Heavy' className='text-gray-800 ml-2'>
								{`Your bag is empty`}
							</Text>
						</View>
						<View className='border-b border-gray-250 my-[16]' />
						<Pressable
							onPress={() => router.back()}
							className='flex-row items-center justify-center mb-[16]'
						>
							<AddIcon width='20' height='20' color='#2454A4' />
							<Text variant='p2Heavy' className='text-blue-500 ml-2'>
								{`Add more items`}
							</Text>
						</Pressable>

						<SectionDivider color='white' />

						<View className='flex-row justify-between py-[16]'>
							<Text variant='p2Heavy' className='text-blue-700'>
								{`Subtotal`}
							</Text>
							<Text variant='p2Heavy' className='text-blue-700'>
								{formatPrice(undiscountedSubTotalPrice)}
							</Text>
						</View>

						<SectionDivider color='white' />
						<View className='my-[16]'>
							<View className='flex-row justify-between mb-3'>
								<View className='flex-row items-center'>
									<Text variant='p2Medium' className='text-blue-700 mr-1'>
										{`Service Fee`}
									</Text>
									<Pressable onPress={() => setServiceFeeModalVisible(true)}>
										<QuestionMarkIcon width='16' height='16' color='#052151' />
									</Pressable>
								</View>
								<Text variant='p2Medium' className='text-blue-700'>
									{formatPrice(serviceFee)}
								</Text>
							</View>
							<View className='flex-row justify-between'>
								<Text variant='p2Medium' className='text-blue-700'>
									{`Tax`}
								</Text>
								<Text variant='p2Medium' className='text-blue-700'>
									{formatPrice(taxAmount)}
								</Text>
							</View>
						</View>
						<SectionDivider color='white' />
						<View className='flex-row justify-between my-[16]'>
							<Text variant='h4' className='text-blue-700'>
								{`Total`}
							</Text>
							<Text variant='h4' className='text-blue-700'>
								{formatPrice(totalPrice)}
							</Text>
						</View>
					</View>
				) : (
					<View>
						{orderItemsNotAvailable ? (
							<View className='flex-row items-center justify-center bg-utility-red50 gap-[8] py-[12]'>
								<WarningIcon width='20' height='20' color={'#BA082B'} />
								<Text variant='p2Medium' className='text-utility-red500'>
									{`These items are only available from ${convertTo12Hour(orderItemsNotAvailable.mealPeriodStartHour)} - ${convertTo12Hour(orderItemsNotAvailable.mealPeriodEndHour)}`}
								</Text>
							</View>
						) : null}
						{order.items.map(item => (
							<CartItem
								key={item.cartItemId}
								name={item.name}
								price={Number(item.price)}
								quantity={item.quantity}
								itemExists={item.itemExists}
								modifierOptions={
									item?.modifiers
										?.map((modifier: { options: any }) => modifier.options)
										.flat() || []
								}
								onIncrement={() => handleIncrement(item.cartItemId)}
								onDecrement={() => handleDecrement(item.cartItemId)}
							/>
						))}
						<View className='py-[16]'>
							<View className='flex-row justify-between items-center'>
								<Text variant='h5' className='text-blue-700'>
									{`Cutleries & Napkins`}
								</Text>
								<CustomCounterButton
									count={order.numberOfCutleries}
									handleIncrease={() => {
										setOrderCutleries(order.numberOfCutleries + 1)
									}}
									handleDecrease={() => {
										setOrderCutleries(order.numberOfCutleries - 1)
									}}
								/>
							</View>
						</View>
						<SectionDivider color='gray-250' />

						<View className='my-4'>
							<CommentSection />
						</View>
						<SectionDivider color='gray-250' />
						<CartActions />
						<SectionDivider color='gray-250' />
						<PromoCodeSection
							onApply={handleApplyPromoCode}
							appliedCode={order.voucher?.code}
							isLoading={isPending}
							setShowInput={setShowPromoCodeInput}
							showInput={showPromoCodeInput}
						/>
						<SectionDivider color='white' />

						<View>
							<View className='flex-row justify-between py-[16]'>
								<Text variant='p2Heavy' className='text-blue-700'>
									{`Subtotal`}
								</Text>
								<Text variant='p2Heavy' className='text-blue-700'>
									{formatPrice(undiscountedSubTotalPrice)}
								</Text>
							</View>
							<SectionDivider color='white' />
						</View>

						<View className='mt-6 mb-4'>
							<Text variant='p2Heavy' className='mb-4 text-blue-700'>
								{`Tip`}
							</Text>
							<TipSelector
								selectedTip={tipByUser}
								onSelectTip={value => setTipByUser(value)}
							/>
						</View>
						<SectionDivider color='white' />

						<View className='mt-6'>
							{order.voucher?.code && (
								<View className='flex-row justify-between items-center mb-[16]'>
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
							)}
							<View className='flex-row justify-between mb-3'>
								<View className='flex-row items-center'>
									<Text variant='p2Medium' className='text-blue-700 mr-1'>
										{`Service Fee`}
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
									{`Tax`}
								</Text>
								<Text variant='p2Medium' className='text-blue-700'>
									{formatPrice(taxAmount)}
								</Text>
							</View>

							<View className='h-[1px] bg-white my-4' />

							<View className='flex-row justify-between'>
								<Text variant='h4' className='text-blue-700'>
									{`Total`}
								</Text>
								<Text variant='h4' className='text-blue-700'>
									{formatPrice(totalPrice)}
								</Text>
							</View>
						</View>
					</View>
				)}
			</View>
			<AlcoholConsentModal
				visible={isAlcoholConsentModalVisible}
				onClose={() => setAlcoholConsentModalVisible(false)}
				onAgree={handleAgreeAndContinue}
			/>
			<StickyCheckoutButton
				disabled={isCartEmpty || orderItemsNotAvailable}
				onPress={handleCheckout}
			/>
			<ServiceFeeModal
				visible={isServiceFeeModalVisible}
				onClose={() => setServiceFeeModalVisible(false)}
			/>
		</View>
	)
}

export default ReviewOrderScreen
