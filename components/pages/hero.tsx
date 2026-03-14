"use client"

import { FormEvent, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageDiv } from "@/components/message-div"
import { defaultDebateMessages } from "@/lib/debate-messages"

export default function HeroHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initialTopic = searchParams.get("topic") ?? ""
  const [topic, setTopic] = useState(initialTopic)
  const [submitted, setSubmitted] = useState(false)

  // Reset to initial state (no submitted topic) whenever the topic
  // query parameter is cleared, e.g. by clicking the navbar logo.
  useEffect(() => {
    const queryTopic = (searchParams.get("topic") ?? "").trim()
    if (!queryTopic) {
      setSubmitted(false)
      setTopic("")
    }
  }, [searchParams])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = topic.trim()
    if (!trimmed) return

    const params = new URLSearchParams(searchParams.toString())
    params.set("topic", trimmed)

    router.push(`${pathname}?${params.toString()}`)
    setSubmitted(true)
  }

  const hasTopic = topic.trim().length > 0

  return (
    <section className="container flex min-h-[60vh] flex-col items-center justify-center pb-12 pt-10 text-center lg:pt-20">
      {!submitted && (
        <div className="flex w-full flex-1 flex-col items-center gap-6 lg:gap-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Watch AI Debate Anything.
            </h1>
            <p className="text-sm font-light text-muted-foreground sm:text-base lg:text-lg">
              Type a topic and watch two AIs argue it out, point by point.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl"
            aria-label="Start an AI debate"
          >
            <div className="flex items-stretch rounded-full bg-background shadow-sm ring-1 ring-border">
              <Input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Start debating"
                className="h-12 flex-1 rounded-l-full rounded-r-none border-0 bg-transparent px-5 text-sm sm:text-base focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                type="submit"
                className="h-12 rounded-l-none text-white rounded-r-full px-5 text-sm sm:px-6 sm:text-base"
              >
                →
              </Button>
            </div>
          </form>
        </div>
      )}

      {submitted && hasTopic && (
        <div className="flex w-full flex-1 flex-col items-center gap-6 lg:gap-8">

          <div className="flex w-full max-w-3xl flex-col items-stretch gap-2 text-left">
            {defaultDebateMessages.map((item, index) => (
              <MessageDiv
                key={`${item.speaker}-${index}`}
                speaker={item.speaker}
                message={item.message}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
