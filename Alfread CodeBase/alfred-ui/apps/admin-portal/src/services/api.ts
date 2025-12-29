import { Auth } from "aws-amplify"
import axios, { AxiosError } from "axios"

export const axiosRequestInterceptor = async (config: any) => {
	const session = await Auth.currentSession()
	const token = session.getAccessToken().getJwtToken()
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
}

const axiosInstance = axios.create()
axiosInstance.interceptors.request.use(axiosRequestInterceptor, e =>
	Promise.reject(e)
)

axiosInstance.interceptors.response.use(
	response => {
		return response
	},
	async (error: AxiosError) => {
		if (error.response?.status === 403) {
			try {
				await Auth.signOut()
				window.location.reload()
			} catch (signOutError) {
				console.error("Error signing out:", signOutError)
			}
		}

		return Promise.reject(error)
	}
)

// --- Merchant ---

const getMerchants = async (params: { hotelId?: string }) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/merchant`,
		{
			params: {
				hotelId: params.hotelId
			}
		}
	)
	return data
}

const getMerchant = async ({ merchantId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/merchant/${merchantId}`
	)
	return data
}

const addMerchant = async (merchantData: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/merchant`,
		merchantData
	)
	return data
}

const editMerchant = async ({ merchantId, ...merchantData }: any) => {
	const { data } = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/merchant/${merchantId}`,
		merchantData
	)
	return data
}

const updateMerchantStatus = async ({ merchantId, isActive }: any) => {
	const { data } = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/merchant/${merchantId}/active`,
		{
			isActive
		}
	)
	return data
}

const getAssignedHotels = async ({ merchantId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/merchant/${merchantId}/hotels`
	)
	return data
}
const assignHotelsToMerchantWithMealPeriods = async ({
	merchantId,
	hotelMealPeriodMappings
}: {
	merchantId: number
	hotelMealPeriodMappings: { hotelId: number; mealPeriodIds: number[] }[]
}) => {
	const { data } = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/merchant/${merchantId}/assign/hotels-with-meal-periods`,
		{
			hotelMealPeriodMappings
		}
	)
	return data
}

// --- Hotel ---

const getHotels = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/hotel`
	)
	return data
}
const getSimilarHotels = async ({ hotelId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/hotel/${hotelId}/similar-hotel-list`
	)
	return data
}

const getHotel = async ({ hotelId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/hotel/${hotelId}`
	)
	return data
}

const addHotel = async (hotelData: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/hotel`,
		hotelData
	)
	return data
}

const editHotel = async ({ hotelId, ...hotelData }: any) => {
	const { data } = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/hotel/${hotelId}`,
		hotelData
	)
	return data
}

const assignMerchantToHotel = async ({
	hotelId,
	merchantId,
	mealPeriodIds
}: any) => {
	const { data } = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/hotel/${hotelId}/assign/merchant/${merchantId}`,
		{
			mealPeriodIds: mealPeriodIds?.map(String)
		}
	)
	return data
}

const orderMerchantsToHotel = async ({ hotelId, merchants }: any) => {
	const { data } = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/hotel/${hotelId}/order/merchants`,
		merchants
	)
	return data
}

const unassignMerchantMealPeriods = async ({
	hotelId,
	merchantId,
	mealPeriodIds
}: any) => {
	const { data } = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/hotel/${hotelId}/unassign/merchant/${merchantId}`,
		{
			mealPeriodIds: mealPeriodIds?.map(String)
		}
	)
	return data
}

// --- Product ---

const getMerchantProducts = async ({ merchantId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/item/merchant/${merchantId}`
	)
	return data
}

const getMerchantProduct = async ({ productId, merchantId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/item/${productId}/merchant/${merchantId}`
	)
	return data
}

const addMerchantProduct = async ({ merchantId, productData }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/item/merchant/${merchantId}`,
		productData
	)
	return data
}

const editMerchantProduct = async ({
	productId,
	merchantId,
	productData
}: any) => {
	const { data } = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/item/${productId}/merchant/${merchantId}`,
		productData
	)
	return data
}

const deleteMerchantProduct = async ({ productId, merchantId }: any) => {
	const { data } = await axiosInstance.delete(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/item/${productId}/merchant/${merchantId}`
	)
	return data
}

const getCategorizedMerchantProducts = async ({ merchantId, menuId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/item/list/categorized/merchant/${merchantId}/menu/${menuId}`
	)
	return data
}

const getMerchantPresignedUrl = async ({ merchantId }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/item/s3/presign/merchant/${merchantId}`,
		{
			contentType: "image/png"
		}
	)
	return data
}

