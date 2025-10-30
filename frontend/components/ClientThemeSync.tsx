"use client"
import { useEffect } from "react"
import { useTheme } from "next-themes"

export default function ClientThemeSync() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setTheme("light")
  }, [])

  useEffect(() => {
    const html = document.documentElement
    const isDark = theme === "dark"
    html.classList.toggle("dark", !!isDark)
  }, [theme])

  return null
}