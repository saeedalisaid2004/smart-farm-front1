import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MessageCircle, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { askFarmBot, getChatHistory, getExternalUserId } from "@/services/smartFarmApi";
import { motion, AnimatePresence } from "framer-motion";

// Clean up weird API responses (JSON strings, nested objects, etc.)
const cleanBotResponse = (raw: string): string => {
  if (!raw) return "";
  let text = raw.trim();

  // If it looks like JSON, try to extract meaningful text
  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      // Extract known response keys
      const extracted =
        parsed.bot_response || parsed.answer || parsed.response || parsed.reply ||
        parsed.message || parsed.text || parsed.content || parsed.result;
      if (typeof extracted === "string") return extracted.trim();
      // If it's an object with a nested response, try to stringify nicely
      if (typeof extracted === "object") return JSON.stringify(extracted, null, 2);
      // Last resort: pull all string values
      const strings = Object.values(parsed).filter((v): v is string => typeof v === "string" && v.length > 3);
      if (strings.length > 0) return strings.join("\n");
    } catch {
      // Not valid JSON, continue
    }
  }

  // Remove wrapping quotes
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1);
  }

  // Clean escaped characters
  text = text.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\t/g, " ");

  return text.trim();
};

const SmartFarmChatbot = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<{ role: string; content: string; time: string; isGreeting?: boolean }[]>([
    { role: "assistant", content: t("chatbot.greeting"), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isGreeting: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update greeting message when language changes
  useEffect(() => {
    setMessages(prev => prev.map(msg =>
      msg.isGreeting ? { ...msg, content: t("chatbot.greeting") } : msg
    ));
  }, [language, t]);

  useEffect(() => {
    const userId = getExternalUserId();
    if (userId) {
      getChatHistory(userId).then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const history = data.map((item: any) => {
            const isBot = item.role === "assistant" || item.sender === "bot" || item.is_bot;
            const content = cleanBotResponse(item.content || item.message || item.text || item.bot_response || item.user_message || "");
            const time = item.timestamp
              ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : (item.time && item.time.includes(":") && item.time.length <= 5)
                ? item.time
                : "";
            return { role: isBot ? "assistant" : "user", content, time };
          });
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
      const rawReply = data.answer || data.response || data.reply || data.bot_response || JSON.stringify(data);
      const reply = cleanBotResponse(rawReply);
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("chatbot.heading")}</h1>
            <p className="text-sm text-muted-foreground">{t("chatbot.subtitle")}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-card border border-border rounded-2xl flex-1 flex flex-col overflow-hidden shadow-card"
        >
          {/* Chat header */}
          <div className="gradient-primary px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-primary-foreground font-semibold">{t("chatbot.assistant")}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                <p className="text-primary-foreground/70 text-xs">{t("chatbot.online")}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className="max-w-[75%]">
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-foreground rounded-bl-md"
                    )} dir="auto">
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 px-1">{msg.time}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
              placeholder={t("chatbot.placeholder")}
              className="rounded-xl h-12 bg-secondary/50 border-border focus:border-primary px-4 transition-colors"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="rounded-xl h-12 w-12 shrink-0 shadow-primary"
              disabled={loading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SmartFarmChatbot;
