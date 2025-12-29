import { StyledButton, StyledModal } from "@/design-components"
import { Flex } from "@mantine/core"
import React from "react"
import {
	ConsentDescription,
	ConsentRequest
} from "./alcohol-consent-modal.style"

export type AlcoholConsentModalProps = {
	alcoholConsentModalOpen: boolean
	onClose: () => void
	handleContinue: () => void
}

const AlcoholConsentModal = (
	alcoholConsentModalProps: AlcoholConsentModalProps
) => {
	const { alcoholConsentModalOpen, onClose, handleContinue } =
		alcoholConsentModalProps
	return (
		<StyledModal
			size='md'
			centered={true}
			opened={alcoholConsentModalOpen}
			onClose={onClose}
			title={`ID required at the door`}
			modalBody={
				<>
					<ConsentDescription>
						Alcoholic beverages may be sold and delivered only to persons who
						are at least 21 years old and by placing your order with us, you
						represent and warrant to us that you are at least 21 years of age
						and that the person to whom delivery will be made is also at least
						21 years of age to accept delivery.
					</ConsentDescription>
					<ConsentRequest>
						Please be prepared to show a government issued ID to the courier
						during drop off to receive the order.
					</ConsentRequest>
				</>
			}
			modalFooter={
				<Flex justify='flex-end' columnGap={16}>
					<StyledButton variant='outline' color='dark' onClick={onClose}>
						Go Back
					</StyledButton>
					<StyledButton color='green' onClick={handleContinue}>
						Agree & Continue
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default AlcoholConsentModal