const getMerchantImagePresignedUrl = async (merchantId: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/merchant/s3/presign/merchant/image/${merchantId}`,
		{
			contentType: "image/png"
		}
	)
	return data
}

const getMerchantCoverImagePresignedUrl = async (merchantId: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/merchant/s3/presign/merchant/cover/image/${merchantId}`,
		{
			contentType: "image/png"
		}
	)
	return data
}

const uploadMerchantProductImage = async (url: string, file: any) => {
	const { data } = await axios.create().put(url, file, {
		headers: { "Content-Type": file.type }
	})
	return data
}

// --- Modifier ---

const getMerchantModifiers = async ({ merchantId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/modifier/merchant/${merchantId}`
	)
	return data
}

const getMerchantModifier = async ({ modifierId, merchantId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/modifier/${modifierId}/merchant/${merchantId}`
	)
	return data
}

const addMerchantModifier = async ({ merchantId, modifierData }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/modifier/merchant/${merchantId}`,
		modifierData
	)
	return data
}

const editMerchantModifier = async ({
	modifierId,
	merchantId,
	modifierData
}: any) => {
	const { data } = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/modifier/${modifierId}/merchant/${merchantId}`,
		modifierData
	)
	return data
}

const deleteMerchantModifier = async ({ modifierId, merchantId }: any) => {
	const { data } = await axiosInstance.delete(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/modifier/${modifierId}/merchant/${merchantId}`
	)
	return data
}

// --- Meal Period ---

const getMealPeriods = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/meal_period`
	)
	return data
}

const getHotelMealPeriods = async ({ hotelId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/meal_period/hotel/${hotelId}`
	)
	return data
}

const getMerchantMealPeriods = async ({ merchantId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/meal_period/merchant/${merchantId}`
	)
	return data
}

const getMerchantMealPeriod = async ({ mealPeriodId, merchantId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/meal_period/${mealPeriodId}/merchant/${merchantId}`
	)
	return data
}

const addMerchantMealPeriod = async ({ merchantId, mealPeriodData }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/meal_period/merchant/${merchantId}`,
		{ ...mealPeriodData }
	)
	return data
}

const editMerchantMealPeriod = async ({
	merchantId,
	mealPeriodId,
	mealPeriodData
}: any) => {
	const { data } = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/meal_period/${mealPeriodId}/merchant/${merchantId}`,
		mealPeriodData
	)
	return data
}

const deleteMerchantMealPeriod = async ({ merchantId, mealPeriodId }: any) => {
	const { data } = await axiosInstance.delete(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/meal_period/${mealPeriodId}/merchant/${merchantId}`
	)
	return data
}

// --- User ---

const getUsers = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/user`
	)
	return data
}

const getUser = async ({ userId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/user/${userId}`
	)
	return data
}

const addUser = async ({ userData }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/user`,
		userData
	)
	return data
}

const editUser = async ({ userId, userData }: any) => {
	const { data } = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/user/${userId}`,
		userData
	)
	return data
}

const deleteUser = async ({ userId }: any) => {
	const { data } = await axiosInstance.delete(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/user/${userId}`
	)
	return data
}

// --- Role ---

const getRoles = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/role`
	)
	return data
}

// --- City ---

const getCities = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/city`
	)
	return data
}

// -- Order --

const getKdsOrders = async ({ page, status, hotelId, merchantId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/order/details`,
		{
			params: {
				page,
				status,
				hotelId,
				merchantId
			}
		}
	)
	return data
}

const getOrders = async ({
	page,
	status,
	nonce,
	clientName,
	clientEmail,
	clientNumber,
	hotelId,
	roomNumber,
	merchantId,
	voucherCode,
	mealPeriodId,
	orderType,
	toDate,
	fromDate
}: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/order`,
		{
			params: {
				page,
				status,
				nonce,
				clientName,
				clientEmail,
				clientNumber,
				hotelId,
				roomNumber,
				merchantId,
				voucherCode,
				mealPeriodId,
				orderType,
				toDate,
				fromDate
			}
		}
	)
	return data
}

const getOrder = async ({ orderId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/order/${orderId}`
	)
	return data
}
const getCurrentOrders = async () => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/order/list/today`
	)
	return data
}

const deleteOrder = async ({ orderId }: any) => {
	const { data } = await axiosInstance.delete(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/order/${orderId}`
	)
	return data
}

