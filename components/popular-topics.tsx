"use client"

import { useState, useEffect } from "react"
import popularTopics from "@/data/popular-topics.json"

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

const allTopics = popularTopics as string[]

type PopularTopicsProps = {
  onSelectTopic: (topic: string) => void
}

export function PopularTopics({ onSelectTopic }: PopularTopicsProps) {
  const [topics, setTopics] = useState<string[]>([])

  useEffect(() => {
    setTopics(pickRandom(allTopics, 5))
  }, [])

  return (
    <div className="w-full max-w-xl space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        What&apos;s popular
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {topics.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onSelectTopic(t)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}
