import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Mail, Send, Loader2, MessageSquare, Clock, CheckCircle2, Plus, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { sendMessage, getMyMessages, getExternalUserId } from "@/services/smartFarmApi";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Message {
  id: number;
  subject: string;
  content: string;
  status: string;
  reply?: string;
  admin_reply?: string;
  date: string;
  reply_date?: string;
}

const Messages = () => {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const userId = getExternalUserId();
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getMyMessages(userId);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({ variant: "destructive", title: language === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields" });
      return;
    }
    const userId = getExternalUserId();
    if (!userId) return;
    setSending(true);
    try {
      await sendMessage(userId, subject, content);
      toast({ title: language === "ar" ? "تم إرسال الرسالة بنجاح ✉️" : "Message sent successfully ✉️" });
      const userName = JSON.parse(localStorage.getItem("smart_farm_user") || "{}").name || "مزارع";
      supabase.functions.invoke("manage-notifications", {
        body: {
          action: "create",
          user_id: "2",
          title: language === "ar" ? "رسالة جديدة 📩" : "New Message 📩",
          description: language === "ar"
            ? `رسالة جديدة من ${userName}: "${subject}"`
            : `New message from ${userName}: "${subject}"`,
          type: "info",
        },
      }).catch(() => {});
      setSubject("");
      setContent("");
      setShowForm(false);
      fetchMessages();
      window.dispatchEvent(new Event("messages-updated"));
    } catch {
      toast({ variant: "destructive", title: language === "ar" ? "فشل إرسال الرسالة" : "Failed to send message" });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const normalized = dateStr.includes("+") || dateStr.includes("Z") ? dateStr : dateStr.replace(" ", "T") + "+02:00";
      return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-GB", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(normalized));
    } catch {
      return dateStr;
    }
  };

  // Group messages into a flat chat-like list
  const chatBubbles = messages.flatMap((msg) => {
    const bubbles: { type: "sent" | "received"; subject: string; text: string; time: string; status: string }[] = [];
    bubbles.push({
      type: "sent",
      subject: msg.subject,
      text: msg.content,
      time: formatTime(msg.date),
      status: msg.status,
    });
    const replyText = msg.admin_reply || msg.reply;
    if (replyText) {
      bubbles.push({
        type: "received",
        subject: language === "ar" ? "رد الإدارة" : "Admin Reply",
        text: replyText,
        time: msg.reply_date ? formatTime(msg.reply_date) : "",
        status: "replied",
      });
    }
    return bubbles;
  });

  return (
    <DashboardLayout title={language === "ar" ? "الرسائل" : "Messages"}>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-180px)]" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between pb-4 border-b border-border mb-4 flex-shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Mail className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{language === "ar" ? "المحادثات" : "Conversations"}</h2>
              <p className="text-xs text-muted-foreground">{language === "ar" ? "تواصل مع الإدارة" : "Chat with admin"}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            variant={showForm ? "outline" : "default"}
            className="rounded-xl gap-1.5"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm
              ? (language === "ar" ? "إلغاء" : "Cancel")
              : (language === "ar" ? "رسالة جديدة" : "New Message")}
          </Button>
        </motion.div>

        {/* New Message Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden flex-shrink-0 mb-4"
            >
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    {language === "ar" ? "الموضوع" : "Subject"}
                  </Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={language === "ar" ? "موضوع الرسالة..." : "Message subject..."}
                    className="rounded-xl h-10 bg-secondary/50 border-border text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    {language === "ar" ? "الرسالة" : "Message"}
                  </Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={language === "ar" ? "اكتب رسالتك..." : "Write your message..."}
                    className="rounded-xl min-h-[80px] bg-secondary/50 border-border resize-none text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSend} disabled={sending} size="sm" className="rounded-xl gap-2">
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {sending ? (language === "ar" ? "إرسال..." : "Sending...") : (language === "ar" ? "إرسال" : "Send")}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-secondary/20 border border-border p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : chatBubbles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <MessageSquare className="w-14 h-14 text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground text-sm font-medium">
                {language === "ar" ? "لا توجد رسائل بعد" : "No messages yet"}
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                {language === "ar" ? "أرسل رسالتك الأولى" : "Send your first message"}
              </p>
            </div>
          ) : (
            <>
              {chatBubbles.map((bubble, i) => {
                const isSent = bubble.type === "sent";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex ${isSent ? (isRTL ? "justify-start" : "justify-end") : (isRTL ? "justify-end" : "justify-start")}`}
                  >
                    <div className={`max-w-[75%] ${isSent
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-2xl rounded-bl-md"
                    } px-4 py-3 shadow-sm`}>
                      {/* Subject line */}
                      <p className={`text-[11px] font-semibold mb-1 ${isSent ? "text-primary-foreground/70" : "text-primary"}`}>
                        {bubble.subject}
                      </p>
                      {/* Message text */}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" dir="auto">{bubble.text}</p>
                      {/* Footer: time + status */}
                      <div className={`flex items-center gap-1.5 mt-1.5 ${isSent ? "justify-end" : "justify-start"}`}>
                        <span className={`text-[10px] ${isSent ? "text-primary-foreground/50" : "text-muted-foreground/60"}`}>
                          {bubble.time}
                        </span>
                        {isSent && (
                          bubble.status?.toLowerCase() === "replied"
                            ? <CheckCircle2 className="w-3 h-3 text-primary-foreground/60" />
                            : <Clock className="w-3 h-3 text-primary-foreground/40" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
