import {
	StyledButton,
	StyledContainerWithTitle,
	StyledPasswordInput
} from "@/design-components"
import { PageStructure } from "@/shared-components"
import { Box, Flex, Popover, Progress, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useEffect, useState } from "react"
import { IconCheck, IconX } from "@tabler/icons-react"
import useEditPassword from "@/hooks/password/useEditPassword"
import { customNotification } from "@/shared-utils"
import { Auth } from "aws-amplify"

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

const Profile = () => {
	const [userId, setUserId] = useState(null)
	const [password, setPassword] = useState("")
	const [visible, { toggle }] = useDisclosure(false)
	const [popoverOpened, setPopoverOpened] = useState(false)
	const [confirmPassword, setConfirmPassword] = useState("")

	useEffect(() => {
		async function fetchUserId() {
			try {
				const userInfo = await Auth.currentUserInfo()
				setUserId(userInfo.attributes.sub)
			} catch (error) {
				console.error("Error fetching user ID:", error)
			}
		}

		fetchUserId()
	}, [])

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

	return (
		<PageStructure
			title='Profile'
			pageContent={
				<Flex m={20}>
					<StyledContainerWithTitle title='Password' m={20}>
						<Box maw={340} mx='auto'>
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
									<Progress color={color} value={strength} size={5} mb='xs' />
									<PasswordRequirement
										label='Includes at least 8 characters'
										meets={password.length >= 8}
									/>
									{checks}
								</Popover.Dropdown>
							</Popover>
						</Box>
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
										editPassword({ userId, password, permanant: true })
									}
								}}
							>
								Save
							</StyledButton>
						</Flex>
					</StyledContainerWithTitle>
				</Flex>
			}
		/>
	)
}

export default Profile
