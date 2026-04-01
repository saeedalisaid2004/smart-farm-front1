import AdminLayout from "@/components/admin/AdminLayout";
import { Mail, Send, Loader2, MessageSquare, CheckCircle2, Clock, User, Reply } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllMessages, adminReplyMessage, getUserManagementData } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface AdminMessage {
  id: number;
  sender_name: string;
  sender_email: string;
  subject: string;
  content: string;
  status: string;
  reply?: string;
  date: string;
  reply_date?: string;
}

const AdminMessages = () => {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<AdminMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const emailToIdMap = useRef<Record<string, number>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getAllMessages();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    getUserManagementData()
      .then((data: any) => {
        const users = data?.users || data?.all_users || [];
        const map: Record<string, number> = {};
        users.forEach((u: any) => { if (u.email && u.id) map[u.email] = u.id; });
        emailToIdMap.current = map;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleReply = async (msgId: number) => {
    if (!replyText.trim()) {
      toast({ variant: "destructive", title: language === "ar" ? "اكتب الرد أولاً" : "Write reply first" });
      return;
    }
    setReplying(true);
    try {
      await adminReplyMessage(msgId, replyText);
      toast({ title: language === "ar" ? "تم إرسال الرد ✅" : "Reply sent ✅" });

      const msg = messages.find(m => m.id === msgId);
      if (msg) {
        const farmerId = emailToIdMap.current[msg.sender_email];
        if (farmerId) {
          supabase.functions.invoke("manage-notifications", {
            body: {
              action: "create",
              user_id: String(farmerId),
              title: language === "ar" ? "رد من الإدارة 💬" : "Admin Reply 💬",
              description: language === "ar"
                ? `تم الرد على رسالتك "${msg.subject}": ${replyText.slice(0, 100)}`
                : `Reply to "${msg.subject}": ${replyText.slice(0, 100)}`,
              type: "info",
            },
          }).catch(() => {});
        }
      }

      setReplyText("");
      setSelectedMsg(null);
      fetchMessages();
      window.dispatchEvent(new Event("messages-updated"));
    } catch {
      toast({ variant: "destructive", title: language === "ar" ? "فشل إرسال الرد" : "Failed to send reply" });
    } finally {
      setReplying(false);
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

  // Build chat bubbles from all messages
  const chatBubbles = messages.flatMap((msg) => {
    const bubbles: { type: "received" | "sent"; msgId: number; sender: string; subject: string; text: string; time: string; status: string; original: AdminMessage }[] = [];
    // Farmer message = received by admin
    bubbles.push({
      type: "received",
      msgId: msg.id,
      sender: msg.sender_name,
      subject: msg.subject,
      text: msg.content,
      time: formatTime(msg.date),
      status: msg.status,
      original: msg,
    });
    // Admin reply = sent by admin
    if (msg.reply) {
      bubbles.push({
        type: "sent",
        msgId: msg.id,
        sender: language === "ar" ? "أنت" : "You",
        subject: language === "ar" ? "ردك" : "Your Reply",
        text: msg.reply,
        time: msg.reply_date ? formatTime(msg.reply_date) : "",
        status: "replied",
        original: msg,
      });
    }
    return bubbles;
  });

  const pendingCount = messages.filter(m => m.status?.toLowerCase() !== "replied").length;

  return (
    <AdminLayout title={language === "ar" ? "الرسائل" : "Messages"}>
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
              <h2 className="text-lg font-semibold text-foreground">{language === "ar" ? "رسائل المزارعين" : "Farmer Messages"}</h2>
              <p className="text-xs text-muted-foreground">
                {messages.length} {language === "ar" ? "رسالة" : "messages"}
                {pendingCount > 0 && (
                  <span className="text-amber-600 font-medium"> · {pendingCount} {language === "ar" ? "بانتظار الرد" : "pending"}</span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

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
                {language === "ar" ? "لا توجد رسائل" : "No messages yet"}
              </p>
            </div>
          ) : (
            <>
              {chatBubbles.map((bubble, i) => {
                const isSent = bubble.type === "sent";
                const isSelectedForReply = selectedMsg?.id === bubble.msgId && !isSent;
                return (
                  <motion.div
                    key={`${bubble.msgId}-${bubble.type}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div className={`flex ${isSent ? (isRTL ? "justify-start" : "justify-end") : (isRTL ? "justify-end" : "justify-start")}`}>
                      <div
                        className={`max-w-[75%] ${isSent
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                          : "bg-card border border-border text-foreground rounded-2xl rounded-bl-md cursor-pointer hover:shadow-md transition-shadow"
                        } px-4 py-3 shadow-sm`}
                        onClick={() => {
                          if (!isSent && bubble.original.status?.toLowerCase() !== "replied") {
                            setSelectedMsg(isSelectedForReply ? null : bubble.original);
                            setReplyText("");
                          }
                        }}
                      >
                        {/* Sender & Subject */}
                        <div className="flex items-center gap-1.5 mb-1">
                          {!isSent && <User className="w-3 h-3 text-muted-foreground/60" />}
                          <span className={`text-[11px] font-semibold ${isSent ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>
                            {bubble.sender}
                          </span>
                        </div>
                        <p className={`text-[11px] font-medium mb-1 ${isSent ? "text-primary-foreground/60" : "text-primary"}`}>
                          {bubble.subject}
                        </p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" dir="auto">{bubble.text}</p>
                        {/* Footer */}
                        <div className={`flex items-center gap-1.5 mt-1.5 ${isSent ? "justify-end" : "justify-start"}`}>
                          <span className={`text-[10px] ${isSent ? "text-primary-foreground/50" : "text-muted-foreground/60"}`}>
                            {bubble.time}
                          </span>
                          {!isSent && (
                            bubble.status?.toLowerCase() === "replied"
                              ? <CheckCircle2 className="w-3 h-3 text-primary/60" />
                              : <Clock className="w-3 h-3 text-amber-500/60" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reply input for selected message */}
                    <AnimatePresence>
                      {isSelectedForReply && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`mt-2 ${isRTL ? "mr-0 ml-auto" : "ml-0 mr-auto"} max-w-[75%]`}
                        >
                          <div className="bg-card border border-primary/20 rounded-2xl p-3 space-y-2 shadow-sm">
                            <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={language === "ar" ? "اكتب ردك هنا..." : "Write your reply..."}
                              className="rounded-xl min-h-[70px] bg-secondary/50 border-border resize-none text-sm"
                            />
                            <div className="flex justify-end">
                              <Button
                                onClick={() => handleReply(bubble.msgId)}
                                disabled={replying}
                                size="sm"
                                className="rounded-xl gap-1.5"
                              >
                                {replying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Reply className="w-3.5 h-3.5" />}
                                {replying ? (language === "ar" ? "إرسال..." : "Sending...") : (language === "ar" ? "رد" : "Reply")}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
