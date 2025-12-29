import {
	StyledButton,
	StyledModal,
	StyledNumberInput,
	StyledSelect
} from "@/design-components"
import useGenerateVoucherCodes from "@/hooks/voucher/useGenerateVoucherCodes"
import { Flex, Loader } from "@mantine/core"
import { useForm } from "@mantine/form"
import { customNotification } from "@/shared-utils"
import useVoucherPrograms from "@/hooks/voucher/useVoucherPrograms"
import { map, filter } from "lodash"
import { useQueryClient } from "@tanstack/react-query"
import { VOUCHER_TYPES } from "@/shared-constants"

const AddVoucherCodeModal = ({
	refetchVoucherCodes,
	addVoucherCodeModalOpen,
	setAddVoucherCodeModalOpen
}: any) => {
	const queryClient = useQueryClient()

	const { data: voucherPrograms, isLoading: voucherProgramsLoading } =
		useVoucherPrograms()

	const form = useForm({
		initialValues: {
			numberOfCodes: "",
			voucherProgramId: ""
		},
		validate: values => ({
			name: !values.numberOfCodes && "Amount of codes is requried",
			price: !values.voucherProgramId && "Voucher program is required"
		})
	})

	const { mutate: generateVoucherCodes } = useGenerateVoucherCodes({
		onSuccess: () => {
			customNotification.success({
				title: "Generate voucher codes",
				message: "Voucher codes generated successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Generate voucher codes",
				message: "Voucher codes generation failed"
			})
		},
		onSettled: () => {
			queryClient.invalidateQueries(["voucher_codes"])
			form.reset()
		}
	})

	const voucherProgramOptions = map(
		filter(
			voucherPrograms?.data,
			voucherProgram => voucherProgram?.type !== VOUCHER_TYPES.DISCOUNT.value
		),
		voucherProgram => ({
			label: voucherProgram?.name,
			value: voucherProgram?.id
		})
	)

	const onClose = () => {
		setAddVoucherCodeModalOpen(false)
		form.reset()
	}

	return (
		<StyledModal
			size='lg'
			mih={300}
			opened={addVoucherCodeModalOpen}
			title='Generate voucher codes'
			onClose={onClose}
			modalBody={
				<>
					{voucherProgramsLoading ? (
						<Flex mih={500} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<Flex direction='column' rowGap={16}>
							<StyledNumberInput
								label='Amount of codes'
								placeholder='Add amount of codes to be generated'
								required
								max={100}
								{...form.getInputProps("numberOfCodes")}
							/>
							<StyledSelect
								label='Select voucher program'
								placeholder='Voucher program'
								required
								data={voucherProgramOptions}
								{...form.getInputProps("voucherProgramId")}
							/>
						</Flex>
					)}
				</>
			}
			modalFooter={
				<Flex justify='space-between'>
					<StyledButton color='dark' variant='outline' onClick={onClose}>
						Cancel
					</StyledButton>
					<StyledButton
						color='green'
						disabled={!form.isValid()}
						onClick={() => {
							generateVoucherCodes({ ...form.values })
							refetchVoucherCodes()
							setAddVoucherCodeModalOpen(false)
						}}
					>
						Generate codes
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default AddVoucherCodeModal
