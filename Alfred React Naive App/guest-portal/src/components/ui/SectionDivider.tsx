import { View } from 'react-native'

interface SectionDividerProperties {
	color?: string
}
export const SectionDivider: React.FC<SectionDividerProperties> = ({
	color = 'gray-100'
}) => <View className={`border-b border-${color}`} />
