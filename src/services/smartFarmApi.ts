// External API only — no Supabase

const API_BASE = "https://mahmoud123mahmoud-smartfarm-api.hf.space";

const TIMEOUT_MS = 15000;

class ApiTimeoutError extends Error {
  constructor() {
    super("API_TIMEOUT");
    this.name = "ApiTimeoutError";
  }
}

const TOKEN_KEY = "smartfarm_access_token";

export const setAccessToken = (token: string | null) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export const getAccessToken = (): string | null => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

const fetchWithTimeout = (url: string, options?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const token = getAccessToken();
  const headers = new Headers(options?.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, { ...options, headers, signal: controller.signal })
    .catch((err) => {
      if (err.name === "AbortError") throw new ApiTimeoutError();
      throw err;
    })
    .finally(() => clearTimeout(timer));
};

export const isTimeoutError = (err: unknown): boolean =>
  err instanceof ApiTimeoutError || (err instanceof DOMException && err.name === "AbortError");

export class ApiResponseError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, payload: unknown) {
    const message =
      typeof payload === "object" && payload !== null && "detail" in payload
        ? String((payload as { detail?: unknown }).detail)
        : `Request failed with status ${status}`;
    super(message);
    this.name = "ApiResponseError";
    this.status = status;
    this.payload = payload;
  }
}

export const getApiErrorMessage = (err: unknown): string | null => {
  if (err instanceof ApiResponseError) {
    const payload = err.payload;
    if (typeof payload === "object" && payload !== null && "detail" in payload) {
      const detail = (payload as { detail?: unknown }).detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail)) {
        const firstMessage = detail.find(
          (item) => typeof item === "object" && item !== null && "msg" in item && typeof item.msg === "string"
        ) as { msg?: string } | undefined;
        if (firstMessage?.msg) return firstMessage.msg;
      }
    }
    return err.message;
  }

  return err instanceof Error ? err.message : null;
};

const parseJsonResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) throw new ApiResponseError(res.status, data);
  return data;
};

// Store external API user ID
let externalUserId: number | null = null;

export const setExternalUserId = (id: number | null) => {
  externalUserId = id;
  if (id !== null) {
    localStorage.setItem("external_user_id", String(id));
  } else {
    localStorage.removeItem("external_user_id");
  }
};

export const getExternalUserId = (): number | null => {
  if (externalUserId !== null) return externalUserId;
  const stored = localStorage.getItem("external_user_id");
  if (stored) {
    externalUserId = parseInt(stored, 10);
    return externalUserId;
  }
  return null;
};

// Helper to build form data
const toFormData = (data: Record<string, string | number | Blob>) => {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Blob) {
      fd.append(key, value);
    } else {
      fd.append(key, String(value));
    }
  }
  return fd;
};

const toUrlEncoded = (data: Record<string, string | number>) => {
  return new URLSearchParams(
    Object.entries(data).map(([k, v]) => [k, String(v)])
  ).toString();
};

// ============ Authentication ============

export const apiForgotPassword = async (email: string) => {
  const res = await fetchWithTimeout(`${API_BASE}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toUrlEncoded({ email }),
  });
  return parseJsonResponse(res);
};

export const apiResetPassword = async (email: string, otp: string, new_password: string) => {
  const res = await fetchWithTimeout(`${API_BASE}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toUrlEncoded({ email, code: otp, new_password }),
  });
  return parseJsonResponse(res);
};

export const apiRegister = async (name: string, email: string, password: string) => {
  const res = await fetchWithTimeout(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toUrlEncoded({ name, email, password }),
  });
  return res.json();
};

export const apiLogin = async (email: string, password: string) => {
  const res = await fetchWithTimeout(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toUrlEncoded({ email, password }),
  });
  const data = await res.json();
  if (data.user?.id) {
    setExternalUserId(data.user.id);
  }
  if (data.access_token) {
    setAccessToken(data.access_token);
  }
  return data;
};

