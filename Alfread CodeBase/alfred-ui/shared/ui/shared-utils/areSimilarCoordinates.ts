const areSimilarCoordinates = (
  coord1: { x: number; y: number } | undefined,
  coord2: { x: number; y: number } | undefined,
  epsilon: number = 0.0001,
) => {
  if (!coord1 || !coord2) {
    return false;
  }

  const value = Math.abs(coord1.x - coord2.x) < epsilon && Math.abs(coord1.y - coord2.y) < epsilon;
  return value;
};

export default areSimilarCoordinates;
