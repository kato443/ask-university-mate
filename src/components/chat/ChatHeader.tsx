import { Bot, Sparkles } from "lucide-react";

export const ChatHeader = () => {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-border">
      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
        <Bot className="w-6 h-6 text-primary-foreground" />
      </div>
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">BBUC Assistant</h1>
        <p className="text-sm text-muted-foreground">Ask me anything about the university</p>
      </div>
      <div className="ml-auto flex items-center gap-2 text-sm text-accent">
        <Sparkles className="w-4 h-4" />
        <span>AI-Powered</span>
      </div>
    </div>
  );
};
