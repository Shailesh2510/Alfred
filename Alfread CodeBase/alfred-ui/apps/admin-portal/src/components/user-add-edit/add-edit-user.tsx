import { PageStructure } from "@/shared-components"
import {
	StyledDivider,
	StyledTextInput,
	StyledButton,
	StyledSelect,
	StyledCheckbox,
	StyledPasswordInput
} from "@/design-components"
import { Box, Flex, Grid, Loader, Popover, Progress, Text } from "@mantine/core"
import { useForm } from "@mantine/form"
import { AddEditUserContainer, AddEditUserFooter } from "./add-edit-user.style"
import { useRouter } from "next/router"
import { find, isBoolean, isEmpty, map, orderBy } from "lodash"
import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { customNotification } from "@/shared-utils"
import useEditUser from "@/hooks/user/useEditUser"
import useAddUser from "@/hooks/user/useAddUser"
import useUser from "@/hooks/user/useUser"
import useRoles from "@/hooks/role/useRoles"
import useMerchants from "@/hooks/merchant/useMerchants"
import useHotels from "@/hooks/hotel/useHotels"
import {
	EMAIL_VALIDATION_REGEX,
	PHONE_VALIDATION_REGEX,
	ROLE_TYPES
} from "@/shared-constants"
import useEditPassword from "@/hooks/password/useEditPassword"
import { useDisclosure } from "@mantine/hooks"
import { IconCheck, IconX } from "@tabler/icons-react"

const requirements = [
	{ re: /[0-9]/, label: "Includes number" },
	{ re: /[a-z]/, label: "Includes lowercase letter" },
	{ re: /[A-Z]/, label: "Includes uppercase letter" },
	{ re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special symbol" }
]

const PasswordRequirement = ({ meets, label }: any) => {
	return (
		<Text
			color={meets ? "teal" : "red"}
			sx={{ display: "flex", alignItems: "center" }}
			mt={7}
			size='sm'
		>
			{meets ? <IconCheck size='0.9rem' /> : <IconX size='0.9rem' />}{" "}
			<Box ml={10}>{label}</Box>
		</Text>
	)
}

const getStrength = (password: string) => {
	let multiplier = password.length >= 8 ? 0 : 1

	requirements.forEach(requirement => {
		if (!requirement.re.test(password)) {
			multiplier += 1
		}
	})

	return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10)
}

