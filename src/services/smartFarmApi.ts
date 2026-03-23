const API_BASE = "https://mahmoud123mahmoud-smartfarm-api.hf.space";

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

export const apiRegister = async (name: string, email: string, password: string) => {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toUrlEncoded({ name, email, password }),
  });
  return res.json();
};

export const apiLogin = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toUrlEncoded({ email, password }),
  });
  const data = await res.json();
  if (data.user?.id) {
    setExternalUserId(data.user.id);
  }
  return data;
};

export const apiLogout = async (userId: number) => {
  const res = await fetch(`${API_BASE}/logout/${userId}`, { method: "POST" });
  setExternalUserId(null);
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

  const res = await fetch(`${API_BASE}/save-all-settings/${userId}`, {
    method: "PUT",
    body: fd,
  });
  return res.json();
};

export const apiGetProfileImage = (userId: number): string => {
  return `${API_BASE}/profile-image/${userId}`;
};

// ============ AI Analysis ============

export const detectPlantDisease = async (userId: number, image: File) => {
  const fd = toFormData({ user_id: userId, image });
  const res = await fetch(`${API_BASE}/plants/detect`, { method: "POST", body: fd });
  return res.json();
};

export const estimateAnimalWeight = async (userId: number, image: File) => {
  const fd = toFormData({ user_id: userId, image });
  const res = await fetch(`${API_BASE}/animals/estimate-weight`, { method: "POST", body: fd });
  return res.json();
};

export const recommendCrop = async (
  userId: number,
  params: { temperature: number; humidity: number; rainfall: number; soil: string }
) => {
  const res = await fetch(`${API_BASE}/crops/recommend-crop`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toUrlEncoded({ user_id: userId, ...params }),
  });
  return res.json();
};

export const analyzeSoil = async (
  userId: number,
  params: { ph: number; moisture: number; n: number; p: number; k: number }
) => {
  const res = await fetch(`${API_BASE}/soil/analyze-soil`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toUrlEncoded({ user_id: userId, ...params }),
  });
  return res.json();
};

export const analyzeFruit = async (userId: number, image: File) => {
  const fd = toFormData({ user_id: userId, image });
  const res = await fetch(`${API_BASE}/fruits/analyze-fruit`, { method: "POST", body: fd });
  return res.json();
};

// ============ Chatbot ============

export const askFarmBot = async (userId: number, question: string, language = "ar") => {
  const res = await fetch(`${API_BASE}/chatbot/ask-farm-bot`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toUrlEncoded({ user_id: userId, question, language }),
  });
  return res.json();
};

export const getChatHistory = async (userId: number) => {
  const res = await fetch(`${API_BASE}/chatbot/chat-history/${userId}`);
  return res.json();
};

// ============ Reports ============

export const getUserReportSummary = async (userId: number) => {
  const res = await fetch(`${API_BASE}/reports/user-summary/${userId}`);
  return res.json();
};

export const getFarmerStats = async (userId: number) => {
  const res = await fetch(`${API_BASE}/farmer_reports/stats/${userId}`);
  return res.json();
};

export const generateFarmerPdf = async (userId: number) => {
  const res = await fetch(`${API_BASE}/farmer_reports/generate/${userId}`, { method: "POST" });
  return res.json();
};

export const listFarmerReports = async (userId: number) => {
  const res = await fetch(`${API_BASE}/farmer_reports/list/${userId}`);
  return res.json();
};

// ============ Admin ============

export const getAdminDashboardStats = async () => {
  const res = await fetch(`${API_BASE}/admin/dashboard/stats`);
  return res.json();
};

export const getUserManagementData = async () => {
  const res = await fetch(`${API_BASE}/admin/users/summary-and-list`);
  return res.json();
};

export const searchUsers = async (query: string) => {
  const res = await fetch(`${API_BASE}/admin/users/search?query=${encodeURIComponent(query)}`);
  return res.json();
};

export const deleteUser = async (userId: number) => {
  const res = await fetch(`${API_BASE}/admin/users/delete/${userId}`, { method: "DELETE" });
  return res.json();
};

export const deactivateUser = async (userId: number) => {
  const res = await fetch(`${API_BASE}/admin/users/deactivate/${userId}`, { method: "PATCH" });
  return res.json();
};

export const activateUser = async (userId: number) => {
  const res = await fetch(`${API_BASE}/admin/users/activate/${userId}`, { method: "PATCH" });
  return res.json();
};

export const promoteToAdmin = async (email: string) => {
  const res = await fetch(`${API_BASE}/admin/users/promote-to-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toUrlEncoded({ email }),
  });
  return res.json();
};

export const getSystemStatus = async () => {
  const res = await fetch(`${API_BASE}/admin/system/admin/system/status`);
  return res.json();
};

export const getSystemSettings = async () => {
  const res = await fetch(`${API_BASE}/admin/system/admin/system/settings`);
  return res.json();
};

export const toggleSystemSetting = async (settingName: string) => {
  const res = await fetch(`${API_BASE}/admin/system/admin/system/settings/toggle/${settingName}`, {
    method: "POST",
  });
  return res.json();
};

export const toggleService = async (moduleName: string) => {
  const res = await fetch(`${API_BASE}/admin/system/toggle-service/${moduleName}`, {
    method: "POST",
  });
  return res.json();
};

export const getModelsTable = async () => {
  const res = await fetch(`${API_BASE}/admin/system/models-table`);
  return res.json();
};

export const getAdminReportStats = async () => {
  const res = await fetch(`${API_BASE}/admin/reports/admin/reports/dashboard-stats`);
  return res.json();
};

export const generatePremiumReport = async () => {
  const res = await fetch(`${API_BASE}/admin/reports/admin/reports/generate-pdf`, {
    method: "POST",
  });
  const data = await res.json();
  if (data.file_url && !data.file_url.startsWith("http")) {
    data.file_url = `${API_BASE}${data.file_url}`;
  }
  return data;
};

// ============ User Notification Settings ============

export const getUserNotificationSettings = async (userId: number) => {
  const res = await fetch(`${API_BASE}/admin/users/settings/notifications/${userId}`, {
    method: "PATCH",
  });
  return res.json();
};

export const updateUserNotificationSettings = async (
  userId: number,
  settings: { push?: boolean; email?: boolean }
) => {
  const params = new URLSearchParams();
  if (settings.push !== undefined) params.set("push", String(settings.push));
  if (settings.email !== undefined) params.set("email", String(settings.email));
  const res = await fetch(
    `${API_BASE}/admin/users/settings/notifications/${userId}?${params.toString()}`,
    { method: "PATCH" }
  );
  return res.json();
};

// ============ Alternative Farmer Report ============

export const generateFarmerReportAlt = async (userId: number) => {
  const res = await fetch(`${API_BASE}/reports/generate-farmer-report/${userId}`, {
    method: "POST",
  });
  const data = await res.json();
  if (data.file_url && !data.file_url.startsWith("http")) {
    data.file_url = `${API_BASE}${data.file_url}`;
  }
  return data;
};
