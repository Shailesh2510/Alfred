import { StyledButton, StyledModal, StyledTextInput } from "@/design-components"
import { Flex } from "@mantine/core"
import { customNotification } from "@/shared-utils"
import useRenameMenuCategory from "@/hooks/menu-category/useRenameMenuCategory"
import { useEffect } from "react"
import { useForm } from "@mantine/form"

const RenameCategoryModal = ({
	hotelId,
	menuCategoryId,
	menuCategoryName,
	refetchMenuCategories,
	renameCategoryModalOpen,
	setRenameCategoryModalOpen
}: any) => {
	const form = useForm({
		initialValues: {
			name: ""
		},
		validate: {
			name: value => (value?.length > 2 ? null : "Invalid name")
		}
	})

	useEffect(() => {
		if (menuCategoryName && renameCategoryModalOpen) {
			form.setValues({ name: menuCategoryName })
		}
	}, [menuCategoryName, renameCategoryModalOpen])

	const { mutate: renameMenuCategory } = useRenameMenuCategory({
		onSuccess: () => {
			customNotification.success({
				title: "Rename category",
				message: "Category renamed successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Rename category",
				message: "Renaming category failed"
			})
		},
		onSettled: () => {
			refetchMenuCategories()
			setRenameCategoryModalOpen(false)
		}
	})

	const onClose = () => {
		setRenameCategoryModalOpen(false)
		form.reset()
	}

	return (
		<StyledModal
			size='lg'
			opened={renameCategoryModalOpen}
			title='Rename menu category'
			onClose={onClose}
			modalBody={
				<Flex direction='column'>
					<StyledTextInput
						required
						label='Menu category name'
						{...form.getInputProps("name")}
					/>
				</Flex>
			}
			modalFooter={
				<Flex justify='space-between'>
					<StyledButton variant='outline' color='dark' onClick={onClose}>
						Cancel
					</StyledButton>
					<StyledButton
						color='green'
						disabled={!form.isValid()}
						onClick={() => {
							const name = form?.values?.name
							if (menuCategoryId && hotelId && name) {
								renameMenuCategory({ menuCategoryId, hotelId, name })
							}
							setRenameCategoryModalOpen(false)
						}}
					>
						Rename category
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default RenameCategoryModal
