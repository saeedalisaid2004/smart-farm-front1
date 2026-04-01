import AdminLayout from "@/components/admin/AdminLayout";
import { Mail, Send, Loader2, MessageSquare, Clock, CheckCircle2, User, Reply } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllMessages, adminReplyMessage, getUserManagementData } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(normalized));
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const isReplied = status?.toLowerCase() === "replied";
    return (
      <Badge variant={isReplied ? "default" : "secondary"} className={`text-xs ${isReplied ? "bg-primary/10 text-primary border-primary/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}>
        {isReplied ? (
          <><CheckCircle2 className="w-3 h-3 mr-1" />{language === "ar" ? "تم الرد" : "Replied"}</>
        ) : (
          <><Clock className="w-3 h-3 mr-1" />{language === "ar" ? "بانتظار الرد" : "Pending"}</>
        )}
      </Badge>
    );
  };

  const pendingCount = messages.filter(m => m.status?.toLowerCase() !== "replied").length;

  return (
    <AdminLayout title={language === "ar" ? "الرسائل" : "Messages"}>
      <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-30 animate-pulse" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{language === "ar" ? "رسائل المزارعين" : "Farmer Messages"}</h2>
              <p className="text-sm text-muted-foreground">
                {messages.length} {language === "ar" ? "رسالة" : "messages"}
                {pendingCount > 0 && (
                  <span className="text-amber-600 font-medium"> · {pendingCount} {language === "ar" ? "بانتظار الرد" : "pending"}</span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-card border border-border rounded-3xl"
          >
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">{language === "ar" ? "لا توجد رسائل" : "No messages yet"}</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => {
              const isSelected = selectedMsg?.id === msg.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-card border rounded-2xl p-5 shadow-sm transition-all ${isSelected ? "border-primary/40 shadow-md" : "border-border hover:shadow-md"}`}
                >
                  <div className="cursor-pointer" onClick={() => { setSelectedMsg(isSelected ? null : msg); setReplyText(msg.reply || ""); }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-foreground truncate">{msg.sender_name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{msg.sender_email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {getStatusBadge(msg.status)}
                        <span className="text-xs text-muted-foreground/60">{formatTime(msg.date)}</span>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-4">
                      <Badge variant="outline" className="text-sm font-bold px-3 py-1 mb-2 bg-primary/10 text-primary border-primary/30">
                        {msg.subject}
                      </Badge>
                      <p className="text-sm text-foreground" dir="auto">{msg.content}</p>
                    </div>
                  </div>

                  {/* Expanded view */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-border space-y-3"
                      >
                        {msg.reply && msg.status?.toLowerCase() === "replied" && (
                          <div className="bg-primary/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                              <span className="text-xs font-medium text-primary">{language === "ar" ? "ردك السابق" : "Your previous reply"}</span>
                            </div>
                            <p className="text-sm text-foreground" dir="auto">{msg.reply}</p>
                          </div>
                        )}
                        <div>
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={language === "ar" ? "اكتب ردك هنا..." : "Write your reply here..."}
                            className="rounded-xl min-h-[100px] bg-secondary/50 border-border resize-none"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={() => handleReply(msg.id)} disabled={replying} className="rounded-xl gap-2">
                            {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Reply className="w-4 h-4" />}
                            {replying ? (language === "ar" ? "جاري الإرسال..." : "Sending...") : (language === "ar" ? "إرسال الرد" : "Send Reply")}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
