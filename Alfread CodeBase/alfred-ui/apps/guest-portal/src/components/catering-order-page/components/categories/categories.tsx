/* eslint-disable no-unused-vars */
import React, { useState } from "react"
import { CategoriesContainer } from "./categories.styles"
import { useMediaQuery } from "@mantine/hooks"
import { Card } from "@mantine/core"
import { capitalize } from "lodash"

interface CategoriesProps {
	categoryNames: string[]
	onCategoryClick: (categoryName: string) => void
}

const Categories: React.FC<CategoriesProps> = ({
	categoryNames,
	onCategoryClick
}) => {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
	const isSmallScreen = useMediaQuery("(max-width: 600px)")

	const handleCategoryClick = (categoryName: string) => {
		setSelectedCategory(categoryName)
		onCategoryClick(categoryName) // Trigger scroll to the corresponding section
	}

	return (
		<CategoriesContainer isScrollable={isSmallScreen}>
			{categoryNames.map(categoryName => (
				<Card
					key={categoryName}
					onClick={() => handleCategoryClick(categoryName)}
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
									: theme.colors.gray[0]
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
