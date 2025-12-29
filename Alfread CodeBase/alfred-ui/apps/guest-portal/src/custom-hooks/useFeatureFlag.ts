const useFeatureFlag = (featureFlagObject: any) => {
	const getFeatureFlag = (featureFlagKey: string) => {
		if (featureFlagObject?.[featureFlagKey]?.enabled) {
			return featureFlagObject[featureFlagKey].value
		}
		return false
	}

	return { getFeatureFlag }
}

export default useFeatureFlag
