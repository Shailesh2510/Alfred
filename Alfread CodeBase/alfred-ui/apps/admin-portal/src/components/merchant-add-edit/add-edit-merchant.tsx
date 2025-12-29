import { PageStructure } from "@/shared-components"
import {
	StyledDivider,
	StyledTextInput,
	StyledButton,
	StyledSelect,
	StyledNumberInput,
	StyledCheckbox
} from "@/design-components"
import { BackgroundImage, Flex, Grid, Loader, Modal, Text } from "@mantine/core"
import { useForm } from "@mantine/form"
import {
	AddEditMerchantContainer,
	AddEditMerchantBody,
	AddEditMerchantFooter
} from "./add-edit-merchant.style"
import { useRouter } from "next/router"
import { isBoolean, isEmpty, isNumber, map, orderBy, toString } from "lodash"
import useMerchant from "@/hooks/merchant/useMerchant"
import { useEffect, useState, useRef, SyntheticEvent } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { customNotification } from "@/shared-utils"
import useEditMerchant from "@/hooks/merchant/useEditMerchant"
import useAddMerchant from "@/hooks/merchant/useAddMerchant"
import useCities from "@/hooks/city/useCities"
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone"
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react"
import useGetMerchantImagePresignedUrl from "@/hooks/merchant/useGetMerchantImagePresignedUrl"
import useUploadMerchantImage from "@/hooks/merchant/useUploadMerchantImage"
import {
	MERCHANT_TYPE_RIDES,
	MERCHANT_TYPE_ROOM_SERVICE
} from "@/shared-constants"
import useGetMerchantCoverImagePresignedUrl from "@/hooks/merchant/useGetMerchantCoverImagePresignedUrl"
import ReactCrop, {
	centerCrop,
	makeAspectCrop,
	Crop,
	PixelCrop
} from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

interface City {
	id: string
	name: string
}

interface SelectOption {
	value: string
	label: string
}

interface PresignedUrlResponse {
	data: {
		url: string
		imageUrl: string
	}[]
}

// Utils
function centerAspectCrop(
	mediaWidth: number,
	mediaHeight: number,
	aspect: number
): Crop {
	return centerCrop(
		makeAspectCrop(
			{
				unit: "%",
				width: 90
			},
			aspect,
			mediaWidth,
			mediaHeight
		),
		mediaWidth,
		mediaHeight
	)
}

