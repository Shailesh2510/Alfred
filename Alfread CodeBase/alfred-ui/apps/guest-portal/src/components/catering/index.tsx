import React, { useMemo, useState } from "react"
import {
	WelcomeLabel,
	WelcomePageContainer,
	WelcomeSubText
} from "./index.style"
import { Flex } from "@mantine/core"
import {
	StyledButton,
	StyledNumberInput,
	StyledAutoComplete
} from "@/design-components"
import useHotels from "@/hooks/hotel/useHotels"
import { map, uniqBy } from "lodash"
import { useRouter } from "next/router"
import { cartActionTypes } from "../order-page/reducers/cartReducerts"

const Catering = ({ dispatchCart }: any) => {
	const router = useRouter()
	const [numberOfPeople, setNumberOfPeople] = useState<number>(0)
	const [hotelName, setHotelName] = useState<string>("")

	const { data: hotels } = useHotels()

	const hotelOptions = useMemo(
		() =>
			map(uniqBy(hotels, "webCode"), hotel => ({
				label: hotel?.name,
				value: hotel?.name
			})),
		[hotels]
	)

	const setHotelWebCode = (hotelName: string) => {
		const webCode = hotels?.find(hotel => hotel?.name === hotelName)?.webCode
		return webCode
	}

	const hotelWebCode = setHotelWebCode(hotelName)

	const navigateToMenu = () => {
		dispatchCart({
			type: cartActionTypes.SET_NUMBER_OF_CUTLERIES,
			numberOfCutleries: numberOfPeople
		})
		router.push(`/catering/${hotelWebCode}`)
	}

	return (
		<WelcomePageContainer>
			<Flex direction='column' rowGap={12}>
				<WelcomeLabel>Welcome to Alfred - Catering!</WelcomeLabel>
				<Flex direction={"column"} gap={"md"}>
					<WelcomeSubText>
						Please select the hotel you would like to order for:
					</WelcomeSubText>
					<StyledAutoComplete
						required
						label='Hotel'
						width={400}
						value={hotelName}
						placeholder='Start typing...'
						data={hotelOptions}
						onChange={(value: any) => setHotelName(value)}
						limit={4}
						filter={(value: string, option: any) =>
							value.length > 2 &&
							option.label.toLowerCase().includes(value.toLowerCase())
						}
					/>
					<StyledNumberInput
						required
						label='Estimated number of people attending the event'
						value={numberOfPeople}
						placeHolder={`Number of people`}
						onChange={(quantity: number) => {
							if (quantity > 0) {
								setNumberOfPeople(quantity)
							}
						}}
						onKeyDown={(event: any) => {
							if (
								!/[0-9]/.test(event.key) &&
								event.key !== "Backspace" &&
								event.key !== "Delete"
							) {
								event.preventDefault()
							}
						}}
					/>
					<StyledButton
						disabled={!hotelName || numberOfPeople < 1}
						onClick={navigateToMenu}
					>
						View menu
					</StyledButton>
				</Flex>
			</Flex>
		</WelcomePageContainer>
	)
}

export default Catering
