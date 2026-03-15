"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageDiv } from "@/components/message-div"
import { PopularTopics } from "@/components/popular-topics"
import { fetchNextMessage, type Message } from "@/lib/debate"

const ROUNDS = 3
const TURNS = ROUNDS * 2 // 6: for, against, for, against, for, against

function speakerLabel(speaker: "for" | "against"): string {
  return speaker === "for" ? "For" : "Against"
}

export default function HeroHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initialTopic = searchParams.get("topic") ?? ""
  const [topic, setTopic] = useState(initialTopic)
  const [submitted, setSubmitted] = useState(false)
  const [conversation, setConversation] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [debateEnded, setDebateEnded] = useState(false)
  const [currentSpeaker, setCurrentSpeaker] = useState<"for" | "against">("for")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const queryTopic = (searchParams.get("topic") ?? "").trim()
    if (!queryTopic) {
      setSubmitted(false)
      setTopic("")
      setConversation([])
      setDebateEnded(false)
      setCurrentSpeaker("for")
    }
  }, [searchParams])

  // Auto-scroll to bottom as messages come in
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation, loading])

  const sendNext = async (t: string, speaker: "for" | "against", history: Message[]) => {
    setCurrentSpeaker(speaker)
    setLoading(true)
    try {
      const message = await fetchNextMessage(t, speaker, history)
      const updated: Message[] = [...history, { speaker, message }]
      setConversation(updated)

      if (updated.length >= TURNS) {
        setDebateEnded(true)
      } else {
        const nextSpeaker = speaker === "for" ? "against" : "for"
        await sendNext(t, nextSpeaker, updated)
      }
    } finally {
      setLoading(false)
    }
  }

  const startDebate = async (topicText: string) => {
    const trimmed = topicText.trim()
    if (!trimmed) return

    setTopic(trimmed)
    const params = new URLSearchParams(searchParams.toString())
    params.set("topic", trimmed)
    router.push(`${pathname}?${params.toString()}`)

    setSubmitted(true)
    setConversation([])
    setDebateEnded(false)
    setCurrentSpeaker("for")
    await sendNext(trimmed, "for", [])
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await startDebate(topic)
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
          <PopularTopics onSelectTopic={startDebate} />
        </div>
      )}

      {submitted && hasTopic && (
        <div className="flex w-full flex-1 items-stretch justify-center">
          <div className="flex h-full max-h-[60vh] w-full max-w-3xl flex-col items-stretch gap-2 overflow-y-auto text-left">
            {conversation.map((item, index) => (
              <MessageDiv
                key={`${item.speaker}-${index}`}
                speaker={speakerLabel(item.speaker)}
                message={item.message}
              />
            ))}
            {loading && (
              <MessageDiv
                speaker={speakerLabel(currentSpeaker)}
                message=""
                loadingStatus={true}
              />
            )}
            {debateEnded && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                — Debate ended —
              </p>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </section>
  )
}