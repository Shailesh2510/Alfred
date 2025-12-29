import { PageStructure } from "@/shared-components"
import useHotels from "@/hooks/hotel/useHotels"
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
import { StyledTableRow } from "./hotels.style"
import { ICON_SIZE } from "@/shared-constants"

const Hotels = () => {
	const [hotelNameFilter, setHotelNameFilter] = useInputState("")
	const [hotelTownFilter, setHotelTownFilter] = useInputState("")
	const [contactEmailFilter, setContactEmailFilter] = useInputState("")
	const [hotelStreetFilter, setHotelStreetFilter] = useInputState("")
	const [hotelStatusFilter, setHotelStatusFilter] = useInputState(true)

	const router = useRouter()

	const { data: hotels, isLoading: hotelsLoading } = useHotels()

	let filteredHotels = hotels?.data

	if (hotelNameFilter) {
		filteredHotels = filter(filteredHotels, hotel =>
			hotel?.name?.toLowerCase().includes(hotelNameFilter?.toLowerCase())
		)
	}
	if (contactEmailFilter) {
		filteredHotels = filter(filteredHotels, hotel =>
			hotel?.contactEmail
				?.toLowerCase()
				.includes(contactEmailFilter?.toLowerCase())
		)
	}
	if (hotelTownFilter) {
		filteredHotels = filter(filteredHotels, hotel =>
			hotel?.addressTown?.toLowerCase().includes(hotelTownFilter?.toLowerCase())
		)
	}
	if (hotelStreetFilter) {
		filteredHotels = filter(filteredHotels, hotel =>
			hotel?.addressStreet
				?.toLowerCase()
				.includes(hotelStreetFilter?.toLowerCase())
		)
	}
	if (hotelStatusFilter === true) {
		filteredHotels = filter(filteredHotels, hotel => hotel?.isActive)
	}

	const rows = map(filteredHotels, hotel => (
		<StyledTableRow
			key={hotel.id}
			onClick={() => router.push(`/hotels/${hotel?.id}`)}
		>
			<td>{hotel.name}</td>
			<td>{hotel.contactName}</td>
			<td>{hotel.contactEmail}</td>
			<td>{hotel.contactPhone}</td>
			<td>{`${hotel.addressNumber}, ${hotel.addressStreet}, ${hotel.addressTown}, ${hotel.addressZipCode}, ${hotel.cityName}`}</td>
			<td>{hotel.isActive ? "True" : "False"}</td>
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
								variant='outline'
								color='dark'
								leftIcon={<IconEdit size={ICON_SIZE} color='black' />}
								onClick={(event: any) => {
									event.stopPropagation()
									router.push(`/hotels/edit/${hotel?.id}`)
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
			title='Hotels'
			headerContent={
				<Flex gap={16} mr={8} align='center'>
					<StyledSearch
						value={hotelNameFilter}
						onChange={setHotelNameFilter}
						placeholder='Search by hotel name'
					/>
					<StyledSearch
						value={contactEmailFilter}
						onChange={setContactEmailFilter}
						placeholder='Search by contact email'
					/>
					<StyledSearch
						value={hotelTownFilter}
						onChange={setHotelTownFilter}
						placeholder='Search by town'
					/>
					<StyledSearch
						value={hotelStreetFilter}
						onChange={setHotelStreetFilter}
						placeholder='Search by street'
					/>
					<StyledCheckbox
						label='Active'
						checked={hotelStatusFilter}
						onChange={setHotelStatusFilter}
					/>
					<StyledDivider
						orientation='vertical'
						h={24}
						color='gray.5'
						m='auto'
					/>
					<Link href='/hotels/add'>
						<StyledButton
							color='dark'
							variant='outline'
							leftIcon={<IconPlus size={22} />}
						>
							Add Hotel
						</StyledButton>
					</Link>
				</Flex>
			}
			pageContent={
				<>
					{hotelsLoading ? (
						<Flex mih={500} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>
							{filteredHotels?.length === 0 ? (
								<NoData message='No hotel found' minHeight={600} />
							) : (
								<StyledTable highlightOnHover>
									<thead>
										<tr>
											<th>Name</th>
											<th>Contact name</th>
											<th>Contact Email</th>
											<th>Contact Phone</th>
											<th>Address</th>
											<th>Active</th>
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

export default Hotels
