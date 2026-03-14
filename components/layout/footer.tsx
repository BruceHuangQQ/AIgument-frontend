import Link from "next/link"
import { Github } from "lucide-react"
import { siteConfig } from "@/config/site"

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="mx-auto w-full max-w-screen-xl p-6 md:py-8">
        <hr className="my-6 text-muted-foreground sm:mx-auto lg:my-8" />
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>
            © {new Date().getFullYear()}{" "}
            <a
              target="_blank"
              href="https://github.com/BruceHuangQQ/AIgument-frontend"
              className="hover:underline"
            >
              Nullpoint - Unihack
            </a>
            . All Rights Reserved.
          </span>
          <Link
            href={siteConfig.url.author}
            target="_blank"
            rel="noreferrer"
            className="text-primary"
            aria-label="View project on GitHub"
          >
            <Github className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
