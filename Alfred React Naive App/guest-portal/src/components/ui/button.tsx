import { Pressable } from "react-native";
import { Text } from "./text";
import { cn } from "@/src/lib/utils";
import { useTheme } from "@/src/context/theme-context";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onPress?: () => void;
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  onPress,
  className,
}: ButtonProps) {
  const { theme } = useTheme();

  const baseStyles = "px-6 py-3 rounded-lg active:opacity-80";

  const variantStyles = {
    primary: cn(
      theme === "dark"
        ? "bg-blue-500 active:bg-blue-600"
        : "bg-blue-600 active:bg-blue-700"
    ),
    secondary: cn(
      theme === "dark"
        ? "bg-gray-700 active:bg-gray-600"
        : "bg-gray-200 active:bg-gray-300"
    ),
  };

  const textColors = {
    primary: "text-white",
    secondary: theme === "dark" ? "text-gray-100" : "text-gray-800",
  };

  return (
    <Pressable
      onPress={onPress}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      <Text
        variant="body"
        className={cn("font-medium text-center", textColors[variant])}
      >
        {children}
      </Text>
    </Pressable>
  );
}
