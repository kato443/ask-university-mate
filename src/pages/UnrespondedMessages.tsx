import { useState, useEffect } from "react";
import { MessageCircle, Clock, Send, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface UnrespondedMessage {
  id: string;
  content: string;
  created_at: string;
  conversation_id: string;
}

const UnrespondedMessages = () => {
  const { toast } = useToast();
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [messages, setMessages] = useState<UnrespondedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  const fetchUnresponded = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("messages")
      .select("id, content, created_at, conversation_id")
      .eq("role", "user")
      .eq("is_responded", false)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUnresponded();

    // Realtime subscription for new unresponded messages
    const channel = supabase
      .channel("unresponded-messages")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "messages",
      }, () => {
        fetchUnresponded();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleRespond = async (message: UnrespondedMessage) => {
    const responseText = responses[message.id]?.trim();
    if (!responseText) {
      toast({
        title: "Response required",
        description: "Please enter a response before sending.",
        variant: "destructive",
      });
      return;
    }

    setSending(message.id);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSending(null); return; }

    // Insert the assistant response
    const { error: insertError } = await supabase.from("messages").insert({
      conversation_id: message.conversation_id,
      user_id: user.id,
      role: "assistant",
      content: responseText,
      is_responded: true,
    });

    if (insertError) {
      toast({ title: "Error", description: "Failed to send response.", variant: "destructive" });
      setSending(null);
      return;
    }

    // Mark the original message as responded
    await supabase
      .from("messages")
      .update({ is_responded: true })
      .eq("id", message.id);

    toast({
      title: "Response sent!",
      description: "Your message has been delivered successfully.",
    });

    setResponses(prev => ({ ...prev, [message.id]: "" }));
    setMessages(prev => prev.filter(m => m.id !== message.id));
    setSending(null);
  };

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Unresponded Messages</h1>
          <p className="text-muted-foreground mt-1">Messages awaiting your response</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10">
          <AlertCircle className="w-5 h-5 text-accent" />
          <span className="font-medium text-accent">{messages.length} pending</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="space-y-6">
            {messages.map((message) => (
              <Card key={message.id} className="shadow-card overflow-hidden">
                <CardContent className="p-0">
                  {/* Message Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground font-medium">{message.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Response Area */}
                  <div className="p-6 bg-muted/30">
                    <Textarea
                      placeholder="Type your response here..."
                      value={responses[message.id] || ""}
                      onChange={(e) => setResponses(prev => ({ ...prev, [message.id]: e.target.value }))}
                      className="min-h-[100px] bg-background"
                    />
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="accent"
                        onClick={() => handleRespond(message)}
                        disabled={sending === message.id}
                      >
                        {sending === message.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send Response
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {messages.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">All caught up!</h3>
              <p className="text-muted-foreground">No messages need your response right now</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UnrespondedMessages;
