import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { askFarmBot, getChatHistory, getExternalUserId } from "@/services/smartFarmApi";

const SmartFarmChatbot = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<{ role: string; content: string; time: string }[]>([
    { role: "assistant", content: t("chatbot.greeting"), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    const userId = getExternalUserId();
    if (userId) {
      getChatHistory(userId).then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const history = data.map((item: any) => ({
            role: item.role || (item.sender === "bot" || item.is_bot ? "assistant" : "user"),
            content: item.content || item.message || item.text || "",
            time: item.time || (item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""),
          }));
          setMessages(history);
        }
      }).catch(() => {});
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg, time: now }]);
    setInput("");

    const userId = getExternalUserId();
    if (!userId) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { role: "assistant", content: "Please login first to use the chatbot.", time }]);
      return;
    }

    setLoading(true);
    try {
      const data = await askFarmBot(userId, userMsg, language === "ar" ? "ar" : "en");
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const reply = data.answer || data.response || data.reply || JSON.stringify(data);
      setMessages(prev => [...prev, { role: "assistant", content: reply, time }]);
    } catch {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again.", time }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title={t("chatbot.title")}>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{t("chatbot.heading")}</h1>
            <p className="text-sm text-muted-foreground">{t("chatbot.subtitle")}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl flex-1 flex flex-col overflow-hidden">
          <div className="bg-primary px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-primary-foreground font-medium">{t("chatbot.assistant")}</p>
              <p className="text-primary-foreground/70 text-xs">{t("chatbot.online")}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div>
                  <div className={cn(
                    "max-w-md px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap",
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  )}>
                    {msg.content}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">{msg.time}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary px-4 py-3 rounded-2xl">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
              placeholder={t("chatbot.placeholder")}
              className="rounded-full h-11 bg-secondary border-0 px-4"
              disabled={loading}
            />
            <Button onClick={handleSend} size="icon" className="rounded-full h-11 w-11 shrink-0" disabled={loading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SmartFarmChatbot;