export const apiLogout = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/logout/${userId}`, { method: "POST" });
  setExternalUserId(null);
  setAccessToken(null);
  return res.json();
};

export const apiSaveSettings = async (
  userId: number,
  settings: { full_name?: string; email?: string; phone?: string; profile_img?: File }
) => {
  const fd = new FormData();
  Object.entries(settings).forEach(([key, value]) => {
    if (value !== undefined) {
      if (value instanceof File) {
        fd.append(key, value);
      } else {
        fd.append(key, String(value));
      }
    }
  });

  const res = await fetchWithTimeout(`${API_BASE}/save-all-settings/${userId}`, {
    method: "PUT",
    body: fd,
  });
  return res.json();
};

export const buildProfileImageUrl = (profileImagePath?: string): string | null => {
  if (!profileImagePath) return null;
  if (profileImagePath.startsWith("http")) return profileImagePath;
  return `${API_BASE}/${profileImagePath}`;
};

// ============ AI Analysis ============

export const detectPlantDisease = async (userId: number, image: File, lang: string = "ar") => {
  const fd = toFormData({ user_id: userId, image, lang });
  const res = await fetchWithTimeout(`${API_BASE}/plants/detect`, { method: "POST", body: fd });
  return res.json();
};

export const estimateAnimalWeight = async (userId: number, image: File, lang: string = "ar") => {
  const fd = toFormData({ user_id: userId, image, lang });
  const res = await fetchWithTimeout(`${API_BASE}/animals/estimate-weight`, { method: "POST", body: fd });
  return res.json();
};

export const recommendCrop = async (
  userId: number,
  params: { city_name: string; soil: string },
  lang: string = "ar"
) => {
  const res = await fetchWithTimeout(`${API_BASE}/crops/recommend-smart-expert`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toUrlEncoded({ user_id: userId, ...params, lang }),
  });
  return res.json();
};

export const analyzeSoil = async (
  userId: number,
  params: { ph: number; moisture: number; n: number; p: number; k: number },
  lang: string = "ar"
) => {
  const res = await fetchWithTimeout(`${API_BASE}/soil/analyze-soil`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toUrlEncoded({ user_id: userId, ...params, lang }),
  });
  return res.json();
};

export const analyzeFruit = async (userId: number, image: File, lang: string = "ar") => {
  const fd = toFormData({ user_id: userId, image, lang });
  const res = await fetchWithTimeout(`${API_BASE}/fruits/analyze-fruit`, { method: "POST", body: fd });
  return res.json();
};

// ============ Chatbot ============

export interface StoredChatSessionTitle {
  session_id: string;
  title: string;
}

export const askFarmBot = async (userId: number, question: string, language = "ar", sessionId?: string) => {
  const params: Record<string, any> = { user_id: userId, question, language };
  if (sessionId) params.session_id = sessionId;
  const res = await fetchWithTimeout(`${API_BASE}/chatbot/ask-farm-bot`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toUrlEncoded(params),
  });
  return res.json();
};

export const getUserSessions = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/chatbot/user-sessions/${userId}`);
  return res.json();
};

const titlesStorageKey = (userId: number) => `chat_session_titles_${userId}`;

const readStoredTitles = (userId: number): Record<string, string> => {
  try {
    const raw = localStorage.getItem(titlesStorageKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeStoredTitles = (userId: number, map: Record<string, string>) => {
  try { localStorage.setItem(titlesStorageKey(userId), JSON.stringify(map)); } catch {}
};

export const getStoredChatSessionTitles = async (userId: number): Promise<StoredChatSessionTitle[]> => {
  const map = readStoredTitles(userId);
  return Object.entries(map).map(([session_id, title]) => ({ session_id, title }));
};

export const getChatHistory = async (userId: number, sessionId?: string) => {
  const query = sessionId ? `?session_id=${sessionId}` : "";
  const res = await fetchWithTimeout(`${API_BASE}/chatbot/chat-history/${userId}${query}`);
  return res.json();
};

export const deleteChatSession = async (sessionId: string) => {
  const res = await fetchWithTimeout(`${API_BASE}/chatbot/delete-session/${sessionId}`, {
    method: "DELETE",
  });
  return res.json();
};

export const deleteStoredChatSessionTitle = async (userId: number, sessionId: string) => {
  const map = readStoredTitles(userId);
  delete map[sessionId];
  writeStoredTitles(userId, map);
  return { success: true };
};

export const renameChatSession = async (sessionId: string, newTitle: string) => {
  const params = new URLSearchParams();
  params.append("new_title", newTitle);
  const res = await fetchWithTimeout(`${API_BASE}/chatbot/rename-session/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  return res.json();
};

export const saveStoredChatSessionTitle = async (userId: number, sessionId: string, title: string) => {
  const map = readStoredTitles(userId);
  map[sessionId] = title;
  writeStoredTitles(userId, map);
  return { success: true };
};

// ============ Reports ============

export const getUserReportSummary = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/reports/user-summary/${userId}`);
  return res.json();
};

export const getFarmerStats = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/farmer/dashboard-all/${userId}`);
  return res.json();
};

export const generateFarmerPdf = async (userId: number, period: string = "all") => {
  const res = await fetchWithTimeout(`${API_BASE}/farmer_reports/generate/${userId}?period=${encodeURIComponent(period)}`, { method: "POST" });
  return res.json();
};

export const listFarmerReports = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/farmer_reports/list/${userId}`);
  return res.json();
};

export const getFarmerReportStats = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/farmer_reports/stats/${userId}`);
  return res.json();
};

export const deleteFarmerReport = async (reportId: number | string) => {
  const res = await fetchWithTimeout(`${API_BASE}/farmer_reports/delete/${reportId}`, { method: "DELETE" });
  try { return await res.json(); } catch { return { ok: res.ok }; }
};

// ============ Admin ============

export const getAdminDashboardStats = async () => {
  const res = await fetchWithTimeout(`${API_BASE}/admin/dashboard/stats`);
  return res.json();
};

export const getUserManagementData = async () => {
  const res = await fetchWithTimeout(`${API_BASE}/admin/users/summary-and-list`);
  return res.json();
};

export const searchUsers = async (query: string) => {
  const res = await fetchWithTimeout(`${API_BASE}/admin/users/search?query=${encodeURIComponent(query)}`);
  return res.json();
};

export const deleteUser = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/admin/users/delete/${userId}`, { method: "DELETE" });
  return res.json();
};

