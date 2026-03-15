// components/message_div.tsx
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import TypewriterText from "@/components/smoothui/typewriter-text";

interface MessageDivProps {
  speaker: string;
  message: string;
  loadingStatus?: boolean;
  onType?: () => void;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-6 py-5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2.5 h-2.5 bg-muted-foreground rounded-full opacity-70 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </div>
  );
}

export function MessageDiv({ speaker, message, loadingStatus, onType}: MessageDivProps) {
  const isFor = speaker === "For";
  const avatarSrc = isFor ? "/for.png" : "/against.png";
  const avatarAlt = isFor ? "For side avatar" : "Against side avatar";

  return (
    <div className="flex items-start gap-3 w-full px-4 py-2">
      <Avatar className="mt-6 shrink-0">
        <AvatarImage src={avatarSrc} alt={avatarAlt} />
        <AvatarFallback className="bg-gray-200 text-gray-500">
          {speaker.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-medium text-primary text-left px-2">{speaker}</span>

        <Card className="min-w-0 max-w-[50vw] overflow-hidden rounded-3xl border-none bg-accent shadow-none w-full">
          {loadingStatus ? (
            <TypingIndicator />
          ) : (
            <TypewriterText loop={false} speed={10} className="break-words overflow-hidden px-6 py-5 text-left text-sm leading-relaxed text-card-foreground" onType={onType}>
                {message}
            </TypewriterText>
          )}
        </Card>
      </div>
    </div>
  );
}