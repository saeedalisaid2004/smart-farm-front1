import { getFarmerStats, getExternalUserId } from "./smartFarmApi";

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

export interface ChartItem {
  name: string;
  value: number;
}

export interface DashboardData {
  statistics: {
    total: number;
    today: number;
    most_used: string;
  };
  weather: {
    temp: string;
    location: string;
    humidity: string;
    wind: string;
    advice: string;
    level: string;
    desc: string;
  } | null;
  services: AnalysisStats;
  chart: ChartItem[];
}

export interface DailyEntry {
  date: string;
  count: number;
}

const DAILY_KEY = "analysis_daily";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

// Local cache read (fallback)
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

// Fetch all dashboard data (stats + weather) from unified API
export async function fetchDashboardData(): Promise<DashboardData> {
  const userId = getExternalUserId();
  const fallbackStats = getAnalysisStats();
  const fallback: DashboardData = {
    statistics: {
      total: Object.values(fallbackStats).reduce((a, b) => a + b, 0),
      today: 0,
      most_used: "N/A",
    },
    weather: null,
    services: fallbackStats,
    chart: [],
  };

  if (!userId) return fallback;

  try {
    const data = await getFarmerStats(userId);

    // New unified format: { statistics: {...}, weather: {...} }
    // Also support old format: { services_summary: {...}, top_cards: {...} }
    const summary = data?.services_summary || {};
    const stats: AnalysisStats = {
      plant_disease: summary?.Plants ?? 0,
      animal_weight: summary?.Animals ?? 0,
      crop_recommendation: summary?.Crops ?? 0,
      soil_analysis: summary?.Soil ?? 0,
      fruit_quality: summary?.Fruit ?? 0,
      chatbot: 0,
    };

    // Cache services locally
    localStorage.setItem(userKey(STATS_KEY), JSON.stringify(stats));
    window.dispatchEvent(new Event("stats-updated"));

    const apiStats = data?.statistics;
    const totalFromApi = apiStats?.total ?? Object.values(stats).reduce((a, b) => a + b, 0);

    const chartData: ChartItem[] = Array.isArray(data?.chart) ? data.chart : [];

    return {
      statistics: {
        total: totalFromApi,
        today: apiStats?.today ?? 0,
        most_used: apiStats?.most_used || "N/A",
      },
      weather: data?.weather || null,
      services: stats,
      chart: chartData,
    };
  } catch {
    return fallback;
  }
}

// Keep backward compat
export async function fetchAndSyncStats(): Promise<AnalysisStats> {
  const result = await fetchDashboardData();
  return result.services;
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
