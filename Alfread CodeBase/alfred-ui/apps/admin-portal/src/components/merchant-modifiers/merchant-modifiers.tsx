import { ConfirmDeleteModal, PageStructure } from "@/shared-components"
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
import useMerchantModifiers from "@/hooks/modifier/useMerchantModifiers"
import { filter } from "lodash"
import { useRouter } from "next/router"
import { useState } from "react"
import { customNotification } from "@/shared-utils"
import useDeleteMerchantModifier from "@/hooks/modifier/useDeleteMerchantModifier"
import { NoData } from "@/shared-components"
import { showPrice } from "@/shared-utils"
import MerchantDetailsMenu from "../shared/merchant-details-menu"
import useMerchant from "@/hooks/merchant/useMerchant"
import { ModifierOptionContainer } from "./merchant-modifiers.style"
import { ICON_SIZE } from "@/shared-constants"

const MerchantModifiers = () => {
	const router = useRouter()
	const merchantId = router.query.id

	const [modifierFilter, setModifierFilter] = useInputState<any>("")
	const [modifierToDelete, setModifierToDelete] = useState<any>(null)
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)

	const {
		data: merchantModifiers,
		refetch: refetchMerchantModifiers,
		isLoading: merchantModifiersLoading
	} = useMerchantModifiers({ merchantId }, { enabled: !!merchantId })

	const { data: merchant, isLoading: merchantLoading } = useMerchant(
		{ merchantId },
		{
			enabled: !!merchantId
		}
	)

	const currentMerchant = merchant?.data?.[0]

	const { mutate: deleteMerchantModifier } = useDeleteMerchantModifier({
		onSuccess: () => {
			customNotification.success({
				title: "Modifier deletion",
				message: "Modifier deleted successfully"
			})
			refetchMerchantModifiers()
		},
		onError: () => {
			customNotification.error({
				title: "Modifier deletion",
				message: "Modifier deletion failed"
			})
		},
		onSettled: () => {
			setModifierToDelete(null)
		}
	})

	let tableContent = merchantModifiers?.data || []
	if (modifierFilter) {
		tableContent = filter(merchantModifiers?.data || [], product =>
			product?.name.toLowerCase().includes(modifierFilter?.toLowerCase())
		)
	}

	return (
		<PageStructure
			goBack
			title={
				currentMerchant?.name ? `${currentMerchant?.name} - Modifiers` : null
			}
			subHeaderContent={<MerchantDetailsMenu merchantId={merchantId} />}
			headerContent={
				<Flex gap={16} mr={8} align='center'>
					<StyledSearch
						value={modifierFilter}
						onChange={setModifierFilter}
						placeholder='Search for modifiers'
					/>
					<Divider orientation='vertical' h={24} color='gray.5' m='auto' />
					<Link href={`/merchants/${merchantId}/modifiers/add`}>
						<StyledButton
							color='dark'
							variant='outline'
							leftIcon={<IconPlus size={22} color='black' />}
						>
							Add Modifier
						</StyledButton>
					</Link>
				</Flex>
			}
			pageContent={
				<>
					{merchantLoading || merchantModifiersLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>
							{tableContent.length === 0 ? (
								<NoData message='No modifiers found' minHeight={600} />
							) : (
								<StyledTable highlightOnHover>
									<thead>
										<tr>
											<th>ID</th>
											<th>Name</th>
											<th>Options</th>
											<th>Required</th>
											<th>Type</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{tableContent.map((modifier: any) => (
											<tr key={modifier.id}>
												<td>#{modifier.id}</td>
												<td>{modifier.name}</td>
												<td>
													{modifier?.options?.map((option: any) => (
														<ModifierOptionContainer key={option?.id}>
															<div>{option?.name}</div>
															<div>{showPrice(option?.price)}</div>
														</ModifierOptionContainer>
													))}
												</td>
												<td>
													{modifier?.requiredOptions ? "Required" : "Optional"}
												</td>
												<td>
													{modifier?.multipleOptions
														? "Multiple Select"
														: "Select one"}
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
																			`/merchants/${merchantId}/modifiers/edit/${modifier?.id}`
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
																		setModifierToDelete(modifier)
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
						</>
					)}
					<ConfirmDeleteModal
						title='Delete modifier'
						message={
							<>
								Are you sure you want to delete `<b>{modifierToDelete?.name}</b>
								`?
							</>
						}
						modalOpen={showDeleteModal}
						setModalOpen={setShowDeleteModal}
						onClose={() => setModifierToDelete(null)}
						onDelete={() => {
							if (modifierToDelete?.id && merchantId) {
								deleteMerchantModifier({
									modifierId: modifierToDelete?.id,
									merchantId
								})
							}
						}}
					/>
				</>
			}
		/>
	)
}

export default MerchantModifiers
