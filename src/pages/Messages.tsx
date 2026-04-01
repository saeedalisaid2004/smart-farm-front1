import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Mail, Send, Loader2, MessageSquare, Clock, CheckCircle2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { sendMessage, getMyMessages, getExternalUserId } from "@/services/smartFarmApi";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

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
          <><Clock className="w-3 h-3 mr-1" />{language === "ar" ? "قيد الانتظار" : "Pending"}</>
        )}
      </Badge>
    );
  };

  return (
    <DashboardLayout title={language === "ar" ? "الرسائل" : "Messages"}>
      <div className="max-w-3xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
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
              <h2 className="text-lg font-semibold text-foreground">{language === "ar" ? "رسائلك" : "Your Messages"}</h2>
              <p className="text-sm text-muted-foreground">{language === "ar" ? "تواصل مع الإدارة" : "Communicate with admin"}</p>
            </div>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setSelectedMsg(null); }} className="rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            {language === "ar" ? "رسالة جديدة" : "New Message"}
          </Button>
        </motion.div>

        {/* New Message Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-border rounded-3xl p-6 shadow-card space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Send className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{language === "ar" ? "إرسال رسالة جديدة" : "Send New Message"}</h3>
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">{language === "ar" ? "نوع الرسالة" : "Message Type"}</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="rounded-xl h-12 bg-secondary/50 border-border">
                      <SelectValue placeholder={language === "ar" ? "اختر نوع الرسالة..." : "Select message type..."} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={language === "ar" ? "شكوى" : "Complaint"}>
                        {language === "ar" ? "شكوى" : "Complaint"}
                      </SelectItem>
                      <SelectItem value={language === "ar" ? "اقتراح" : "Suggestion"}>
                        {language === "ar" ? "اقتراح" : "Suggestion"}
                      </SelectItem>
                      <SelectItem value={language === "ar" ? "استفسار" : "Inquiry"}>
                        {language === "ar" ? "استفسار" : "Inquiry"}
                      </SelectItem>
                      <SelectItem value={language === "ar" ? "أخرى" : "Other"}>
                        {language === "ar" ? "أخرى" : "Other"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">{language === "ar" ? "المحتوى" : "Content"}</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={language === "ar" ? "اكتب رسالتك هنا..." : "Write your message here..."}
                    className="rounded-xl min-h-[120px] bg-secondary/50 border-border resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button onClick={handleSend} disabled={sending} className="rounded-xl gap-2">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? (language === "ar" ? "جاري الإرسال..." : "Sending...") : (language === "ar" ? "إرسال" : "Send")}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages List */}
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
            <p className="text-muted-foreground font-medium">{language === "ar" ? "لا توجد رسائل بعد" : "No messages yet"}</p>
            <p className="text-sm text-muted-foreground/60 mt-1">{language === "ar" ? "أرسل رسالتك الأولى للإدارة" : "Send your first message to admin"}</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedMsg(selectedMsg?.id === msg.id ? null : msg)}
                className={`bg-card border rounded-2xl p-5 shadow-sm cursor-pointer transition-all hover:shadow-md ${selectedMsg?.id === msg.id ? "border-primary/40 shadow-primary/5" : "border-border"}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <Badge variant="outline" className="text-sm font-bold px-3 py-1 bg-primary/10 text-primary border-primary/30">
                      {msg.subject}
                    </Badge>
                  </div>
                  {getStatusBadge(msg.status)}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2" dir="auto">{msg.content}</p>
                <p className="text-xs text-muted-foreground/60">{formatTime(msg.date)}</p>

                {/* Expanded: Show reply */}
                <AnimatePresence>
                  {selectedMsg?.id === msg.id && (msg.reply || msg.admin_reply) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-xs font-medium text-primary">{language === "ar" ? "رد الإدارة" : "Admin Reply"}</span>
                        {msg.reply_date && <span className="text-xs text-muted-foreground/50">{formatTime(msg.reply_date)}</span>}
                      </div>
                      <p className="text-sm text-foreground bg-primary/5 rounded-xl p-3" dir="auto">{msg.admin_reply || msg.reply}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Messages;
