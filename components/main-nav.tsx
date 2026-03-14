"use client"
import { usePathname } from "next/navigation"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden flex-col md:flex">
      {/* Navigation items */}
    </div>
  )
}
