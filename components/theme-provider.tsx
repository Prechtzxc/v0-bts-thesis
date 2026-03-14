"use client"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="light" 
      disableTransitionOnChange 
      suppressHydrationWarning
      storageKey="bts-theme"
      enableSystem={false}
      enableColorScheme={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
