import { useState, useEffect } from "react";
import { Search, Filter, MessageSquare, Clock, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ConversationWithMessages {
  id: string;
  title: string | null;
  created_at: string;
  firstUserMessage: string;
  lastAssistantMessage: string;
}

const StoredMessages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Get conversations with their messages
      const { data: convos, error } = await supabase
        .from("conversations")
        .select("id, title, created_at")
        .order("updated_at", { ascending: false });

      if (error || !convos) { setLoading(false); return; }

      const results: ConversationWithMessages[] = [];
      for (const conv of convos) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("role, content")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true });

        if (!msgs || msgs.length === 0) continue;

        const firstUser = msgs.find(m => m.role === "user");
        const lastAssistant = [...msgs].reverse().find(m => m.role === "assistant");

        if (firstUser && lastAssistant) {
          results.push({
            id: conv.id,
            title: conv.title,
            created_at: conv.created_at,
            firstUserMessage: firstUser.content,
            lastAssistantMessage: lastAssistant.content,
          });
        }
      }

      setConversations(results);
      setLoading(false);
    };

    fetchConversations();
  }, []);

  const filteredMessages = conversations.filter(msg =>
    msg.firstUserMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.lastAssistantMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (msg.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Stored Messages</h1>
          <p className="text-muted-foreground mt-1">View all your past conversations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Messages List */}
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <Card key={message.id} className="shadow-card card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground mt-1">{message.firstUserMessage}</h3>
                          <p className="text-muted-foreground mt-2 line-clamp-2">{message.lastAssistantMessage}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMessages.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                {searchQuery ? "No messages found" : "No conversations yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search query" : "Start a chat to see your messages here"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StoredMessages;
