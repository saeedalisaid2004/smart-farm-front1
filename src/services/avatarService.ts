const AVATAR_URL_KEY = "avatar_base64";
const MAX_SIZE = 150;

function resolveUserId(userId?: string | number | null): string {
  if (userId !== undefined && userId !== null && String(userId).trim()) {
    return String(userId);
  }

  try {
    const stored = localStorage.getItem("app_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return String(parsed.id || parsed.email || "default");
    }
  } catch {}

  return "default";
}

function getAvatarStorageKey(userId?: string | number | null): string {
  return `${AVATAR_URL_KEY}_${resolveUserId(userId)}`;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;

        if (w > h) {
          if (w > MAX_SIZE) {
            h = (h * MAX_SIZE) / w;
            w = MAX_SIZE;
          }
        } else if (h > MAX_SIZE) {
          w = (w * MAX_SIZE) / h;
          h = MAX_SIZE;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadAvatar(userId: string | number, file: File): Promise<string> {
  const base64 = await compressImage(file);
  const storageKey = getAvatarStorageKey(userId);

  try {
    localStorage.setItem(storageKey, base64);
  } catch {
    localStorage.removeItem(storageKey);
    localStorage.setItem(storageKey, base64);
  }

  return base64;
}

export function getSavedAvatarUrl(userId?: string | number | null): string | null {
  try {
    const scopedKey = getAvatarStorageKey(userId);
    return localStorage.getItem(scopedKey) || null;
  } catch {
    return null;
  }
}