export const deactivateUser = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/admin/users/deactivate/${userId}`, { method: "PATCH" });
  return res.json();
};

export const activateUser = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/admin/users/activate/${userId}`, { method: "PATCH" });
  return res.json();
};

export const promoteToAdmin = async (email: string) => {
  const url = `${API_BASE}/admin/users/promote-to-admin?email=${encodeURIComponent(email)}`;
  const res = await fetchWithTimeout(url, { method: "POST" });
  return res.json();
};

export const demoteToFarmer = async (email: string) => {
  const url = `${API_BASE}/admin/users/demote-to-farmer?email=${encodeURIComponent(email)}`;
  const res = await fetchWithTimeout(url, { method: "POST" });
  return res.json();
};

export const getUserActivityDetails = async (userId: number | string, period: "daily" | "weekly" | "monthly" | "all" = "all") => {
  const url = `${API_BASE}/admin/users/user-activity-details/${userId}?period=${period}`;
  const res = await fetchWithTimeout(url);
  return res.json();
};

export const getSystemStatus = async () => {
  const res = await fetchWithTimeout(`${API_BASE}/admin/system/admin/system/status`);
  return res.json();
};

export const getSystemSettings = async () => {
  const res = await fetchWithTimeout(`${API_BASE}/admin/system/admin/system/settings`);
  return res.json();
};

export const toggleSystemSetting = async (settingName: string) => {
  const res = await fetchWithTimeout(`${API_BASE}/admin/system/admin/system/settings/toggle/${settingName}`, {
    method: "POST",
  });
  return res.json();
};

export const toggleService = async (moduleName: string) => {
  const res = await fetchWithTimeout(`${API_BASE}/admin/system/toggle-service/${moduleName}`, {
    method: "POST",
  });
  return res.json();
};

export const getModelsTable = async () => {
  const res = await fetchWithTimeout(`${API_BASE}/admin/system/admin/system/ai-models`);
  return res.json();
};

// Local/Supabase notifications removed — notifications now rely solely on the external API.

export const getAdminReportStats = async (days?: number) => {
  const url = days
    ? `${API_BASE}/admin/reports/admin/reports/dashboard-stats?days=${days}`
    : `${API_BASE}/admin/reports/admin/reports/dashboard-stats`;
  const res = await fetchWithTimeout(url);
  return res.json();
};

export const generatePremiumReport = async () => {
  const res = await fetchWithTimeout(`${API_BASE}/admin/reports/admin/reports/generate-pdf`, {
    method: "POST",
  });
  const data = await res.json();
  const url = data.file_url || data.download_url;
  if (url && !url.startsWith("http")) {
    data.file_url = `${API_BASE}${url}`;
  } else if (url) {
    data.file_url = url;
  }
  return data;
};

// ============ Notification Settings ============

