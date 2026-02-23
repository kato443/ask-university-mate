import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import type { Message } from "@/hooks/useChat";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex gap-3",
        message.role === "user" && "flex-row-reverse"
      )}
    >
      <Avatar className={cn(
        "w-9 h-9 shrink-0",
        message.role === "assistant" ? "bg-primary" : "bg-accent"
      )}>
        <AvatarFallback className={cn(
          message.role === "assistant"
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground"
        )}>
          {message.role === "assistant" ? (
            <Bot className="w-5 h-5" />
          ) : (
            <User className="w-5 h-5" />
          )}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          message.role === "assistant"
            ? "bg-muted text-foreground rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm"
        )}
      >
        <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        <p className={cn(
          "text-xs mt-2 opacity-70",
          message.role === "user" && "text-right"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' })}
        </p>
      </div>
    </div>
  );
};