const AddEditMerchant = () => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const merchantId = router.query.merchantId as string
	const isEdit = router.pathname.includes("edit")

	// Data fetching hooks
	const { data: cities } = useCities()
	const { data: merchant, isLoading: merchantLoading } = useMerchant(
		{ merchantId },
		{ enabled: !!merchantId }
	)

	// Component state
	const [uploadedImage, setUploadedImage] = useState<string | null>(null)
	const [droppedFile, setDroppedFile] = useState<File>()
	const [uploadedCoverImage, setUploadedCoverImage] = useState<string | null>(
		null
	)
	const [droppedCoverFile, setDroppedCoverFile] = useState<File>()
	const [currentAspectRatio, setCurrentAspectRatio] = useState<number>(1)

	// Image cropping states
	const [cropModalOpen, setCropModalOpen] = useState<boolean>(false)
	const [isCoverimageSelected, setIsCoverimageSelected] =
		useState<boolean>(false)
	const [currentImage, setCurrentImage] = useState<string>("")
	const [crop, setCrop] = useState<Crop>()
	const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
	const imgRef = useRef<HTMLImageElement>(null)
	const previewCanvasRef = useRef<HTMLCanvasElement>(null)

	// Form definition
	const form = useForm({
		initialValues: {
			name: "",
			description: "",
			contactEmail: "",
			contactPhone: "",
			addressNumber: "",
			addressStreet: "",
			addressTown: "",
			addressZipCode: "",
			cityId: null,
			merchantType: MERCHANT_TYPE_ROOM_SERVICE,
			taxRate: "",
			latitude: "",
			longitude: "",
			isActive: true,
			hasThirdPartyDelivery: true,
			imageUrl: "",
			coverImageUrl: "",
			allowCatering: false,
			eta: 0
		},
		validate: values => ({
			name: !values.name ? "Merchant name is required" : null,
			description: !values.description
				? "Merchant description is required"
				: null,
			contactEmail:
				values.contactEmail && /^\S+@\S+$/.test(values.contactEmail)
					? null
					: "Merchant email is invalid",
			contactPhone: !values.contactPhone
				? "Merchant phone number is required"
				: null,
			addressNumber: !values.addressNumber
				? "Merchant address number is required"
				: null,
			addressStreet: !values.addressStreet
				? "Merchant address street is required"
				: null,
			addressTown: !values.addressTown
				? "Merchant address town is required"
				: null,
			addressZipCode: !values.addressZipCode
				? "Merchant address zip code is required"
				: null,
			cityId: !values.cityId ? "Merchant city is required" : null,
			taxRate: !isNumber(values.taxRate)
				? "Merchant tax rate is required"
				: null,
			latitude: !values.latitude ? "Merchant latitude is required" : null,
			longitude: !values.longitude ? "Merchant longitude is required" : null,
			isActive: !isBoolean(values.isActive)
				? "Merchant active status is required"
				: null,
			hasThirdPartyDelivery: !isBoolean(values.isActive)
				? "Merchant third party delivery status is required"
				: null,
			allowCatering: !isBoolean(values.isActive)
				? "Merchant third party delivery status is required"
				: null
		}),
		transformValues: values => ({
			name: values?.name,
			description: values?.description,
			merchantType: values?.merchantType,
			contactEmail: values?.contactEmail,
			contactPhone: values?.contactPhone,
			addressNumber: values?.addressNumber,
			addressStreet: values?.addressStreet,
			addressTown: values?.addressTown,
			addressZipCode: values?.addressZipCode,
			cityId: toString(values?.cityId),
			taxRate: values.taxRate ? toString(values.taxRate) : "0",
			coordinates:
				values.longitude && values.latitude
					? `(${values.latitude},${values.longitude})`
					: "",
			isActive: values?.isActive,
			hasThirdPartyDelivery: values?.hasThirdPartyDelivery,
			allowCatering: values?.allowCatering,
			imageUrl: values.imageUrl ?? uploadedImage ?? "",
			coverImageUrl: values.coverImageUrl ?? uploadedCoverImage ?? "",
			eta: values?.eta
		})
	})

	// Mutation hooks
	const { mutate: editMerchant } = useEditMerchant({
		onSuccess: () => {
			customNotification.success({
				title: "Merchant edit",
				message: "Merchant edited successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Merchant edit",
				message: "Merchant edit failed"
			})
		},
		onSettled: () => {
			invalidateQueriesAndRedirect()
		}
	})

	const { mutate: addMerchant } = useAddMerchant({
		onSuccess: () => {
			customNotification.success({
				title: "Merchant add",
				message: "Merchant added successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Merchant add",
				message: "Merchant addition failed"
			})
		},
		onSettled: () => {
			invalidateQueriesAndRedirect()
		}
	})

	// Image upload hooks
	const { mutate: fetchPresignedUrl } = useGetMerchantImagePresignedUrl({
		onSuccess: (data: any) => {
			if (data?.data?.[0]?.url && droppedFile) {
				uploadImage({
					url: data.data[0].url,
					file: droppedFile,
					imageUrl: data.data[0].imageUrl
				})
			}
		},
		onError: () => {
			console.error("Failed to fetch presigned URL")
		}
	})

	const { mutate: fetchPresignedCoverImageUrl } =
		useGetMerchantCoverImagePresignedUrl({
			onSuccess: (data: any) => {
				if (data?.data?.[0]?.url) {
					uploadCoverImage({
						url: data.data[0].url,
						file: droppedCoverFile,
						imageUrl: data.data[0].imageUrl
					})
				}
			},
			onError: () => {
				console.error("Failed to fetch presigned URL")
			}
		})

	const { mutate: uploadImage, isLoading: merchantImageLoading } =
		useUploadMerchantImage({
			onSuccess: (data: any, variables: any) => {
				form.getTransformedValues({
					...form.values,
					imageUrl: variables.imageUrl
				})
			},
			onError: () => {
				customNotification.error({
					title: "Image upload",
					message: "Image upload failed"
				})
			}
		})

	const { mutate: uploadCoverImage, isLoading: merchantCoverImageLoading } =
		useUploadMerchantImage({
			onSuccess: (data: any, variables: any) => {
				form.getTransformedValues({
					...form.values,
					coverImageUrl: variables.imageUrl
				})
			},
			onError: () => {
				customNotification.error({
					title: "Image upload",
					message: "Image upload failed"
				})
			}
		})

	// Helper functions and derived data
	const invalidateQueriesAndRedirect = (): void => {
		queryClient.invalidateQueries(["merchant"])
		queryClient.invalidateQueries(["merchants"])
		router.push("/merchants")
	}

	const currentMerchant = merchant?.data?.[0]

	const cityOptions: SelectOption[] = orderBy(
		map(cities?.data, (city: City) => ({
			value: city?.id,
			label: city?.name
		})),
		"label"
	)

	const merchantTypeOptions: SelectOption[] = [
		{ value: MERCHANT_TYPE_ROOM_SERVICE, label: "Room Service" },
		{ value: MERCHANT_TYPE_RIDES, label: "Rides" }
	]

	// Effects
	useEffect(() => {
		if (currentMerchant) {
			form.setValues({
				name: currentMerchant?.name,
				cityId: currentMerchant?.cityId,
				description: currentMerchant?.description,
				contactEmail: currentMerchant?.contactEmail,
				contactPhone: currentMerchant?.contactPhone,
				addressNumber: currentMerchant?.addressNumber,
				addressStreet: currentMerchant?.addressStreet,
				addressTown: currentMerchant?.addressTown,
				merchantType: currentMerchant?.merchantType,
				addressZipCode: currentMerchant?.addressZipCode,
				latitude: currentMerchant?.coordinates?.x,
				longitude: currentMerchant?.coordinates?.y,
				isActive: currentMerchant?.isActive,
				taxRate: parseFloat(currentMerchant?.taxRate) as any,
				hasThirdPartyDelivery: currentMerchant?.hasThirdPartyDelivery,
				imageUrl: currentMerchant?.imageUrl || "",
				coverImageUrl: currentMerchant?.coverImageUrl || "",
				allowCatering: currentMerchant?.allowCatering,
				eta: parseFloat(currentMerchant?.eta)
			})
			setUploadedImage(currentMerchant?.imageUrl || null)
			setUploadedCoverImage(currentMerchant?.coverImageUrl || null)
		}
	}, [currentMerchant])

	// Event handlers
	const handleDrop = (files: FileWithPath[]): void => {
		const reader = new FileReader()
		reader.onload = () => {
			if (reader.result) {
				setCurrentAspectRatio(1) // Logo uses 1:1 aspect ratio
				setCurrentImage(reader.result.toString())
				setIsCoverimageSelected(false)
				setCropModalOpen(true)
				setDroppedFile(files[0])
			}
		}
		reader.readAsDataURL(files[0])
	}

	const handleCoverDrop = (files: FileWithPath[]): void => {
		const reader = new FileReader()
		reader.onload = () => {
			if (reader.result) {
				setCurrentAspectRatio(2.25)
				setCurrentImage(reader.result.toString())
				setIsCoverimageSelected(true)
				setCropModalOpen(true)
				setDroppedCoverFile(files[0])
			}
		}
		reader.readAsDataURL(files[0])
	}

	const handleCropComplete = (crop: PixelCrop): void => {
		setCompletedCrop(crop)
	}

	const onImageLoad = (e: SyntheticEvent<HTMLImageElement>): void => {
		const { width, height } = e.currentTarget
		setCrop(centerAspectCrop(width, height, currentAspectRatio))
	}

	const generateCroppedImage = async (): Promise<void> => {
		if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
			return Promise.resolve()
		}

		const image = imgRef.current
		const canvas = previewCanvasRef.current
		const crop = completedCrop

		const scaleX = image.naturalWidth / image.width
		const scaleY = image.naturalHeight / image.height
		const ctx = canvas.getContext("2d")

		if (!ctx) {
			return Promise.resolve()
		}

		const pixelRatio = window.devicePixelRatio
		canvas.width = crop.width * pixelRatio
		canvas.height = crop.height * pixelRatio

		ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
		ctx.imageSmoothingQuality = "high"

		ctx.drawImage(
			image,
			crop.x * scaleX,
			crop.y * scaleY,
			crop.width * scaleX,
			crop.height * scaleY,
			0,
			0,
			crop.width,
			crop.height
		)

		return new Promise<void>(resolve => {
			canvas.toBlob(
				blob => {
					if (!blob) {
						console.error("Canvas is empty")
						resolve()
						return
					}
					const croppedFile = new File(
						[blob],
						`cropped-image-${merchantId}-${
							isCoverimageSelected ? "cover" : "logo"
						}.png`,
						{ type: "image/png" }
					)
					const reader = new FileReader()
					reader.onload = () => {
						const result = reader.result?.toString() || ""
						if (isCoverimageSelected) {
							setUploadedCoverImage(result)
							setDroppedCoverFile(croppedFile)
						} else {
							setUploadedImage(result)
							setDroppedFile(croppedFile)
						}
						resolve()
					}
					reader.readAsDataURL(blob)
				},
				"image/png",
				1
			)
		})
	}

	const applyCrop = async (): Promise<void> => {
		await generateCroppedImage()
		setCropModalOpen(false)
	}

	const handleSave = async (): Promise<void> => {
		form.validate()
		if (!isEmpty(form.validate().errors)) {
			return
		}

		try {
			let uploadedImageUrl = uploadedImage
			let uploadedCoverImageUrl = uploadedCoverImage

			// Handle logo image upload
			if (droppedFile) {
				const { data } = await new Promise<PresignedUrlResponse>(
					(resolve, reject) => {
						fetchPresignedUrl(merchantId, {
							onSuccess: resolve,
							onError: reject
						})
					}
				)

				if (data?.[0]?.url) {
					await new Promise<any>((resolve, reject) => {
						uploadImage(
							{
								url: data[0].url,
								file: droppedFile,
								imageUrl: data[0].imageUrl
							},
							{
								onSuccess: (uploadedData, variables) => {
									uploadedImageUrl = variables.imageUrl
									resolve(uploadedData)
								},
								onError: reject
							}
						)
					})
				}
			}

			// Handle cover image upload
			if (droppedCoverFile) {
				const { data } = await new Promise<PresignedUrlResponse>(
					(resolve, reject) => {
						fetchPresignedCoverImageUrl(merchantId, {
							onSuccess: resolve,
							onError: reject
						})
					}
				)

				if (data?.[0]?.url) {
					await new Promise<any>((resolve, reject) => {
						uploadCoverImage(
							{
								url: data[0].url,
								file: droppedCoverFile,
								imageUrl: data[0].imageUrl
							},
							{
								onSuccess: (uploadedData, variables) => {
									uploadedCoverImageUrl = variables.imageUrl
									resolve(uploadedData)
								},
								onError: reject
							}
						)
					})
				}
			}

			const transformedValues = form.getTransformedValues({
				...form.values,
				imageUrl: uploadedImageUrl ?? "",
				coverImageUrl: uploadedCoverImageUrl ?? ""
			})

			if (isEdit) {
				editMerchant({ merchantId, ...transformedValues })
			} else {
				addMerchant(transformedValues)
			}
		} catch (error) {
			console.error("Error saving merchant:", error)
			customNotification.error({
				title: "Merchant Save",
				message: "An error occurred while saving the merchant."
			})
		}
	}

	// Component sections
	const renderMerchantOverview = () => (
		<Flex direction='column' gap={16}>
			<StyledDivider
				p={0}
				m={0}
				size='xs'
				color='gray.6'
				labelPosition='center'
				label='MERCHANT OVERVIEW'
			/>
			<StyledTextInput
				label='Name'
				placeholder='Name'
				required
				{...form.getInputProps("name")}
			/>
			<StyledSelect
				label='Merchant Type'
				placeholder='Select Merchant Type'
				required
				data={merchantTypeOptions}
				defaultValue={MERCHANT_TYPE_ROOM_SERVICE}
				{...form.getInputProps("merchantType")}
				onChange={(value: string) => {
					form.setFieldValue("merchantType", value)
					if (value !== MERCHANT_TYPE_ROOM_SERVICE) {
						form.setFieldValue("allowCatering", false)
					}
				}}
			/>
			<StyledTextInput
				label='Description'
				placeholder='Merchant description'
				required
				{...form.getInputProps("description")}
			/>
			<StyledNumberInput
				label='ETA(mins)'
				placeholder='ETA in minutes'
				required
				{...form.getInputProps("eta")}
			/>
			<StyledTextInput
				label='Email'
				placeholder='Merchant email'
				required
				{...form.getInputProps("contactEmail")}
			/>
			<StyledTextInput
				label='Phone'
				placeholder='Phone'
				required
				{...form.getInputProps("contactPhone")}
			/>
			<StyledCheckbox
				label='Active'
				placeholder='Active'
				required
				{...form.getInputProps("isActive", {
					type: "checkbox"
				})}
			/>
			<StyledCheckbox
				label='Has third party delivery'
				placeholder='Has third party delivery'
				required
				{...form.getInputProps("hasThirdPartyDelivery", {
					type: "checkbox"
				})}
			/>
			{form.values.merchantType === MERCHANT_TYPE_ROOM_SERVICE && (
				<StyledCheckbox
					label='Enable catering'
					placeholder='Enable catering'
					required
					{...form.getInputProps("allowCatering", {
						type: "checkbox"
					})}
				/>
			)}
			<StyledNumberInput
				label='Tax rate'
				placeholder='Tax rate'
				required
				precision={3}
				{...form.getInputProps("taxRate")}
			/>
			<Flex columnGap={16}>
				<StyledNumberInput
					label='Latitude'
					placeholder='Latitude'
					required
					precision={4}
					{...form.getInputProps("latitude")}
				/>
				<StyledNumberInput
					label='Longitude'
					placeholder='Longitude'
					required
					precision={4}
					{...form.getInputProps("longitude")}
				/>
			</Flex>
		</Flex>
	)

	const renderAddressSection = () => (
		<Flex direction='column' gap={16}>
			<StyledDivider
				color='gray.6'
				size='xs'
				labelPosition='center'
				label='ADDRESS'
				p={0}
				m={0}
			/>
			<StyledTextInput
				label='Number'
				placeholder='Number'
				required
				{...form.getInputProps("addressNumber")}
			/>
			<StyledTextInput
				label='Street'
				placeholder='Street'
				required
				{...form.getInputProps("addressStreet")}
			/>
			<StyledTextInput
				label='Town'
				placeholder='Town'
				required
				{...form.getInputProps("addressTown")}
			/>
			<StyledTextInput
				label='Zip code'
				placeholder='Zip code'
				required
				{...form.getInputProps("addressZipCode")}
			/>
			<StyledSelect
				label='City'
				placeholder='City'
				required
				data={cityOptions}
				{...form.getInputProps("cityId")}
			/>
		</Flex>
	)

	const renderImageDropzone = ({
		title,
		height,
		width,
		loading,
		uploadedImg,
		onDropHandler
	}: any) => (
		<Flex direction='column' gap={16}>
			<StyledDivider
				color='gray.6'
				size='xs'
				labelPosition='center'
				label={title}
				p={0}
				m={0}
				{...(title === "COVER IMAGE" ? { sx: { marginTop: "12px" } } : {})}
			/>
			<Flex justify='center' align='center'>
				<Dropzone
					p={0}
					h={height}
					w={width}
					loading={loading}
					radius={8}
					maxFiles={1}
					onDrop={files => onDropHandler(files)}
					onReject={(_files: any) => {
						customNotification.error({
							title: "File upload",
							message: _files[0]?.file?.name
								? `File ${_files[0]?.file?.name} was not uploaded`
								: "File was not uploaded"
						})
					}}
					maxSize={3 * 1024 ** 2}
					accept={IMAGE_MIME_TYPE}
				>
					<Flex justify='center' align='center' h={height} w={width}>
						<BackgroundImage
							src={uploadedImg ? uploadedImg : ""}
							h={height}
							w={width}
							radius={8}
						>
							<Flex justify='center' align='center' h={height} w={width}>
								<Dropzone.Accept>
									<IconUpload size='3.2rem' stroke={1.5} />
								</Dropzone.Accept>
								<Dropzone.Reject>
									<IconX size='3.2rem' stroke={1.5} />
								</Dropzone.Reject>
								{!uploadedImg && (
									<Dropzone.Idle>
										<IconPhoto size='3.2rem' stroke={1.5} />
									</Dropzone.Idle>
								)}
							</Flex>
						</BackgroundImage>
					</Flex>
				</Dropzone>
			</Flex>
		</Flex>
	)

	const renderCropModal = () => (
		<Modal
			opened={cropModalOpen}
			onClose={() => setCropModalOpen(false)}
			title={isCoverimageSelected ? "Crop Cover Image" : "Crop Logo Image"}
			size='lg'
		>
			<Flex direction='column' align='center'>
				<Text size='sm' color='dimmed'>
					{isCoverimageSelected
						? "Cover image should maintain a 2.25:1 aspect ratio for optimal display"
						: "Logo image should be square (1:1) for optimal display"}
				</Text>
				<div
					className='crop-container'
					style={{
						maxWidth: "100%",
						maxHeight: "60vh",
						overflow: "hidden"
					}}
				>
					{currentImage && (
						<ReactCrop
							crop={crop}
							onChange={(c: Crop) => setCrop(c)}
							onComplete={handleCropComplete}
							aspect={currentAspectRatio}
						>
							<img
								ref={imgRef}
								alt='Crop me'
								src={currentImage}
								style={{ maxWidth: "100%", maxHeight: "60vh" }}
								onLoad={onImageLoad}
							/>
						</ReactCrop>
					)}
				</div>
				<canvas
					ref={previewCanvasRef}
					style={{
						display: "none"
					}}
				/>
				<Flex justify='flex-end' style={{ width: "100%", marginTop: "20px" }}>
					<StyledButton
						variant='outline'
						color='dark'
						onClick={() => setCropModalOpen(false)}
						mr={16}
					>
						Cancel
					</StyledButton>
					<StyledButton color='green' onClick={applyCrop}>
						Apply Crop
					</StyledButton>
				</Flex>
			</Flex>
		</Modal>
	)

	// Main render
	return (
		<PageStructure
			title={isEdit ? "Edit Merchant" : "Add Merchant"}
			goBack={true}
			pageContent={
				<>
					{isEdit && merchantLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<AddEditMerchantContainer>
							<AddEditMerchantBody>
								<Grid gutter={40} h='100%'>
									<Grid.Col md={4}>{renderMerchantOverview()}</Grid.Col>
									<Grid.Col md={4}>{renderAddressSection()}</Grid.Col>
									<Grid.Col md={4}>
										{renderImageDropzone({
											title: "LOGO",
											height: 230,
											width: 230,
											loading: merchantImageLoading,
											uploadedImg: uploadedImage,
											onDropHandler: handleDrop
										})}
										{renderImageDropzone({
											title: "COVER IMAGE",
											height: 300,
											width: 675,
											loading: merchantCoverImageLoading,
											uploadedImg: uploadedCoverImage,
											onDropHandler: handleCoverDrop
										})}
									</Grid.Col>
								</Grid>
							</AddEditMerchantBody>
						</AddEditMerchantContainer>
					)}
					{renderCropModal()}
				</>
			}
			footerContent={
				<AddEditMerchantFooter>
					<StyledButton
						mr={16}
						variant='outline'
						color='dark'
						onClick={() => router.push(`/merchants`)}
					>
						Cancel
					</StyledButton>
					<StyledButton color='green' onClick={handleSave}>
						{isEdit ? "Save changes" : "Add merchant"}
					</StyledButton>
				</AddEditMerchantFooter>
			}
		/>
	)
}

export default AddEditMerchant
