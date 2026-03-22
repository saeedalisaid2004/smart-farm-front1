function getUserId(): string {
  try {
    const stored = localStorage.getItem("app_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return String(parsed.id || parsed.email || "default");
    }
  } catch {}
  return "default";
}

function userKey(base: string): string {
  return `${base}_${getUserId()}`;
}

const STATS_KEY = "analysis_stats";

export interface AnalysisStats {
  plant_disease: number;
  animal_weight: number;
  crop_recommendation: number;
  soil_analysis: number;
  fruit_quality: number;
  chatbot: number;
}

export interface DailyEntry {
  date: string;
  count: number;
}

const DAILY_KEY = "analysis_daily";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function getAnalysisStats(): AnalysisStats {
  try {
    const raw = localStorage.getItem(userKey(STATS_KEY));
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    plant_disease: 0,
    animal_weight: 0,
    crop_recommendation: 0,
    soil_analysis: 0,
    fruit_quality: 0,
    chatbot: 0,
  };
}

export function incrementAnalysis(type: keyof AnalysisStats) {
  const stats = getAnalysisStats();
  stats[type] = (stats[type] || 0) + 1;
  localStorage.setItem(userKey(STATS_KEY), JSON.stringify(stats));

  // Track daily
  const daily = getDailyStats();
  const today = getToday();
  const existing = daily.find((d) => d.date === today);
  if (existing) {
    existing.count += 1;
  } else {
    daily.push({ date: today, count: 1 });
  }
  const trimmed = daily.slice(-30);
  localStorage.setItem(userKey(DAILY_KEY), JSON.stringify(trimmed));

  window.dispatchEvent(new Event("stats-updated"));
}

export function getDailyStats(): DailyEntry[] {
  try {
    const raw = localStorage.getItem(userKey(DAILY_KEY));
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function getTotalAnalyses(): number {
  const stats = getAnalysisStats();
  return Object.values(stats).reduce((a, b) => a + b, 0);
}
