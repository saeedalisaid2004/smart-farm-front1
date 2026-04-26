import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MessageCircle, Send, Loader2, Bot, Plus, Trash2, Pencil, Check, X, PanelLeftClose, PanelLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  askFarmBot,
  getChatHistory,
  getUserSessions,
  deleteChatSession,
  renameChatSession,
  getExternalUserId,
} from "@/services/smartFarmApi";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  role: string;
  content: string;
  time: string;
  isGreeting?: boolean;
}

interface Session {
  session_id: string;
  title: string;
}

const cleanBotResponse = (raw: string): string => {
  if (!raw) return "";
  let text = raw.trim();
  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      const extracted = parsed.bot_response || parsed.answer || parsed.response || parsed.reply || parsed.message || parsed.text || parsed.content || parsed.result;
      if (typeof extracted === "string") return extracted.trim();
      if (typeof extracted === "object") return JSON.stringify(extracted, null, 2);
      const strings = Object.values(parsed).filter((v): v is string => typeof v === "string" && v.length > 3);
      if (strings.length > 0) return strings.join("\n");
    } catch {}
  }
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1);
  }
  text = text.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\t/g, " ");
  return text.trim();
};




const SmartFarmChatbot = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: t("chatbot.greeting"), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isGreeting: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages(prev => prev.map(msg =>
      msg.isGreeting ? { ...msg, content: t("chatbot.greeting") } : msg
    ));
  }, [language, t]);

  const loadSessions = useCallback(async () => {
    const userId = getExternalUserId();
    if (!userId) return;
    setSessionsLoading(true);
    try {
      const sessionData = await getUserSessions(userId);
      if (Array.isArray(sessionData)) {
        setSessions(sessionData);
      }
    } catch {}
    setSessionsLoading(false);
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const loadSessionHistory = useCallback(async (sessionId: string) => {
    const userId = getExternalUserId();
    if (!userId) return;
    setActiveSessionId(sessionId);
    try {
      const data = await getChatHistory(userId, sessionId);
      if (Array.isArray(data) && data.length > 0) {
        const history = data.map((item: any) => {
          const isBot = item.sender === "bot" || item.role === "assistant" || item.is_bot;
          const content = cleanBotResponse(item.content || item.message || item.text || item.bot_response || item.user_message || "");
          const time = item.time || "";
          return { role: isBot ? "assistant" : "user", content, time };
        });
        setMessages(history);
      } else {
        setMessages([{ role: "assistant", content: t("chatbot.greeting"), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isGreeting: true }]);
      }
    } catch {
      setMessages([{ role: "assistant", content: t("chatbot.greeting"), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isGreeting: true }]);
    }
  }, [t]);

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([{ role: "assistant", content: t("chatbot.greeting"), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isGreeting: true }]);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const userId = getExternalUserId();
    try {
      await deleteChatSession(sessionId);
      if (userId) {
        await deleteStoredChatSessionTitle(userId, sessionId);
      }
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      if (activeSessionId === sessionId) handleNewChat();
    } catch {}
  };

  const handleRenameSession = async (sessionId: string) => {
    const nextTitle = editTitle.trim();
    const userId = getExternalUserId();
    if (!nextTitle) { setEditingId(null); return; }
    try {
      await renameChatSession(sessionId, nextTitle);
      if (userId) {
        await saveStoredChatSessionTitle(userId, sessionId, nextTitle);
      }
      setSessions(prev => prev.map(s => s.session_id === sessionId ? { ...s, title: nextTitle } : s));
    } catch {}
    setEditingId(null);
  };

  const generateTitleFromMessage = (msg: string): string => {
    const cleaned = msg.replace(/\s+/g, " ").trim();
    if (!cleaned) return language === "ar" ? "محادثة جديدة" : "New Chat";
    const words = cleaned.split(" ").slice(0, 6).join(" ");
    return words.length > 40 ? words.slice(0, 40) + "…" : words;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = input;
    const isFirstMessage = !activeSessionId;
    setMessages(prev => [...prev, { role: "user", content: userMsg, time: now }]);
    setInput("");

    const userId = getExternalUserId();
    if (!userId) {
      setMessages(prev => [...prev, { role: "assistant", content: "Please login first to use the chatbot.", time: now }]);
      return;
    }

    setLoading(true);
    try {
      const data = await askFarmBot(userId, userMsg, language === "ar" ? "ar" : "en", activeSessionId || undefined);
      const time = data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const rawReply = data.bot_response || data.answer || data.response || data.reply || JSON.stringify(data);
      const reply = cleanBotResponse(rawReply);

      // If this was a new chat, set the session, auto-name it from the first message, then refresh
      if (isFirstMessage && data.session_id) {
        const newSessionId = data.session_id;
        setActiveSessionId(newSessionId);
        const autoTitle = generateTitleFromMessage(userMsg);
        try {
          await renameChatSession(newSessionId, autoTitle);
          await saveStoredChatSessionTitle(userId, newSessionId, autoTitle);
        } catch {}
        loadSessions();
      }

      setMessages(prev => [...prev, { role: "assistant", content: reply, time }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again.", time: now }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title={t("chatbot.title")}>
      <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("chatbot.heading")}</h1>
            <p className="text-sm text-muted-foreground">{t("chatbot.subtitle")}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-card border border-border rounded-2xl flex-1 flex overflow-hidden shadow-card"
        >
          {/* Sessions Sidebar */}
          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-e border-border flex flex-col bg-secondary/30 overflow-hidden"
              >
                <div className="p-3 border-b border-border flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2 rounded-xl text-xs" onClick={handleNewChat}>
                    <Plus className="w-3.5 h-3.5" />
                    {language === "ar" ? "محادثة جديدة" : "New Chat"}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSidebarOpen(false)}>
                    <PanelLeftClose className="w-4 h-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {sessionsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : sessions.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">{language === "ar" ? "لا توجد محادثات" : "No conversations yet"}</p>
                    ) : (
                      sessions.map((s) => (
                        <div
                          key={s.session_id}
                          className={cn(
                            "group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-sm",
                            activeSessionId === s.session_id
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-secondary text-foreground"
                          )}
                          onClick={() => editingId !== s.session_id && loadSessionHistory(s.session_id)}
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-50" />
                          {editingId === s.session_id ? (
                            <div className="flex-1 flex items-center gap-1">
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleRenameSession(s.session_id)}
                                className="h-6 text-xs px-1 rounded"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Button size="icon" variant="ghost" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); handleRenameSession(s.session_id); }}>
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span className="flex-1 truncate text-xs" dir="auto">{s.title}</span>
                              <div className="hidden group-hover:flex items-center gap-0.5">
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setEditingId(s.session_id); setEditTitle(s.title); }}>
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.session_id); }}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat header */}
            <div className="gradient-primary px-4 sm:px-6 py-4 flex items-center gap-3">
              {!sidebarOpen && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10" onClick={() => setSidebarOpen(true)}>
                  <PanelLeft className="w-4 h-4" />
                </Button>
              )}
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
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
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
                      {msg.time && <p className="text-[10px] text-muted-foreground mt-1 px-1">{msg.time}</p>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
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
              <Button onClick={handleSend} size="icon" className="rounded-xl h-12 w-12 shrink-0 shadow-primary" disabled={loading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SmartFarmChatbot;
