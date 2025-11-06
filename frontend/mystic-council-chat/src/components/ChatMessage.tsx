import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/#+\s?(.*)/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .trim();
}

const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  const cleanMessage = stripMarkdown(message);
  return (
    <div
      className={cn(
        "flex w-full animate-slide-up mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-xl p-5",
          isUser
            ? "player-bubble"
            : "arcane-bubble"
        )}
      >
        <div className="flex items-start gap-3">
          {!isUser && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-700/30 flex items-center justify-center shrink-0 glow-purple border border-purple-500/30">
              <span className="text-purple-200 text-sm font-cinzel font-bold">⚡</span>
            </div>
          )}
          <div className="flex-1">
            <p className={cn(
              "leading-relaxed whitespace-pre-wrap break-words",
              isUser ? "text-emerald-50 font-medium" : "text-purple-50"
            )}>
              {cleanMessage}
            </p>
            {timestamp && (
              <span className={cn(
                "text-xs mt-2 block",
                isUser ? "text-emerald-300/70" : "text-purple-300/70"
              )}>
                {timestamp}
              </span>
            )}
          </div>
          {isUser && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/40 to-emerald-700/40 flex items-center justify-center shrink-0 glow-emerald border border-emerald-500/40">
              <span className="text-emerald-200 text-xs font-bold">YOU</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;