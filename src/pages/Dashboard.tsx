import { useState, useEffect } from "react";
import { MessageSquare, Inbox, Clock, TrendingUp, GraduationCap, BookOpen, Users, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const [totalMessages, setTotalMessages] = useState(0);
  const [storedCount, setStoredCount] = useState(0);
  const [unrespondedCount, setUnrespondedCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count: total } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("role", "user");

      const { count: responded } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("role", "user")
        .eq("is_responded", true);

      const { count: unresponded } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("role", "user")
        .eq("is_responded", false);

      setTotalMessages(total || 0);
      setStoredCount(responded || 0);
      setUnrespondedCount(unresponded || 0);

      const responseRate = total ? Math.round(((responded || 0) / total) * 100) : 100;

      // Fetch recent messages
      const { data: recent } = await supabase
        .from("messages")
        .select("id, content, created_at, is_responded")
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recent) {
        setRecentMessages(recent.map(m => ({
          id: m.id,
          preview: m.content,
          time: formatDistanceToNow(new Date(m.created_at), { addSuffix: true }),
          status: m.is_responded ? "responded" : "unresponded",
        })));
      }
    };

    fetchStats();
  }, []);

  const responseRate = totalMessages > 0 ? Math.round((storedCount / totalMessages) * 100) : 100;

  const stats = [
    { icon: MessageSquare, label: "Total Messages", value: totalMessages.toString() },
    { icon: Inbox, label: "Responded", value: storedCount.toString() },
    { icon: Clock, label: "Unresponded", value: unrespondedCount.toString() },
    { icon: TrendingUp, label: "Response Rate", value: `${responseRate}%` },
  ];

  const quickLinks = [
    { icon: GraduationCap, label: "Programs", description: "Explore our courses" },
    { icon: BookOpen, label: "Library", description: "Access resources" },
    { icon: Users, label: "Student Services", description: "Get support" },
    { icon: Building, label: "Campus Facilities", description: "Find locations" },
  ];

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Welcome to BBUC</h1>
        <p className="text-muted-foreground mt-1">Your student information dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card card-hover">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-display font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>
              <div className="mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <Card key={index} className="shadow-card card-hover cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <link.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{link.label}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Messages */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-xl">Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMessages.map((message) => (
              <div 
                key={message.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <p className="text-foreground font-medium truncate max-w-md">{message.preview}</p>
                  <p className="text-sm text-muted-foreground mt-1">{message.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  message.status === "unresponded" 
                    ? "bg-accent/20 text-accent" 
                    : "bg-primary/10 text-primary"
                }`}>
                  {message.status === "unresponded" ? "Needs Reply" : "Responded"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
