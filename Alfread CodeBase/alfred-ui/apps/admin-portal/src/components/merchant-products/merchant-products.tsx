import { ConfirmDeleteModal, NoData, PageStructure } from "@/shared-components"
import {
	IconDotsVertical,
	IconEdit,
	IconPlus,
	IconTrash
} from "@tabler/icons-react"
import { ActionIcon, Divider, Flex, Loader, Menu } from "@mantine/core"
import { StyledButton, StyledSearch, StyledTable } from "@/design-components"
import { useInputState } from "@mantine/hooks"
import Link from "next/link"
import useMerchantProducts from "@/hooks/merchant-product/useMerchantProducts"
import { filter } from "lodash"
import MerchantDetailsMenu from "../shared/merchant-details-menu"
import useMerchant from "@/hooks/merchant/useMerchant"
import { useRouter } from "next/router"
import { useState } from "react"
import { customNotification, showPrice } from "@/shared-utils"
import useDeleteMerchantProduct from "@/hooks/merchant-product/useDeleteMerchantProduct"
import {
	ProductName,
	ProductDetailContainer,
	ProductImage,
	ProductPrice
} from "./merchant-products.style"
import { ICON_SIZE } from "@/shared-constants"

const Products = () => {
	const router = useRouter()
	const merchantId = router.query.id

	const [productFilter, setProductFilter] = useInputState<any>("")
	const [productToDelete, setProductToDelete] = useState<any>(null)
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)

	const {
		data: merchantProducts,
		isLoading: merchantProductsLoading,
		refetch: refetchMerchantProductsProducts
	} = useMerchantProducts({ merchantId }, { enabled: !!merchantId })

	const { data: merchant, isLoading: merchantLoading } = useMerchant(
		{ merchantId },
		{
			enabled: !!merchantId
		}
	)

	const { mutate: deleteMerchantProduct } = useDeleteMerchantProduct({
		onSuccess: () => {
			customNotification.success({
				title: "Product deletion",
				message: "Product deleted successfully"
			})
			refetchMerchantProductsProducts?.()
		},
		onError: () => {
			customNotification.error({
				title: "Product deletion",
				message: "Product deletion failed"
			})
		},
		onSettled: () => {
			setProductToDelete(null)
		}
	})

	let productsToShow = merchantProducts?.data || []
	if (productFilter) {
		productsToShow = filter(merchantProducts?.data || [], product =>
			product.name.toLowerCase().includes(productFilter.toLowerCase())
		)
	}

	const currentMerchant = merchant?.data?.[0]

	return (
		<PageStructure
			goBack
			title={
				currentMerchant?.name ? `${currentMerchant?.name} - Products` : null
			}
			subHeaderContent={<MerchantDetailsMenu merchantId={merchantId} />}
			headerContent={
				<Flex gap={16} mr={8} align='center'>
					<StyledSearch
						value={productFilter}
						onChange={setProductFilter}
						placeholder='Search for product'
					/>
					<Divider orientation='vertical' h={24} color='gray.5' m='auto' />
					<Link href={`/merchants/${merchantId}/products/add`}>
						<StyledButton
							color='dark'
							variant='outline'
							leftIcon={<IconPlus size={22} color='black' />}
						>
							Add Product
						</StyledButton>
					</Link>
				</Flex>
			}
			pageContent={
				<>
					{merchantLoading || merchantProductsLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>
							{productsToShow.length === 0 ? (
								<NoData message='No products found' minHeight={600} />
							) : (
								<StyledTable highlightOnHover>
									<thead>
										<tr>
											<th>ID</th>
											<th>Name</th>
											<th>Price</th>
											<th>Description</th>
											<th>Stock status</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{productsToShow.map((product: any) => (
											<tr key={product.id}>
												<td>#{product?.id}</td>
												<td>
													<ProductDetailContainer>
														<ProductImage
															fit='cover'
															radius={4}
															width={40}
															height={40}
															src={product?.imageUrl || "/food.jpg"}
														/>
														<ProductName>{product?.name}</ProductName>
													</ProductDetailContainer>
												</td>
												<td>
													<ProductPrice>
														{showPrice(product?.price)}
													</ProductPrice>
												</td>
												<td>{product?.description}</td>
												<td>
													{product?.outOfStockId ? "Out of stock" : "In Stock"}
												</td>
												<td>
													<Menu
														width={200}
														shadow='xl'
														withArrow
														trigger='hover'
													>
														<Menu.Target>
															<ActionIcon>
																<IconDotsVertical size={22} />
															</ActionIcon>
														</Menu.Target>
														<Menu.Dropdown>
															<Flex
																direction='column'
																align='center'
																justify='center'
																gap={16}
																p={16}
															>
																<StyledButton
																	fullWidth
																	color='dark'
																	variant='outline'
																	leftIcon={
																		<IconEdit size={ICON_SIZE} color='black' />
																	}
																	onClick={() =>
																		router.push(
																			`/merchants/${merchantId}/products/edit/${product?.id}`
																		)
																	}
																>
																	Edit
																</StyledButton>
																<StyledButton
																	fullWidth
																	color='dark'
																	variant='outline'
																	leftIcon={
																		<IconTrash size={ICON_SIZE} color='black' />
																	}
																	onClick={() => {
																		setShowDeleteModal(true)
																		setProductToDelete(product)
																	}}
																>
																	Delete
																</StyledButton>
															</Flex>
														</Menu.Dropdown>
													</Menu>
												</td>
											</tr>
										))}
									</tbody>
								</StyledTable>
							)}
							<ConfirmDeleteModal
								title='Delete menu category'
								message={
									<>
										Are you sure you want to remove the product `
										<b>{productToDelete?.name}</b>` from the menu?
									</>
								}
								modalOpen={showDeleteModal}
								setModalOpen={setShowDeleteModal}
								onClose={() => setProductToDelete(null)}
								onDelete={() => {
									if (productToDelete.id && merchantId) {
										deleteMerchantProduct({
											productId: productToDelete.id,
											merchantId
										})
										setShowDeleteModal(false)
										refetchMerchantProductsProducts()
									}
								}}
							/>
						</>
					)}
				</>
			}
		/>
	)
}

export default Products
