import React, { createContext, useContext, useState } from "react";
import { lightTheme, darkTheme } from "@/src/lib/theme";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof lightTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>("light");

  // TODO: Uncomment when we have the dark mode setup
  // useEffect(() => {
  //   setTheme(systemColorScheme || "light");
  // }, [systemColorScheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const colors = theme === "light" ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
