"use client"
import { useEffect } from "react"
import { useTheme } from "next-themes"

export default function ClientThemeSync() {
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    const html = document.documentElement
    const isDark = theme === "dark" || (theme === "system" && resolvedTheme === "dark")
    html.classList.toggle("dark", !!isDark)
  }, [theme, resolvedTheme])

  return null
}