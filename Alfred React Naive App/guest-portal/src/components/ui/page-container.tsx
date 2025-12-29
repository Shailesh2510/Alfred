import { Platform, View } from "react-native";
import { cn } from "@/src/lib/utils";
import { useTheme } from "@/src/context/theme-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn(
        "flex-1",
        theme === "dark" ? "bg-gray-900" : "bg-white",
        className
      )}
      style={{
        paddingTop: Platform.OS === "ios" ? insets.top : 0,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {children}
    </View>
  );
}
