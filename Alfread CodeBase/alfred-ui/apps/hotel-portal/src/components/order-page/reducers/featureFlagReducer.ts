type initialFeatureFlagReducer = {
	featureFlags: any
}

export const initialFeatureFlagState: initialFeatureFlagReducer = {
	featureFlags: {}
}

export const featureFlagActionTypes = {
	SET_FEATURE_FLAGS: "SET_FEATURE_FLAGS",
	RESET_FEATURE_FLAGS: "RESET_FEATURE_FLAGS"
}

const featureFlagReducer = (state: any, action: any) => {
	switch (action.type) {
		case featureFlagActionTypes.SET_FEATURE_FLAGS:
			return { ...state, featureFlags: action.featureFlags }
		case featureFlagActionTypes.RESET_FEATURE_FLAGS:
			return { ...state, featureFlags: initialFeatureFlagState.featureFlags }
		default:
			return state
	}
}

export default featureFlagReducer
