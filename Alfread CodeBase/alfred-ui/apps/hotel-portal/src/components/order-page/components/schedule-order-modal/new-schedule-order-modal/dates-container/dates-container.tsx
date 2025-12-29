import React, { useState, useEffect } from "react"
import { Card, Grid, Radio } from "@mantine/core"
import dayjs, { Dayjs } from "dayjs"
import { isSameDay } from "date-fns"
import { DatesContainerNew } from "../../new-schedule-order-modal/schedule-order-modal.style"
import { NoDatesLabel } from "./dates-container.style"

type DatesContainerProps = {
	selectedDate: Dayjs | null
	// eslint-disable-next-line no-unused-vars
	setSelectedDate: (date: Dayjs | null) => void
	timeOptions: string[]
	isSmallScreen: boolean
	selectedTime: any
	setSelectedTime: any
}

const DatesContainer = ({
	selectedDate,
	setSelectedDate,
	timeOptions,
	isSmallScreen,
	selectedTime,
	setSelectedTime
}: DatesContainerProps) => {
	const [dates, setDates] = useState<Dayjs[]>([])

	const generateDates = () => {
		const today = dayjs()
		const nextTwoWeeks: Dayjs[] = []

		for (let i = 0; i < 14; i++) {
			const date = today.add(i, "day")
			nextTwoWeeks.push(date)
		}
		return nextTwoWeeks
	}

	useEffect(() => {
		setDates(generateDates())
	}, [])

	const handleDateClick = (date: Dayjs) => {
		setSelectedDate(date)
		setSelectedTime("")
	}
	const handleTimeSelect = (value: string) => {
		setSelectedTime(value)
	}

	const getLabel = (date: Dayjs, index: number) => {
		if (index === 0) {
			return "Today"
		}
		if (index === 1) {
			return "Tomorrow"
		}
		return date.format("dddd")
	}

	return (
		<>
			<DatesContainerNew>
				{dates.map((date, index) => (
					<Card
						key={date.format("MM-DD-YYYY")}
						onClick={() => handleDateClick(date)}
						sx={theme => ({
							padding: "0 10px !important",
							height: "3.75rem",
							display: "flex",
							minWidth: "7rem",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
							borderRadius: "0.5rem",
							textAlign: "center",
							cursor: "pointer",
							border:
								selectedDate && isSameDay(selectedDate.toDate(), date.toDate())
									? "2px solid #000"
									: "1px solid #ddd",
							backgroundColor:
								selectedDate && isSameDay(selectedDate.toDate(), date.toDate())
									? theme.colors.dark[6]
									: theme.white,
							color:
								selectedDate && isSameDay(selectedDate.toDate(), date.toDate())
									? theme.white
									: theme.black,
							"&:hover": {
								backgroundColor:
									selectedDate &&
									isSameDay(selectedDate.toDate(), date.toDate())
										? theme.colors.dark[7]
										: theme.colors.gray[0]
							}
						})}
						variant={
							selectedDate && isSameDay(selectedDate.toDate(), date.toDate())
								? "filled"
								: "outline"
						}
					>
						<span>{getLabel(date, index)}</span>
						<span>{date.format("MMM D")}</span>
					</Card>
				))}
			</DatesContainerNew>
			{selectedDate && timeOptions.length > 0 ? (
				<Radio.Group value={selectedTime} onChange={handleTimeSelect} mt={12}>
					<Grid>
						{timeOptions.map((option, index) => (
							<Grid.Col span={isSmallScreen ? 12 : 6} key={index}>
								<Radio value={option} label={option} />
							</Grid.Col>
						))}
					</Grid>
				</Radio.Group>
			) : (
				<NoDatesLabel>
					{selectedDate === null
						? `Please select a date.`
						: `No available times for this date.`}
				</NoDatesLabel>
			)}
		</>
	)
}

export default DatesContainer
