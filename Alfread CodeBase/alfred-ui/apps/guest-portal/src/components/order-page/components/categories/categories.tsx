/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react"
import { CategoriesContainer } from "./categories.styles"
import { useMediaQuery } from "@mantine/hooks"
import { Card } from "@mantine/core"
import { capitalize } from "lodash"

interface CategoriesProps {
	categoryNames: string[]
	onCategoryClick: (categoryName: string) => void
	activeCategory: string | null
}

const Categories: React.FC<CategoriesProps> = (properties: CategoriesProps) => {
	const { categoryNames, onCategoryClick, activeCategory } = properties
	const [selectedCategory, setSelectedCategory] = useState<string | null>(
		activeCategory
	)
	const isSmallScreen = useMediaQuery("(max-width: 600px)")

	const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
	const containerRef = useRef<HTMLDivElement | null>(null)

	const handleCategoryClick = (categoryName: string) => {
		setSelectedCategory(categoryName)
		onCategoryClick(categoryName)
	}

	useEffect(() => {
		setSelectedCategory(activeCategory)

		const timeout = setTimeout(() => {
			if (
				activeCategory &&
				categoryRefs.current[activeCategory] &&
				containerRef.current
			) {
				const card = categoryRefs.current[activeCategory]
				const container = containerRef.current

				const cardOffsetLeft = card?.offsetLeft ?? 0
				const cardWidth = card?.offsetWidth ?? 0
				const containerWidth = container.offsetWidth

				const scrollPosition =
					cardOffsetLeft - containerWidth / 2 + cardWidth / 2
				container.scrollTo({
					left: scrollPosition,
					behavior: "smooth"
				})
			}
		}, 200)

		return () => clearTimeout(timeout)
	}, [activeCategory])

	return (
		<CategoriesContainer ref={containerRef} isScrollable={isSmallScreen}>
			{categoryNames.map(categoryName => (
				<Card
					key={categoryName}
					onClick={() => handleCategoryClick(categoryName)}
					ref={el => (categoryRefs.current[categoryName] = el)}
					sx={theme => ({
						padding: "0 10px !important",
						minWidth: isSmallScreen ? "6.25rem" : "5rem",
						height: "3.75rem",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						borderRadius: "0.5rem",
						textAlign: "center",
						cursor: "pointer",
						border:
							selectedCategory === categoryName
								? "2px solid #000"
								: "1px solid #ddd",
						backgroundColor:
							selectedCategory === categoryName
								? theme.colors.dark[6]
								: theme.white,
						color:
							selectedCategory === categoryName ? theme.white : theme.black,
						"&:hover": {
							backgroundColor:
								selectedCategory === categoryName
									? theme.colors.dark[7]
									: theme.colors.white
						}
					})}
					variant={selectedCategory === categoryName ? "filled" : "outline"}
				>
					{capitalize(categoryName)}
				</Card>
			))}
		</CategoriesContainer>
	)
}

export default Categories
