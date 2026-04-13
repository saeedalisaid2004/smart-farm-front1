import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

const API_BASE = "https://mahmoud123mahmoud-smartfarm-api.hf.space";
const REPORTS_BUCKET = "farmer-reports";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapePdfText = (value: string) => value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const buildPdf = (lines: string[]) => {
  const pageWidth = 595;
  const pageHeight = 842;
  const marginLeft = 48;
  const startY = 790;
  const lineHeight = 20;
  const fontSize = 12;

  const content = ["BT", `/F1 ${fontSize} Tf`, `${marginLeft} ${startY} Td`];
  lines.forEach((line, index) => {
    const safe = escapePdfText(line);
    if (index === 0) {
      content.push(`(${safe}) Tj`);
    } else {
      content.push(`0 -${lineHeight} Td`);
      content.push(`(${safe}) Tj`);
    }
  });
  content.push("ET");

  const stream = content.join("\n");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj`,
    `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += `${obj}\n`;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new TextEncoder().encode(pdf);
};

const parsePeriodLabel = (period: string) => {
  if (period === "weekly") return "Weekly";
  if (period === "monthly") return "Monthly";
  return "All Time";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const externalUserId = url.searchParams.get("user_id");
    const period = url.searchParams.get("period") || "all";

    if (!externalUserId) {
      return json({ error: "user_id is required" }, 400);
    }

    const statsRes = await fetch(`${API_BASE}/farmer/dashboard-all/${externalUserId}`);
    const statsData = statsRes.ok ? await statsRes.json() : null;

    const total = statsData?.statistics?.total ?? 0;
    const today = statsData?.statistics?.today ?? 0;
    const mostUsed = statsData?.statistics?.most_used ?? "N/A";
    const weather = statsData?.weather;
    const chart = Array.isArray(statsData?.chart) ? statsData.chart : [];

    const chartLines = chart.length
      ? chart.map((item: { name?: string; value?: number }) => `- ${item.name || "Unknown"}: ${item.value ?? 0}`)
      : ["- No chart data available"];

    const lines = [
      `Smart Farm AI - Farmer Report (${parsePeriodLabel(period)})`,
      `Generated: ${new Date().toISOString()}`,
      `Farmer ID: ${externalUserId}`,
      "",
      `Total analyses: ${total}`,
      `Analyses today: ${today}`,
      `Most used service: ${mostUsed}`,
      "",
      "Service usage:",
      ...chartLines,
      "",
      "Weather:",
      `Location: ${weather?.location || "N/A"}`,
      `Temperature: ${weather?.temp || "N/A"}`,
      `Humidity: ${weather?.humidity || "N/A"}`,
      `Wind: ${weather?.wind || "N/A"}`,
      `Advice: ${weather?.advice || "N/A"}`,
    ];

    const pdfBytes = buildPdf(lines.slice(0, 30));
    const fileName = `farmer-report-${externalUserId}-${period}-${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from(REPORTS_BUCKET)
      .upload(fileName, pdfBytes, { contentType: "application/pdf", upsert: false });

    if (uploadError && !String(uploadError.message).toLowerCase().includes("bucket not found")) {
      throw uploadError;
    }

    let publicUrl = null;
    try {
      const { data } = supabase.storage.from(REPORTS_BUCKET).getPublicUrl(fileName);
      publicUrl = data.publicUrl;
    } catch {
      publicUrl = null;
    }

    return json({
      success: true,
      file_name: fileName,
      file_url: publicUrl,
      download_url: publicUrl,
      storage_path: fileName,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});