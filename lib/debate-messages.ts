export type DebateMessage = {
  speaker: "For" | "Against"
  message: string
}

export const defaultDebateMessages: DebateMessage[] = [
  {
    speaker: "For",
    message:
      "I believe there are strong benefits to exploring this topic with an open mind, especially considering the potential for innovation and new perspectives.",
  },
  {
    speaker: "Against",
    message:
      "While that sounds appealing, we should be cautious—there are significant trade-offs and unintended consequences that are often overlooked in the initial excitement.",
  },
  {
    speaker: "For",
    message:
      "Those trade-offs are real, but many of them can be mitigated with thoughtful safeguards and clear guidelines around how this is implemented in practice.",
  },
  {
    speaker: "Against",
    message:
      "Safeguards help, but they are rarely perfect. History shows that systems like this can drift from their original intent, creating risks we are not prepared for.",
  },
]