const changeStatusToCanceled = async ({
	orderId,
	hotelId,
	version,
	cancelReason,
	cancelOption
}: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/order/${orderId}/cancel/hotel/${hotelId}`,
		{
			version,
			reason: cancelReason,
			option: cancelOption
		}
	)
	return data
}

const changeStatusToInDelivery = async ({ orderId, version, hotelId }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/order/${orderId}/in_delivery/hotel/${hotelId}`,
		{
			version
		}
	)
	return data
}

const changeStatusToDeliverd = async ({ orderId, version, hotelId }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/order/${orderId}/delivered/hotel/${hotelId}`,
		{
			version
		}
	)
	return data
}

const changeStatusToPending = async ({ orderId, version, hotelId }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/order/${orderId}/pending/hotel/${hotelId}`,
		{
			version
		}
	)
	return data
}
const changeStatusToConfirmed = async ({ orderId, version, hotelId }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/order/${orderId}/confirm/hotel/${hotelId}`,
		{
			version
		}
	)
	return data
}

const changeStatusToInPreparation = async ({
	orderId,
	version,
	hotelId
}: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/order/${orderId}/preparation/hotel/${hotelId}`,
		{
			version
		}
	)
	return data
}

const exportOrdersReport = async ({
	page,
	fromDate,
	toDate,
	status,
	merchantId,
	hotelId,
	orderType,
	mealPeriodId,
	clientName,
	clientNumber,
	clientEmail,
	voucherCode
}: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/order/reports/export`,
		{
			params: {
				page,
				fromDate,
				toDate,
				status,
				merchantId,
				hotelId,
				orderType,
				mealPeriodId,
				clientName,
				clientNumber,
				clientEmail,
				voucherCode
			},
			responseType: "arraybuffer",
			headers: {
				"Content-Disposition": "attachment; filename=template.xlsx",
				"Content-Type":
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			}
		}
	)
	return data
}

// --- Voucher Program ---

const getVoucherPrograms = async ({
	page,
	name,
	type,
	hotelId,
	isActive
}: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/voucher/program`,
		{
			params: {
				page,
				name,
				type,
				hotelId,
				isActive
			}
		}
	)
	return data
}

const getVoucherProgram = async ({ voucherProgramId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/voucher/program/${voucherProgramId}`
	)
	return data
}

const addVoucherProgram = async ({ voucherProgramData }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/voucher/program`,
		voucherProgramData
	)
	return data
}

const editVoucherProgram = async ({
	voucherProgramId,
	voucherProgramData
}: any) => {
	const { data } = await axiosInstance.put(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/voucher/program/${voucherProgramId}`,
		voucherProgramData
	)
	return data
}

// --- Menu ---

const publishHotelMenu = async ({ menuId, hotelId }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/menu/${menuId}/publish/hotel/${hotelId}`
	)
	return data
}
const replicateMenusToHotels = async (
	sourceHotelId: number,
	targetHotelIds: number[],
	merchantIds: number[]
) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/menu/${sourceHotelId}/propagate`,
		{
			targetHotelIds,
			merchantIds
		}
	)
	return data
}

// -- Menu Category ---

const getMenuCategories = async ({ menuId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/menu_category/menu/${menuId}`
	)
	return data
}

const getHotelMenuCategories = async ({ hotelId }: any) => {
	const { data } = await axiosInstance.get(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/menu_category/hotel/${hotelId}`
	)
	return data
}

const addMenuCategory = async ({
	hotelId,
	mealPeriodId,
	menuId,
	name
}: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/menu_category/hotel/${hotelId}`,
		{
			name,
			mealPeriodId,
			menuId
		}
	)
	return data
}

const renameMenuCategory = async ({ name, menuCategoryId, hotelId }: any) => {
	const { data } = await axiosInstance.put(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/menu_category/${menuCategoryId}/hotel/${hotelId}`,
		{
			name
		}
	)
	return data
}

const deleteMenuCategory = async ({ menuCategoryId }: any) => {
	const { data } = await axiosInstance.delete(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/menu_category/${menuCategoryId}`
	)
	return data
}

const reOrderMenuCategories = async ({ categories }: any) => {
	const data = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/menu_category/reorder`,
		categories
	)
	return data
}

// -- Menu Item ---

const updateMenuItem = async ({ menuItemId, hotelId, newPrice }: any) => {
	const { data } = await axiosInstance.put(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/menu_item/${menuItemId}/hotel/${hotelId}`,
		{
			newPrice
		}
	)
	return data
}

const deleteMenuItem = async ({ menuItemId, hotelId }: any) => {
	const { data } = await axiosInstance.delete(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/menu_item/${menuItemId}/hotel/${hotelId}`
	)
	return data
}

const updateMenuItemOrder = async ({ hotelId }: any) => {
	const { data } = await axiosInstance.put(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/menu_item/order_position/batch/hotel/${hotelId}`
	)
	return data
}

