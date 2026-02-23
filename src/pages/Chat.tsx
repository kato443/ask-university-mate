import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/useChat";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { SuggestedQuestions } from "@/components/chat/SuggestedQuestions";

const Chat = () => {
  const { messages, isLoading, sendMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] pt-12 lg:pt-0">
      <ChatHeader />

      <ScrollArea className="flex-1 py-4" ref={scrollRef}>
        <div className="space-y-6 pr-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <TypingIndicator />
          )}
        </div>
      </ScrollArea>

      {messages.length === 1 && (
        <SuggestedQuestions onSelect={handleSuggestedQuestion} />
      )}

      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
};

export default Chat;
