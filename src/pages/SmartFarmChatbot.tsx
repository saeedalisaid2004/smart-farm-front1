import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const SmartFarmChatbot = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<{ role: string; content: string; time: string }[]>([
    { role: "assistant", content: t("chatbot.greeting"), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: "user", content: input, time: now }]);
    setInput("");
    setTimeout(() => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { role: "assistant", content: t("chatbot.demoResponse"), time }]);
    }, 1000);
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
                    "max-w-md px-4 py-3 rounded-2xl text-sm",
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  )}>
                    {msg.content}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={t("chatbot.placeholder")}
              className="rounded-full h-11 bg-secondary border-0 px-4"
            />
            <Button onClick={handleSend} size="icon" className="rounded-full h-11 w-11 shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SmartFarmChatbot;
