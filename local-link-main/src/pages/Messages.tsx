import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Send, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Messages() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  if (!user) return null;

  const conversations = [
    {
      id: 1,
      name: "John Doe",
      lastMessage: "Thanks for the service!",
      time: "2 hours ago",
      unread: 2
    },
    {
      id: 2,
      name: "Jane Smith",
      lastMessage: "When can we schedule?",
      time: "Yesterday",
      unread: 0
    }
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">Messages</h1>
            <p className="text-muted-foreground">
              Communicate with your customers
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {filteredConversations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No conversations found
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        className="p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{conv.name}</h3>
                          {conv.unread > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {conv.time}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Select a Conversation</CardTitle>
                <CardDescription>
                  Choose a conversation to start messaging
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation from the list to view messages</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
