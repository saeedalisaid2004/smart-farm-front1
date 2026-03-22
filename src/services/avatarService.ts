const AVATAR_URL_KEY = "avatar_base64";
const MAX_SIZE = 150; // max width/height in pixels

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;

        // Scale down
        if (w > h) {
          if (w > MAX_SIZE) { h = (h * MAX_SIZE) / w; w = MAX_SIZE; }
        } else {
          if (h > MAX_SIZE) { w = (w * MAX_SIZE) / h; h = MAX_SIZE; }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);

        // Compress as JPEG with lower quality
        const base64 = canvas.toDataURL("image/jpeg", 0.6);
        resolve(base64);
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadAvatar(_userId: string | number, file: File): Promise<string> {
  const base64 = await compressImage(file);
  try {
    localStorage.setItem(AVATAR_URL_KEY, base64);
  } catch {
    // If localStorage is full, clear old data and retry
    localStorage.removeItem(AVATAR_URL_KEY);
    localStorage.setItem(AVATAR_URL_KEY, base64);
  }
  return base64;
}

export function getSavedAvatarUrl(): string | null {
  try {
    return localStorage.getItem(AVATAR_URL_KEY) || null;
  } catch {
    return null;
  }
}
