"use client"

import { FormEvent, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageDiv } from "@/components/message-div"

type DebateMessage = { speaker: string; message: string }

export default function HeroHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initialTopic = searchParams.get("topic") ?? ""
  const [topic, setTopic] = useState(initialTopic)
  const [submitted, setSubmitted] = useState(false)
  const [messages, setMessages] = useState<DebateMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const queryTopic = (searchParams.get("topic") ?? "").trim()
    if (!queryTopic) {
      setSubmitted(false)
      setTopic("")
      setMessages([])
      setError(null)
    }
  }, [searchParams])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = topic.trim()
    if (!trimmed) return

    const params = new URLSearchParams(searchParams.toString())
    params.set("topic", trimmed)
    router.push(`${pathname}?${params.toString()}`)
    setSubmitted(true)
    setLoading(true)
    setError(null)
    setMessages([])

    try {
      const res = await fetch("http://localhost:8000/debate/both", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stance: trimmed,
          core_argument: `The topic "${trimmed}" is worth debating seriously.`,
          evidence_bullets: "- Use your general knowledge to support your position.",
          messages: [{ role: "user", content: `Make your opening argument about: ${trimmed}` }],
        }),
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const data = await res.json()
      setMessages([
        { speaker: "For", message: data.for },
        { speaker: "Against", message: data.against },
      ])
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  const hasTopic = topic.trim().length > 0

  return (
    <section className="container flex min-h-[60vh] flex-col items-center justify-center pt-10 text-center">
      {!submitted && (
        <div className="flex w-full flex-1 flex-col items-center gap-6 lg:gap-8 pb-12 pt-10">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Watch AI Debate Anything.
            </h1>
            <p className="text-sm font-light text-muted-foreground sm:text-base lg:text-lg">
              Type a topic and watch two AIs argue it out, point by point.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="w-full max-w-xl" aria-label="Start an AI debate">
            <div className="flex items-stretch rounded-full bg-background shadow-sm ring-1 ring-border">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
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
        <div className="flex w-full flex-1 items-stretch justify-center">
          <div className="flex h-full max-h-[60vh] w-full max-w-2xl flex-col items-stretch gap-2 overflow-y-auto text-left">
            {loading && (
              <p className="text-center text-sm text-muted-foreground animate-pulse">
                Generating debate...
              </p>
            )}
            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}
            {messages.map((item, index) => (
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