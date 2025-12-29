import { ConfirmDeleteModal, NoData, PageStructure } from "@/shared-components"
import {
	IconDotsVertical,
	IconEdit,
	IconPlus,
	IconTrash
} from "@tabler/icons-react"
import { ActionIcon, Flex, Loader, Menu } from "@mantine/core"
import {
	StyledSearch,
	StyledButton,
	StyledTable,
	StyledDivider
} from "@/design-components"
import { UserDetailContainer, UserName, UserEmail } from "./users.style"
import { filter } from "lodash"
import { useRouter } from "next/router"
import Link from "next/link"
import { useInputState } from "@mantine/hooks"
import useUsers from "@/hooks/user/useUsers"
import { ICON_SIZE, USER_TYPES } from "@/shared-constants"
import { useState } from "react"
import { customNotification } from "@/shared-utils"
import useDeleteUser from "@/hooks/user/useDeleteUser"

const Users = () => {
	const [userNameFilter, setUserNameFilter] = useInputState("")
	const [userEmailFilter, setUserEmailFilter] = useInputState("")
	const [deleteModalOpen, setDeleteModalOpen] = useState<any>(false)
	const [userToDelete, setUserToDelete] = useState<any>(null)

	const router = useRouter()

	const {
		data: users,
		isLoading: usersLoading,
		refetch: refetchUsers
	} = useUsers()

	const { mutate: deleteUser } = useDeleteUser({
		onSuccess: () => {
			customNotification.success({
				title: "Delete user",
				message: "User deleted successfully"
			})
		},
		onError: () =>
			customNotification.error({
				title: "Delete user",
				message: "User deletion failed"
			}),
		onSettled: () => {
			refetchUsers()
			setUserToDelete(null)
		}
	})

	let filteredUsers = users?.data

	if (userEmailFilter) {
		filteredUsers = filter(filteredUsers, user =>
			user?.email?.toLowerCase().includes(userEmailFilter?.toLowerCase())
		)
	}

	if (userNameFilter) {
		filteredUsers = filter(filteredUsers, user =>
			`${user?.firstName} ${user?.lastName}`
				?.toLowerCase()
				.includes(userNameFilter?.toLowerCase())
		)
	}

	const rows = filteredUsers?.map((user: any) => (
		<tr key={user.id}>
			<td>
				<UserDetailContainer>
					<UserName>{`${user.firstName} ${user.lastName}`}</UserName>
					<UserEmail>{user.email}</UserEmail>
				</UserDetailContainer>
			</td>
			<td>{user?.phoneNumber}</td>
			<td>{USER_TYPES?.[user?.type]?.label}</td>
			<td>{user?.hotelName || "-"}</td>
			<td>{user?.merchantName || "-"}</td>
			<td>{user?.isActive ? "True" : "False"}</td>
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
								onClick={() => router.push(`/users/edit/${user?.id}`)}
							>
								Edit
							</StyledButton>
							<StyledButton
								fullWidth
								color='dark'
								variant='outline'
								leftIcon={<IconTrash size={ICON_SIZE} color='black' />}
								onClick={() => {
									setDeleteModalOpen(true)
									setUserToDelete(user)
								}}
							>
								Delete
							</StyledButton>
						</Flex>
					</Menu.Dropdown>
				</Menu>
			</td>
		</tr>
	))

	return (
		<PageStructure
			title='Users'
			headerContent={
				<Flex gap={16} mr={8} align='center'>
					<StyledSearch
						value={userNameFilter}
						onChange={setUserNameFilter}
						placeholder='Search by name'
					/>
					<StyledSearch
						value={userEmailFilter}
						onChange={setUserEmailFilter}
						placeholder='Search by email'
					/>
					<StyledDivider
						orientation='vertical'
						h={24}
						color='gray.5'
						m='auto'
					/>
					<Link href='/users/add'>
						<StyledButton
							variant='outline'
							leftIcon={<IconPlus size={22} color='black' />}
							color='dark'
						>
							Add User
						</StyledButton>
					</Link>
				</Flex>
			}
			pageContent={
				<>
					{usersLoading ? (
						<Flex mih={500} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>
							{filteredUsers?.length === 0 ? (
								<NoData message='No user found' minHeight={600} />
							) : (
								<StyledTable highlightOnHover>
									<thead>
										<tr>
											<th>Name & Email</th>
											<th>Phone number</th>
											<th>Role</th>
											<th>Hotel</th>
											<th>Merchant</th>
											<th>Active</th>
											<th></th>
										</tr>
									</thead>
									<tbody>{rows}</tbody>
									<ConfirmDeleteModal
										title='Delete user'
										message={
											<>
												Are you sure you want to delete the user `
												<b>{`${userToDelete?.firstName} ${userToDelete?.lastName}`}</b>
												`?
											</>
										}
										modalOpen={deleteModalOpen}
										setModalOpen={setDeleteModalOpen}
										onClose={() => setUserToDelete(null)}
										onDelete={() => {
											if (userToDelete?.id) {
												deleteUser({ userId: userToDelete?.id })
											}
										}}
									/>
								</StyledTable>
							)}
						</>
					)}
				</>
			}
		/>
	)
}

export default Users
