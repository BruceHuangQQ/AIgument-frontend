"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { siteConfig } from "@/config/site"
import { settings } from "@/config/settings"

export default function Navbar() {
  const searchParams = useSearchParams()
  const topic = (searchParams.get("topic") ?? "").trim()

  return (
    <header className="select-none border-b sticky top-0 z-50 bg-background">
      <nav className="mx-auto flex items-center justify-between px-4 py-3 md:px-8 md:py-5 lg:max-w-7xl">
        <Link href="/">
          <h1 className="text-2xl font-bold duration-200 lg:hover:scale-[1.10]">
            {siteConfig.name}
          </h1>
        </Link>
        <div className="flex flex-1 items-center justify-center px-4" style={{ maxWidth: "36rem" }}>
          {topic && (
            <div className="rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground md:text-base">
              {topic}
            </div>
          )}
        </div>
        {settings.themeToggleEnabled ? (
          <ModeToggle />
        ) : (
          <div className="w-10" />
        )}
      </nav>
    </header>
  )
}
