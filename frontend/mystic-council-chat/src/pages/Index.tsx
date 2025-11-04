import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import RecommendationsPanel from "@/components/RecommendationsPanel";
import ParticleEffect from "@/components/ParticleEffect";

import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import backgroundImage from "@/assets/dota-map-background.jpg";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Иди траву пощупай, что ты хочешь, может тебе еще тайминги стаков сказать бож",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: messageText, thread_id: "1" }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "The Oracle whispers nothing...",
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Communication Disrupted",
        description:
          error.message || "The arcane connection falters. Attempt again, champion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      <ParticleEffect />

      <div className="relative z-10 flex w-full h-screen">
        {/* Desktop Panel */}
        <aside
          className={`${
            showRecommendations ? "w-80" : "w-0"
          } hidden lg:block transition-all duration-300 overflow-hidden border-r border-border/50`}
        >
          {showRecommendations && <RecommendationsPanel history={messages} />}
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <header className="border-b border-border/50 backdrop-blur-sm bg-card/20 py-4 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="ornate-border glow-hover"
                >
                  {showRecommendations ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-cinzel font-bold bg-gradient-to-r from-purple-400 via-primary to-emerald-400 bg-clip-text text-transparent">
                    Интеллектуальный ассистент по V POPU 2
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-fell flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Powered by ana & vladik
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <div className="max-w-5xl mx-auto">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="max-w-[75%] rounded-xl p-5 arcane-bubble">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-700/30 flex items-center justify-center glow-purple border border-purple-500/30">
                        <span className="text-purple-200 text-sm font-cinzel font-bold">⚡</span>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </main>

          <footer className="border-t border-border/50 backdrop-blur-sm bg-card/20 p-4 sm:p-6">
            <div className="max-w-5xl mx-auto">
              <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
            </div>
          </footer>
        </div>

        {/* Mobile Panel */}
        {showRecommendations && (
          <div className="lg:hidden fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h2 className="text-xl font-cinzel font-bold text-primary">Chat History</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRecommendations(false)}
                  className="ornate-border"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <RecommendationsPanel history={messages} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
