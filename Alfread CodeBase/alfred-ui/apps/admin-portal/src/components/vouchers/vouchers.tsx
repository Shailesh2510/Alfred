import { useMemo, useState } from "react"
import { NoData, PageStructure } from "@/shared-components"
import { IconDotsVertical, IconEdit, IconPlus } from "@tabler/icons-react"
import { Flex, Loader, Menu, Pagination, ActionIcon } from "@mantine/core"
import { useDebouncedState } from "@mantine/hooks"
import {
	StyledSearch,
	StyledButton,
	StyledTable,
	StyledDivider,
	StyledSelect,
	StyledCheckbox
} from "@/design-components"
import { map, orderBy, toInteger, toNumber } from "lodash"
import useVoucherPrograms from "@/hooks/voucher/useVoucherPrograms"
import { useInputState } from "@mantine/hooks"
import { createDateFromString, formatDate, showPrice } from "@/shared-utils"
import AddEditVoucherProgramModal from "./components/add-edit-voucher-program-modal"
import {
	DISCOUNT_VOUCHER_TYPE,
	ICON_SIZE,
	VOUCHER_TYPES
} from "@/shared-constants"
import { StyledTableRow } from "./vouchers.style"
import useHotels from "@/hooks/hotel/useHotels"

const Vouchers = () => {
	const [hotelFilter, setHotelFilter] = useInputState<any>(null)
	const [voucherProgramId, setVoucherProgramId] = useInputState<any>(null)
	const [voucherProgramPage, setVoucherProgramPage] = useState<number>(1)
	const [voucherProgramFilter, setVoucherProgramFilter] = useDebouncedState(
		null,
		500
	)
	const [voucherProgramStatusFilter, setVoucherProgramStatusFilter] =
		useInputState(false)
	const [voucherProgramTypeFilter, setVoucherProgramTypeFilter] =
		useInputState<any>(null)
	const [addEditVoucherProgramModalOpen, setAddEditVoucherProgramModalOpen] =
		useInputState<boolean>(false)

	const { data: hotels } = useHotels()
	const {
		data: voucherPrograms,
		isLoading: voucherProgramsLoading,
		refetch: refetchVoucherPrograms
	} = useVoucherPrograms({
		hotelId: hotelFilter,
		page: voucherProgramPage,
		name: voucherProgramFilter,
		type: voucherProgramTypeFilter,
		isActive: voucherProgramStatusFilter ? voucherProgramStatusFilter : null
	})

	const voucherList = voucherPrograms?.data

	const tableRows = voucherList?.map((voucher: any) => (
		<StyledTableRow key={voucher.id}>
			<td>{voucher.name}</td>
			<td>{VOUCHER_TYPES[voucher.type].label}</td>
			<td>{voucher.hotelName}</td>
			<td>{voucher.payer}</td>
			<td>{toNumber(voucher.payerPercentage).toFixed(2)}%</td>
			<td>
				{voucher?.type === VOUCHER_TYPES.DISCOUNT.value &&
				voucher?.amountType === DISCOUNT_VOUCHER_TYPE.PERCENTAGE.value
					? `${parseFloat(voucher.totalAmount)?.toFixed(2)}%`
					: showPrice(voucher.totalAmount)}
			</td>
			<td>{voucher.description}</td>
			<td>{formatDate(createDateFromString(voucher.createdAt))}</td>
			<td>{voucher.isActive ? "True" : "False"}</td>
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
								ml={24}
								variant='outline'
								color='dark'
								fullWidth
								leftIcon={<IconEdit size={ICON_SIZE} color='black' />}
								onClick={(event: any) => {
									event.stopPropagation()
									setVoucherProgramId(voucher?.id)
									setAddEditVoucherProgramModalOpen(true)
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

	const totalVoucherProgramPages = useMemo(() => {
		if (
			voucherPrograms?.total &&
			voucherPrograms?.limit &&
			voucherPrograms?.total === voucherPrograms?.limit
		) {
			return toInteger(
				toNumber(voucherPrograms?.total) / toNumber(voucherPrograms?.limit)
			)
		}
		if (voucherPrograms?.total && voucherPrograms?.limit) {
			return toInteger(
				toNumber(voucherPrograms?.total) / toNumber(voucherPrograms?.limit) + 1
			)
		}
		return 0
	}, [voucherPrograms])

	const voucherTypeOptions = orderBy(Object.values(VOUCHER_TYPES), "label")
	const hotelOptions = useMemo(
		() =>
			hotels?.data
				? orderBy(
						map(hotels?.data, hotel => ({
							value: hotel?.id,
							label: hotel?.name
						})),
						"label"
				  )
				: [],
		[hotels]
	)

	return (
		<PageStructure
			title='Vouchers'
			headerContent={
				<Flex gap={16} mr={8} align='center'>
					<StyledSelect
						placeholder='Hotel'
						searchable
						clearable
						data={hotelOptions}
						value={hotelFilter}
						onChange={setHotelFilter}
					/>
					<StyledSelect
						placeholder='Voucher type'
						searchable
						clearable
						data={voucherTypeOptions}
						value={voucherProgramTypeFilter}
						onChange={setVoucherProgramTypeFilter}
					/>
					<StyledSearch
						defaultValue={voucherProgramFilter}
						onChange={(event: any) => {
							setVoucherProgramFilter(event.currentTarget.value)
						}}
						placeholder='Search voucher program'
					/>
					<StyledCheckbox
						label='Active'
						checked={voucherProgramStatusFilter}
						onChange={setVoucherProgramStatusFilter}
					/>
					<StyledDivider
						orientation='vertical'
						h={24}
						color='gray.5'
						m='auto'
					/>
					<StyledButton
						color='dark'
						variant='outline'
						leftIcon={<IconPlus size={22} color='black' />}
						onClick={() => setAddEditVoucherProgramModalOpen(true)}
					>
						Add Program
					</StyledButton>
				</Flex>
			}
			pageContent={
				<>
					{voucherProgramsLoading ? (
						<Flex mih={500} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>
							{voucherList?.length === 0 ? (
								<NoData message='No voucher program found' minHeight={600} />
							) : (
								<StyledTable highlightOnHover>
									<thead>
										<tr>
											<th>
												<b>Name</b>
											</th>
											<th>Type</th>
											<th>Hotel</th>
											<th>Payer</th>
											<th>Payer percentage</th>
											<th>Total amount</th>
											<th>Description</th>
											<th>Created on</th>
											<th>Active</th>
											<th></th>
										</tr>
									</thead>
									<tbody>{tableRows}</tbody>
								</StyledTable>
							)}
						</>
					)}
					<AddEditVoucherProgramModal
						voucherProgramId={voucherProgramId}
						setVoucherProgramId={setVoucherProgramId}
						refetchVoucherPrograms={refetchVoucherPrograms}
						addVoucherProgramModalOpen={addEditVoucherProgramModalOpen}
						setAddVoucherProgramModalOpen={setAddEditVoucherProgramModalOpen}
					/>
				</>
			}
			footerContent={
				<Flex justify='center' my={40} align='center'>
					{voucherList?.length !== 0 && (
						<Pagination
							withEdges
							value={voucherProgramPage}
							total={totalVoucherProgramPages}
							onChange={value => setVoucherProgramPage(value)}
						/>
					)}
				</Flex>
			}
		/>
	)
}

export default Vouchers
