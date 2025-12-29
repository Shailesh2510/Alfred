import { PageStructure } from "@/shared-components"
import useMerchants from "@/hooks/merchant/useMerchants"
import { ActionIcon, Flex, Loader, Menu } from "@mantine/core"
import {
	StyledButton,
	StyledCheckbox,
	StyledDivider,
	StyledSearch,
	StyledTable
} from "@/design-components"
import { filter, map } from "lodash"
import { NoData } from "@/shared-components"
import { useInputState } from "@mantine/hooks"
import { IconPlus, IconDotsVertical, IconEdit } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { StyledTableRow } from "./merchants.style"
import { ICON_SIZE } from "@/shared-constants"

const Merchants = () => {
	const [merchantNameFilter, setMerchantNameFilter] = useInputState("")
	const [merchantEmailFilter, setMerchantEmailFilter] = useInputState("")
	const [merchantTownFilter, setMerchantTownFilter] = useInputState("")
	const [merchanStreetFilter, setMerchantStreetFilter] = useInputState("")
	const [merchantStatusFilter, setMerchantStatusFilter] = useInputState(true)

	const router = useRouter()

	const { data: merchants, isLoading: merchantsLoading } = useMerchants()

	let filteredMerchants = merchants?.data

	if (merchantNameFilter) {
		filteredMerchants = filter(filteredMerchants, merchant =>
			merchant?.name?.toLowerCase().includes(merchantNameFilter?.toLowerCase())
		)
	}
	if (merchantEmailFilter) {
		filteredMerchants = filter(filteredMerchants, merchant =>
			merchant?.contactEmail
				?.toLowerCase()
				.includes(merchantEmailFilter?.toLowerCase())
		)
	}
	if (merchantTownFilter) {
		filteredMerchants = filter(filteredMerchants, merchant =>
			merchant?.addressTown
				?.toLowerCase()
				.includes(merchantTownFilter?.toLowerCase())
		)
	}
	if (merchanStreetFilter) {
		filteredMerchants = filter(filteredMerchants, merchant =>
			merchant?.addressStreet
				?.toLowerCase()
				.includes(merchanStreetFilter?.toLowerCase())
		)
	}
	if (merchantStatusFilter === true) {
		filteredMerchants = filter(
			filteredMerchants,
			merchant => merchant?.isActive
		)
	}

	const rows = map(filteredMerchants, merchant => (
		<StyledTableRow
			key={merchant?.id}
			onClick={() => router.push(`/merchants/${merchant?.id}`)}
		>
			<td>{merchant.name}</td>
			<td>{merchant.contactEmail}</td>
			<td>{merchant.contactPhone}</td>
			<td>{`${merchant.addressNumber}, ${merchant.addressStreet}, ${merchant.addressTown}, ${merchant.addressZipCode}, ${merchant.cityName}`}</td>
			<td>{`${parseFloat(merchant?.taxRate)?.toFixed(3)}%`}</td>
			<td>{merchant.isActive ? "True" : "False"}</td>
			<td>{merchant?.hasThirdPartyDelivery ? "True" : "False"}</td>
			<td>
				<Menu width={200} shadow='xl' withArrow trigger='hover'>
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
								leftIcon={<IconEdit size={ICON_SIZE} color='black' />}
								onClick={(event: any) => {
									event.stopPropagation()
									router.push(`/merchants/edit/${merchant?.id}`)
								}}
							>
								Edit
							</StyledButton>
						</Flex>
					</Menu.Dropdown>
				</Menu>
			</td>
		</StyledTableRow>
	))

	return (
		<PageStructure
			title='Merchants'
			headerContent={
				<Flex gap={16} mr={8} align='center'>
					<StyledSearch
						value={merchantNameFilter}
						onChange={setMerchantNameFilter}
						placeholder='Search by name'
					/>
					<StyledSearch
						value={merchantEmailFilter}
						onChange={setMerchantEmailFilter}
						placeholder='Search by email'
					/>
					<StyledSearch
						value={merchantTownFilter}
						onChange={setMerchantTownFilter}
						placeholder='Search by town'
					/>
					<StyledSearch
						value={merchanStreetFilter}
						onChange={setMerchantStreetFilter}
						placeholder='Search by street'
					/>
					<StyledCheckbox
						label='Active'
						checked={merchantStatusFilter}
						onChange={setMerchantStatusFilter}
					/>
					<StyledDivider
						orientation='vertical'
						h={24}
						color='gray.5'
						m='auto'
					/>
					<Link href='/merchants/add'>
						<StyledButton
							color='dark'
							variant='outline'
							leftIcon={<IconPlus size={22} color='black' />}
						>
							Add Merchant
						</StyledButton>
					</Link>
				</Flex>
			}
			pageContent={
				<>
					{merchantsLoading ? (
						<Flex mih={500} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>
							{filteredMerchants?.length === 0 ? (
								<NoData message='No merchant found' minHeight={600} />
							) : (
								<StyledTable highlightOnHover>
									<thead>
										<tr>
											<th>Name</th>
											<th>Contact Email</th>
											<th>Contact Phone</th>
											<th>Address</th>
											<th>TAX rate</th>
											<th>Active</th>
											<th>Has third party delivery</th>
											<th></th>
										</tr>
									</thead>
									<tbody>{rows}</tbody>
								</StyledTable>
							)}
						</>
					)}
				</>
			}
		/>
	)
}

export default Merchants