const AddEditUser = () => {
	const router = useRouter()
	const queryClient = useQueryClient()

	const [password, setPassword] = useState("")
	const [visible, { toggle }] = useDisclosure(false)
	const [popoverOpened, setPopoverOpened] = useState(false)
	const [confirmPassword, setConfirmPassword] = useState("")

	const checks = requirements.map((requirement, index) => (
		<PasswordRequirement
			key={index}
			label={requirement.label}
			meets={requirement.re.test(password)}
		/>
	))

	const strength = getStrength(password)
	const color = strength === 100 ? "teal" : strength > 50 ? "yellow" : "red"

	const { mutate: editPassword } = useEditPassword({
		onSuccess: () => {
			customNotification.success({
				title: "Edit password",
				message: "Password edited successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Edit password",
				message: "Password edit failed"
			})
		}
	})

	const { userId } = router.query

	const isEdit = router.pathname.includes("edit")

	const { data: roles } = useRoles()
	const { data: hotels } = useHotels()
	const { data: merchants } = useMerchants()

	const { data: user, isLoading: userLoading } = useUser(
		{ userId: userId as string },
		{
			enabled: !!userId
		}
	)

	const currentUser = user?.data?.[0]

	const form = useForm({
		initialValues: {
			email: "",
			firstName: "",
			lastName: "",
			phoneNumber: "",
			roleId: null,
			isActive: true,
			merchantId: null,
			hotelId: null
		},
		validate: (values: any) => {
			let basicRules: any = {
				firstName: !values.firstName && "User first name is required",
				lastName: !values.lastName && "User last name is required",
				phoneNumber: !PHONE_VALIDATION_REGEX.test(values?.phoneNumber)
					? "Please enter a valida phone number"
					: null,
				isActive: !isBoolean(values?.isActive)
					? "Is active field is requried"
					: null
			}
			if (!isEdit) {
				basicRules = {
					...basicRules,
					email: !EMAIL_VALIDATION_REGEX.test(values.email)
						? "Please enter a valid email"
						: null,
					roleId: !values.roleId && "User role is required"
				}
			}
			const selectedRole = find(roles?.data, { id: values?.roleId })

			if (selectedRole?.type === ROLE_TYPES.MERCHANT_ROLE.value) {
				return {
					...basicRules,
					merchantId: !values.merchantId && "User merchant is required"
				}
			} else if (selectedRole?.type === ROLE_TYPES.HOTEL_ROLE.value) {
				return {
					...basicRules,
					hotelId: !values.hotelId && "User hotel is required"
				}
			} else {
				return basicRules
			}
		},
		transformValues: (values: any) => {
			let basicValues: any = {
				firstName: values.firstName,
				lastName: values.lastName,
				phoneNumber: values?.phoneNumber,
				isActive: values?.isActive
			}

			if (!isEdit) {
				basicValues = {
					...basicValues,
					email: values.email,
					roleId: values.roleId
				}
			}

			const selectedRole = find(roles?.data, { id: values?.roleId })

			if (selectedRole?.type === ROLE_TYPES.MERCHANT_ROLE.value) {
				return { ...basicValues, merchantId: values.merchantId }
			} else if (selectedRole?.type === ROLE_TYPES.HOTEL_ROLE.value) {
				return { ...basicValues, hotelId: values.hotelId }
			} else {
				return basicValues
			}
		}
	})

	useEffect(() => {
		if (form.values?.merchantId) {
			form.setFieldValue("hotelId", null)
		}
	}, [form.values?.merchantId])

	useEffect(() => {
		if (form.values?.hotelId) {
			form.setFieldValue("merchantId", null)
		}
	}, [form.values?.hotelId])

	useEffect(() => {
		if (currentUser) {
			form.setValues({
				firstName: currentUser?.firstName,
				lastName: currentUser?.lastName,
				email: currentUser?.email,
				roleId: currentUser?.role?.id,
				merchantId: currentUser?.merchantId,
				hotelId: currentUser?.hotelId,
				isActive: currentUser?.isActive,
				phoneNumber: currentUser?.phoneNumber
			})
		}
	}, [currentUser])

	const { mutate: editUser } = useEditUser({
		onSuccess: () => {
			customNotification.success({
				title: "User edit",
				message: "User edited successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "User edit",
				message: "User edit failed"
			})
		},
		onSettled: () => {
			queryClient.invalidateQueries(["user"])
			queryClient.invalidateQueries(["users"])
			router.push("/users")
		}
	})

	const { mutate: addUser } = useAddUser({
		onSuccess: () => {
			customNotification.success({
				title: "User add",
				message: "User added successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "User add",
				message: "User addition failed"
			})
		},
		onSettled: () => {
			queryClient.invalidateQueries(["user"])
			queryClient.invalidateQueries(["users"])
			router.push("/users")
		}
	})

	const roleOptions = orderBy(
		map(roles?.data, role => ({
			value: role?.id,
			label: role?.name
		})),
		"label"
	)

	const hotelOptions = orderBy(
		map(hotels?.data, hotel => ({
			value: hotel?.id,
			label: hotel?.name
		})),
		"label"
	)
	const merchantOptions = orderBy(
		map(merchants?.data, merchant => ({
			value: merchant?.id,
			label: merchant?.name
		})),
		"label"
	)

	const selectedRole = find(roles?.data, { id: form.values?.roleId })

	return (
		<PageStructure
			title={isEdit ? "Edit User" : "Add User"}
			goBack={true}
			pageContent={
				<>
					{isEdit && userLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<AddEditUserContainer>
							<Grid gutter={40} h='100%'>
								<Grid.Col sm={12} md={6}>
									<Flex direction='column' gap={16}>
										<StyledDivider
											p={0}
											m={0}
											size='xs'
											color='gray.6'
											labelPosition='center'
											label='OVERVIEW'
										/>
										<Flex columnGap={16}>
											<StyledTextInput
												label='First name'
												placeholder='First name'
												required
												{...form.getInputProps("firstName")}
											/>
											<StyledTextInput
												label='Last name'
												placeholder='Last name'
												required
												{...form.getInputProps("lastName")}
											/>
										</Flex>
										<StyledCheckbox
											label='Is active'
											placeholder='Is active'
											{...form.getInputProps("isActive", { type: "checkbox" })}
										/>
										<StyledTextInput
											label='Phone number'
											placeholder='Phone number'
											required
											{...form.getInputProps("phoneNumber")}
										/>
										<StyledTextInput
											required
											label='Email'
											placeholder='Email'
											disabled={isEdit}
											{...form.getInputProps("email")}
										/>
										<StyledSelect
											required
											label='Role'
											placeholder='Role'
											disabled={isEdit}
											data={roleOptions}
											{...form.getInputProps("roleId")}
										/>
										{selectedRole?.type === ROLE_TYPES.MERCHANT_ROLE.value && (
											<StyledSelect
												required
												clearable={true}
												label='Merchant'
												placeholder='Merchant'
												data={merchantOptions}
												{...form.getInputProps("merchantId")}
											/>
										)}
										{selectedRole?.type === ROLE_TYPES.HOTEL_ROLE.value && (
											<StyledSelect
												required
												label='Hotel'
												placeholder='Hotel'
												clearable={true}
												data={hotelOptions}
												{...form.getInputProps("hotelId")}
											/>
										)}
									</Flex>
								</Grid.Col>
								<Grid.Col sm={12} md={6}>
									<Flex direction='column' gap={16}>
										<StyledDivider
											p={0}
											m={0}
											size='xs'
											color='gray.6'
											labelPosition='center'
											label='PASSWORD'
										/>
										<Popover
											opened={popoverOpened}
											position='bottom'
											width='target'
											transitionProps={{ transition: "pop" }}
										>
											<Popover.Target>
												<div
													onFocusCapture={() => setPopoverOpened(true)}
													onBlurCapture={() => setPopoverOpened(false)}
												>
													<StyledPasswordInput
														withAsterisk
														visible={visible}
														onVisibilityChange={toggle}
														label='New password'
														placeholder='New password'
														value={password}
														onChange={(event: any) =>
															setPassword(event.currentTarget.value)
														}
														description='Password must include at least one letter, number and special character'
													/>
												</div>
											</Popover.Target>
											<Popover.Dropdown>
												<Progress
													color={color}
													value={strength}
													size={5}
													mb='xs'
												/>
												<PasswordRequirement
													label='Includes at least 8 characters'
													meets={password.length >= 8}
												/>
												{checks}
											</Popover.Dropdown>
										</Popover>
										<StyledPasswordInput
											withAsterisk
											visible={visible}
											onVisibilityChange={toggle}
											label='Confirm new password'
											placeholder='Confirm new password'
											value={confirmPassword}
											error={password !== confirmPassword}
											onChange={(event: any) =>
												setConfirmPassword(event.currentTarget.value)
											}
										/>
										<Flex justify='flex-end'>
											<StyledButton
												mt={24}
												color='green'
												disabled={
													!(
														password &&
														password === confirmPassword &&
														requirements?.every(req => req.re.test(password))
													)
												}
												onClick={() => {
													if (
														password &&
														password === confirmPassword &&
														requirements?.every(req => req.re.test(password))
													) {
														editPassword({ userId, password, permanent: true })
													}
												}}
											>
												Save
											</StyledButton>
										</Flex>
									</Flex>
								</Grid.Col>
							</Grid>
						</AddEditUserContainer>
					)}
				</>
			}
			footerContent={
				<AddEditUserFooter>
					<StyledButton mr={16} variant='outline' color='dark'>
						Cancel
					</StyledButton>
					<StyledButton
						color='green'
						onClick={() => {
							form.validate().errors
							if (isEmpty(form.validate().errors)) {
								isEdit
									? editUser({
											userId,
											userData: form.getTransformedValues(form.values)
									  })
									: addUser({
											userData: form.getTransformedValues(form.values)
									  })
							}
						}}
					>
						{isEdit ? "Save changes" : "Add user"}
					</StyledButton>
				</AddEditUserFooter>
			}
		/>
	)
}

export default AddEditUser
