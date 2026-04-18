// Per-role theme management
export type Theme = "light" | "dark";
export type Scope = "admin" | "farmer";

const KEY = (scope: Scope) => `theme_${scope}`;

export const getScopeFromPath = (pathname: string): Scope =>
  pathname.startsWith("/admin") ? "admin" : "farmer";

export const getStoredTheme = (scope: Scope): Theme => {
  try {
    const v = localStorage.getItem(KEY(scope));
    return v === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

export const setTheme = (scope: Scope, theme: Theme) => {
  try {
    localStorage.setItem(KEY(scope), theme);
  } catch {}
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent("theme-changed", { detail: { scope, theme } }));
};

export const toggleTheme = (scope: Scope) => {
  const next: Theme = getStoredTheme(scope) === "dark" ? "light" : "dark";
  setTheme(scope, next);
  return next;
};

// Apply the right theme for the current path; safe to call on every route change
export const syncThemeForPath = (pathname: string) => {
  const scope = getScopeFromPath(pathname);
  applyTheme(getStoredTheme(scope));
};
