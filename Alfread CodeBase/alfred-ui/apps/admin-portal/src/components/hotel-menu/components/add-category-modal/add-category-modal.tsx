import { StyledButton, StyledModal, StyledTextInput } from "@/design-components"
import useAddMenuCategory from "@/hooks/menu-category/useAddMenuCategory"
import { Flex } from "@mantine/core"
import { useForm } from "@mantine/form"
import { customNotification } from "@/shared-utils"

const AddCategoryModal = ({
	menuId,
	hotelId,
	mealPeriodId,
	addCategoryModalOpen,
	refetchMenuCategories,
	setAddCategoryModalOpen
}: any) => {
	const form = useForm({
		initialValues: {
			name: ""
		},
		validate: {
			name: value => (value?.length > 2 ? null : "Invalid name")
		}
	})

	const { mutate: addMenuCategory } = useAddMenuCategory({
		onSuccess: () => {
			customNotification.success({
				title: "Add category",
				message: "Category added successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Add category",
				message: "Adding category failed"
			})
		},
		onSettled: () => {
			form.reset()
			refetchMenuCategories()
			setAddCategoryModalOpen(false)
		}
	})

	const onClose = () => {
		form.reset()
		setAddCategoryModalOpen(false)
	}

	return (
		<StyledModal
			size='lg'
			opened={addCategoryModalOpen}
			title='Add category'
			onClose={onClose}
			modalBody={
				<Flex direction='column' rowGap={16}>
					<StyledTextInput
						label='Name'
						placeholder='Name'
						required
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
						disabled={!form?.isValid()}
						onClick={() => {
							const name = form?.values?.name
							if (hotelId && mealPeriodId && menuId && name) {
								addMenuCategory({ mealPeriodId, menuId, hotelId, name })
							}
							setAddCategoryModalOpen(false)
						}}
					>
						Add category
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default AddCategoryModal
