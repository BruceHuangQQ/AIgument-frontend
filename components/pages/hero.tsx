"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageDiv } from "@/components/message-div"

const DEBATE_ROUNDS = 3
/** How long to show the second message's loading state after the first is revealed */
const SECOND_LOADING_DURATION_MS = 400

type ApiMessage = { role: string; content: string }
type DebateMessage = { speaker: string; message: string; loading?: boolean }

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

  const apiMessagesRef = useRef<ApiMessage[]>([])
  const loadingPlaceholderTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const queryTopic = (searchParams.get("topic") ?? "").trim()
    if (!queryTopic) {
      setSubmitted(false)
      setTopic("")
      setMessages([])
      setError(null)
    }
  }, [searchParams])

  useEffect(() => {
    return () => {
      loadingPlaceholderTimeoutsRef.current.forEach(clearTimeout)
      loadingPlaceholderTimeoutsRef.current = []
    }
  }, [])

  const runRound = async (trimmed: string, round: number) => {
    const body = {
      stance: trimmed,
      core_argument: `The topic "${trimmed}" is worth debating seriously.`,
      evidence_bullets: "- Use your general knowledge to support your position.",
      messages: [...apiMessagesRef.current],
    }

    setMessages((prev) => [...prev, { speaker: "For", message: "", loading: true }])

    let res: Response
    try {
      res = await fetch("http://localhost:8000/debate/both", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    } catch (err: any) {
      setMessages((prev) => prev.slice(0, -1))
      setError(err.message ?? "Something went wrong. Is the backend running?")
      setLoading(false)
      return
    }

    if (!res.ok) {
      setMessages((prev) => prev.slice(0, -1))
      setError(`Server error: ${res.status}`)
      setLoading(false)
      return
    }

    const data = await res.json()
    apiMessagesRef.current.push(
      { role: "assistant", content: data.for },
      { role: "assistant", content: data.against }
    )

    setMessages((prev) => [
      ...prev.slice(0, -1),
      { speaker: "For", message: data.for },
      { speaker: "Against", message: "", loading: true },
    ])

    const t = setTimeout(() => {
      loadingPlaceholderTimeoutsRef.current = loadingPlaceholderTimeoutsRef.current.filter((id) => id !== t)
      setMessages((prev) => {
        let idx = -1
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].speaker === "Against" && prev[i].loading) {
            idx = i
            break
          }
        }
        if (idx < 0) return prev
        return prev.map((m, i) => (i === idx ? { ...m, message: data.against, loading: false } : m))
      })
    }, SECOND_LOADING_DURATION_MS)
    loadingPlaceholderTimeoutsRef.current.push(t)

    if (round < DEBATE_ROUNDS) {
      const continuePrompt =
        round === DEBATE_ROUNDS - 1
          ? "Give your final rebuttals."
          : "Continue the debate with your rebuttals."
      apiMessagesRef.current.push({ role: "user", content: continuePrompt })
      runRound(trimmed, round + 1)
    } else {
      setLoading(false)
    }
  }

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

    apiMessagesRef.current = [
      { role: "user", content: `Make your opening argument about: ${trimmed}` },
    ]
    runRound(trimmed, 1)
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
                loadingStatus={item.loading === true}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}