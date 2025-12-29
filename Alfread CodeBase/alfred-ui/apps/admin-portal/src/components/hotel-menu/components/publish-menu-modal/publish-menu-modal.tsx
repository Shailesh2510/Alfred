import { StyledButton, StyledModal } from "@/design-components"
import { Flex } from "@mantine/core"
import { customNotification } from "@/shared-utils"
import usePublishHotelMenu from "@/hooks/menu/usePublishHotelMenu"

const PublishMenuModal = ({
	menuId,
	refetchHotel,
	currentHotel,
	publishMenuModalOpen,
	setPublishMenuModalOpen
}: any) => {
	const { mutate: publishHotelMenu } = usePublishHotelMenu({
		onSuccess: () => {
			customNotification.success({
				title: "Publish hotel menu",
				message: "Hotel menu published successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Publish hotel menu",
				message: "Hotel menu failed to be published"
			})
		},
		onSettled: () => {
			refetchHotel()
		}
	})

	return (
		<StyledModal
			opened={publishMenuModalOpen}
			title={`Publish "${currentHotel?.name}" menu`}
			onClose={() => setPublishMenuModalOpen(false)}
			modalBody={"Are you sure you want to publish the menu?"}
			modalFooter={
				<Flex justify='space-between'>
					<StyledButton
						variant='outline'
						color='dark'
						onClick={() => setPublishMenuModalOpen(false)}
					>
						Cancel
					</StyledButton>
					<StyledButton
						color='green'
						onClick={() => {
							publishHotelMenu({ menuId, hotelId: currentHotel?.id })
							setPublishMenuModalOpen(false)
						}}
					>
						Publish
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default PublishMenuModal
