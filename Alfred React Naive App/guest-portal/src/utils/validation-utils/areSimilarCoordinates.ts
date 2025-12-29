const DEFAULT_EPSILON = 0.0001

const areSimilarCoordinates = (
	coord1: { x: number; y: number } | undefined,
	coord2: { x: number; y: number } | undefined,
	epsilon = DEFAULT_EPSILON
): boolean => {
	if (!coord1 || !coord2) {
		return false
	}

	const value =
		Math.abs(coord1.x - coord2.x) < epsilon &&
		Math.abs(coord1.y - coord2.y) < epsilon
	return value
}

export default areSimilarCoordinates