const updateMenuItemPosition = async ({
	menuItemId,
	menuCategoryId,
	hotelId,
	orderPosition
}: any) => {
	const { data } = await axiosInstance.put(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/menu_item/order_position/batch/hotel/${hotelId}`,
		{ orderPosition, menuItemId, menuCategoryId }
	)
	return data
}

const assignItemsToCategory = async ({
	hotelId,
	itemIds,
	menuId,
	menuCategoryId
}: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/menu_item/batch/hotel/${hotelId}`,
		{
			itemIds,
			menuId,
			menuCategoryId
		}
	)
	return data
}

const reOrderMenuItems = async ({ menuItems }: any) => {
	const data = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/menu_item/reorderItems`,
		menuItems
	)
	return data
}

// --- Payment ---

const paymentRefund = async ({ orderId, amount, reason, note }: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/refund/${orderId}`,
		{
			amount,
			reason,
			note
		}
	)
	return data
}

const voucherRefund = async ({ orderId, amount }: any) => {
	const { data } = await axiosInstance.put(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/order/refund-voucher`,
		null,
		{
			params: {
				order_id: orderId,
				refund_amount: amount
			}
		}
	)
	return data
}

// --- Stock ---

const updateProductStock = async ({
	merchantId,
	itemId,
	availableAfter,
	out
}: any) => {
	const { data } = await axiosInstance.post(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/out_of_stock/merchant/${merchantId}`,
		{
			itemId,
			availableAfter,
			out
		}
	)
	return data
}

// --- Password ---

const editPassword = async ({ userId, password, permanent }: any) => {
	const { data } = await axiosInstance.patch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/user/${userId}/credentials`,
		{
			password,
			permanent
		}
	)
	return data
}

const API = {
	// --- Merchant ---
	getMerchants,
	getMerchant,
	addMerchant,
	editMerchant,
	updateMerchantStatus,
	assignHotelsToMerchantWithMealPeriods,
	getAssignedHotels,
	getMerchantCoverImagePresignedUrl,

	// --- Hotel ---
	getHotels,
	getSimilarHotels,
	getHotel,
	addHotel,
	editHotel,
	assignMerchantToHotel,
	unassignMerchantMealPeriods,
	orderMerchantsToHotel,

	// --- Product ---

	getMerchantProducts,
	getMerchantProduct,
	addMerchantProduct,
	editMerchantProduct,
	deleteMerchantProduct,
	getCategorizedMerchantProducts,
	getMerchantPresignedUrl,
	getMerchantImagePresignedUrl,
	uploadMerchantProductImage,

	// --- Modifier ---

	getMerchantModifiers,
	getMerchantModifier,
	addMerchantModifier,
	editMerchantModifier,
	deleteMerchantModifier,

	// --- Meal Period ---

	getMealPeriods,
	getHotelMealPeriods,
	getMerchantMealPeriods,
	getMerchantMealPeriod,
	addMerchantMealPeriod,
	editMerchantMealPeriod,
	deleteMerchantMealPeriod,

	// --- User ---

	getUser,
	editUser,
	addUser,
	getUsers,
	deleteUser,

	// --- Role ---

	getRoles,

	// --- City ---

	getCities,

	// --- Order ---

	getOrders,
	getOrder,
	getKdsOrders,
	deleteOrder,
	getCurrentOrders,
	changeStatusToInDelivery,
	changeStatusToDeliverd,
	changeStatusToPending,
	changeStatusToConfirmed,
	changeStatusToInPreparation,
	changeStatusToCanceled,
	exportOrdersReport,

	// --- Menu ---

	publishHotelMenu,
	replicateMenusToHotels,

	// --- Menu Category ---

	getMenuCategories,
	getHotelMenuCategories,
	addMenuCategory,
	renameMenuCategory,
	deleteMenuCategory,
	reOrderMenuCategories,

	// --- Voucher ---
	getVoucherPrograms,
	getVoucherProgram,
	addVoucherProgram,
	editVoucherProgram,

	// --- Menu Item ---
	updateMenuItem,
	deleteMenuItem,
	updateMenuItemOrder,
	updateMenuItemPosition,
	assignItemsToCategory,
	reOrderMenuItems,

	// --- Payment ---
	voucherRefund,
	paymentRefund,

	// --- Stock ---
	updateProductStock,

	// --- Pssword ---
	editPassword
}

export default API