export const getUserNotifications = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/notifications/notifications/my-notifications/${userId}`);
  return res.json();
};

// Local notification helpers removed — all notifications come from the external API only.

export const markNotificationAsRead = async (notifId: number | string) => {
  const res = await fetchWithTimeout(`${API_BASE}/notifications/notifications/read/${notifId}`, {
    method: "PATCH",
  });
  return res.json();
};

export const markAllNotificationsAsRead = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/notifications/notifications/read-all/${userId}`, {
    method: "PATCH",
  });
  return res.json();
};

export const deleteNotification = async (notifId: number | string) => {
  const res = await fetchWithTimeout(`${API_BASE}/notifications/notifications/delete/${notifId}`, {
    method: "DELETE",
  });
  return res.json();
};

export const deleteAllNotifications = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/notifications/notifications/delete-all/${userId}`, {
    method: "DELETE",
  });
  return res.json();
};

export const getNotificationSettings = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/notifications/notifications/get-settings/${userId}`);
  return res.json();
};

export const updateAdminNotificationSettings = async (
  userId: number,
  settings: { push?: boolean; email?: boolean }
) => {
  const params = new URLSearchParams();
  if (settings.push !== undefined) params.append("admin_push", String(settings.push));
  if (settings.email !== undefined) params.append("admin_email", String(settings.email));

  const query = params.toString();
  const url = `${API_BASE}/notifications/notifications/admin-settings/${userId}${query ? `?${query}` : ""}`;

  const res = await fetchWithTimeout(url, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to update admin notification settings");
  const data = await res.json();

  const s = data?.settings || data;
  return {
    status: "success",
    settings: {
      push_notifications_admin: s?.push_notifications_admin ?? s?.admin_push ?? s?.push ?? true,
      email_alerts_admin: s?.email_alerts_admin ?? s?.admin_email ?? s?.email ?? true,
    },
    current_settings: s,
  };
};

export const updateFarmerNotificationSettings = async (
  userId: number,
  settings: { email?: boolean; analysis_alerts?: boolean; weekly_report?: boolean }
) => {
  const params = new URLSearchParams();
  if (settings.email !== undefined) params.append("email_notif", String(settings.email));
  if (settings.analysis_alerts !== undefined) params.append("analysis_alt", String(settings.analysis_alerts));
  if (settings.weekly_report !== undefined) params.append("weekly_alt", String(settings.weekly_report));

  const query = params.toString();
  const url = `${API_BASE}/notifications/notifications/farmer-settings/${userId}${query ? `?${query}` : ""}`;

  const res = await fetchWithTimeout(url, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to update farmer notification settings");
  return res.json();
};

// ============ Change Password ============

export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
) => {
  const res = await fetchWithTimeout(`${API_BASE}/change-password/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toUrlEncoded({ old_password: currentPassword, new_password: newPassword }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || data.message || "Failed to change password");
  }
  return res.json();
};

// ============ Alternative Farmer Report ============

export const generateFarmerReportAlt = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/reports/generate-farmer-report/${userId}`, {
    method: "POST",
  });
  const data = await res.json();
  if (data.file_url && !data.file_url.startsWith("http")) {
    data.file_url = `${API_BASE}${data.file_url}`;
  }
  return data;
};

// ============ Messages ============

export const sendMessage = async (userId: number, subject: string, content: string) => {
  const fd = new FormData();
  fd.append("user_id", String(userId));
  fd.append("subject", subject);
  fd.append("content", content);
  const res = await fetchWithTimeout(`${API_BASE}/messages/send`, { method: "POST", body: fd });
  return res.json();
};

export const getMyMessages = async (userId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/messages/my-messages/${userId}`);
  return res.json();
};

export const getAllMessages = async () => {
  const res = await fetchWithTimeout(`${API_BASE}/messages/admin/all-messages`);
  return res.json();
};

export const adminReplyMessage = async (messageId: number, replyContent: string) => {
  const fd = new FormData();
  fd.append("message_id", String(messageId));
  fd.append("reply_content", replyContent);
  const res = await fetchWithTimeout(`${API_BASE}/messages/admin/reply`, { method: "POST", body: fd });
  return res.json();
};

export const deleteUserMessage = async (messageId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/messages/delete/${messageId}`, { method: "DELETE" });
  return res.json();
};

export const adminDeleteMessage = async (messageId: number) => {
  const res = await fetchWithTimeout(`${API_BASE}/messages/admin/delete/${messageId}`, { method: "DELETE" });
  return res.json();
};

