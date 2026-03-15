export type Message = {
  speaker: "for" | "against"
  message: string
}

const BACKEND_URL = "http://127.0.0.1:8000/message/"

export async function fetchNextMessage(
  topic: string,
  speaker: "for" | "against",
  conversation: Message[]
): Promise<string> {
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, speaker, conversation }),
  })
  const data = await response.json()
  return data.message
}