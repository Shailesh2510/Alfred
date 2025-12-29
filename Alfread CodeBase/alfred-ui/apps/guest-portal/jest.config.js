/** @type {import('ts-jest').JestConfigWithTsJest} **/

module.exports = {
	testEnvironment: "node",
	transform: {
		"^.+.tsx?$": ["ts-jest", {}]
	},
	moduleNameMapper: {
		"@/shared-constants": "<rootDir>/../../shared/ui/shared-constants"
	}
}