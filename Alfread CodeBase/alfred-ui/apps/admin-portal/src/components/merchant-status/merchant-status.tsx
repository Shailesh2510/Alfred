// import { StyledTable } from "@/design-components";
import MerchantDetailsMenu from "../shared/merchant-details-menu"
import { PageStructure } from "@/shared-components"
import { useRouter } from "next/router"
import { Flex, Loader } from "@mantine/core"
import useMerchant from "@/hooks/merchant/useMerchant"
import {
	// StatusLabel,
	StatusContainer,
	StatusTitle,
	StatusSwitchContainer,
	StyledSwitch,
	StatusSwitchLabel,
	StatusSwitchDescription,
	StatusSwitchLabelContainer
} from "./merchant-status.style"
import useUpdateMerchantStatus from "@/hooks/merchant/useUpdateMerchantStatus"
import { customNotification } from "@/shared-utils"

// const tableContent = [
//   {
//     applyDate: "17.03.2023",
//     applyTime: "1:32 p.m.",
//     comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//     approvedDate: "17.03.2023",
//     approvedTime: "1:50 p.m.",
//   },
//   {
//     applyDate: "17.03.2023",
//     applyTime: "1:32 p.m.",
//     comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//     approvedDate: "17.03.2023",
//     approvedTime: "1:50 p.m.",
//   },
//   {
//     applyDate: "17.03.2023",
//     applyTime: "1:32 p.m.",
//     comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//     approvedDate: "17.03.2023",
//     approvedTime: "1:50 p.m.",
//   },
//   {
//     applyDate: "17.03.2023",
//     applyTime: "1:32 p.m.",
//     comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//     approvedDate: "17.03.2023",
//     approvedTime: "1:50 p.m.",
//   },
// ];

const MerchantStatus = () => {
	const router = useRouter()
	const merchantId = router.query.id

	// const rows = tableContent.map((element) => (
	//   <tr key={element.applyDate}>
	//     <td>
	//       <StatusLabel>{element.applyDate}</StatusLabel>
	//     </td>
	//     <td>
	//       <StatusLabel>{element.applyTime}</StatusLabel>
	//     </td>
	//     <td>
	//       <StatusLabel>{element.comment}</StatusLabel>
	//     </td>
	//     <td>
	//       <StatusLabel>{element.approvedDate}</StatusLabel>
	//     </td>
	//     <td>
	//       <StatusLabel>{element.approvedTime}</StatusLabel>
	//     </td>
	//   </tr>
	// ));

	const {
		data: merchant,
		isLoading: merchantLoading,
		refetch: refetchMerchant
	} = useMerchant(
		{ merchantId },
		{
			enabled: !!merchantId
		}
	)
	const { mutate: updateMerchantStatus } = useUpdateMerchantStatus({
		onSuccess: () => {
			customNotification.success({
				title: "Merchant status",
				message: "Merchant status updated successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Merchant status",
				message: "Merchant status failed to be updated"
			})
		},
		onSettled: () => {
			refetchMerchant()
		}
	})

	const currentMerchant = merchant?.data?.[0]

	return (
		<PageStructure
			goBack
			title={currentMerchant?.name ? `${currentMerchant?.name} - Status` : null}
			subHeaderContent={<MerchantDetailsMenu merchantId={merchantId} />}
			pageContent={
				<>
					{merchantLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<>
							<StatusContainer>
								<StatusTitle>Kitchen status</StatusTitle>
								<StatusSwitchContainer>
									<StyledSwitch
										size='md'
										checked={currentMerchant?.isActive}
										onChange={() => {
											if (merchantId) {
												updateMerchantStatus({
													merchantId,
													isActive: !currentMerchant?.isActive
												})
											}
										}}
									/>
									<StatusSwitchLabelContainer>
										<StatusSwitchLabel>
											Kitchen is {currentMerchant?.isActive ? "open" : "closed"}
										</StatusSwitchLabel>
										<StatusSwitchDescription>
											Changing status will make all the items invisible to
											Hotels
										</StatusSwitchDescription>
									</StatusSwitchLabelContainer>
								</StatusSwitchContainer>
								{/* <StatusTitle>Status change logs</StatusTitle> */}
							</StatusContainer>
							{/* <StyledTable highlightOnHover>
                <thead>
                  <tr>
                    <th>Apply date</th>
                    <th>Apply time</th>
                    <th>Reason / Comment</th>
                    <th>Approved date</th>
                    <th>Approved time</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </StyledTable> */}
						</>
					)}
				</>
			}
		/>
	)
}

export default MerchantStatus
