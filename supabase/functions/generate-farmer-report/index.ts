import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";
import { z } from "https://esm.sh/zod@3.25.76";

const API_BASE = "https://mahmoud123mahmoud-smartfarm-api.hf.space";

const RequestSchema = z.object({
  user_id: z.union([z.string(), z.number()]).transform((value) => String(value)).refine((value) => /^\d+$/.test(value), {
    message: "user_id must be a numeric value",
  }),
  period: z.enum(["all", "weekly", "monthly"]).default("all"),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sanitizePdfText = (value: string) =>
  value
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .trim();

const wrapLine = (value: string, maxLength = 78) => {
  if (value.length <= maxLength) return [value];
  const words = value.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
};

const buildPdf = (rawLines: string[]) => {
  const lines = rawLines.flatMap((line) => wrapLine(sanitizePdfText(line) || " "));
  const pageWidth = 595;
  const pageHeight = 842;
  const marginLeft = 48;
  const startY = 790;
  const lineHeight = 18;
  const fontSize = 12;

  const content = ["BT", `/F1 ${fontSize} Tf`, `${marginLeft} ${startY} Td`];
  lines.slice(0, 36).forEach((line, index) => {
    if (index === 0) {
      content.push(`(${line}) Tj`);
      return;
    }
    content.push(`0 -${lineHeight} Td`);
    content.push(`(${line}) Tj`);
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
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new TextEncoder().encode(pdf);
};

const toBase64 = (bytes: Uint8Array) => btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));

const periodLabel = (period: "all" | "weekly" | "monthly") => {
  if (period === "weekly") return "Weekly";
  if (period === "monthly") return "Monthly";
  return "All Time";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const query = Object.fromEntries(new URL(req.url).searchParams.entries());
    const body = req.method === "GET" ? {} : await req.json().catch(() => ({}));
    const parsed = RequestSchema.safeParse({
      user_id: body.user_id ?? query.user_id,
      period: body.period ?? query.period ?? "all",
    });

    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400);
    }

    const { user_id, period } = parsed.data;
    const statsResponse = await fetch(`${API_BASE}/farmer/dashboard-all/${user_id}`);
    if (!statsResponse.ok) {
      return json({ error: "Failed to fetch farmer summary" }, 502);
    }

    const stats = await statsResponse.json();
    const chart = Array.isArray(stats?.chart) ? stats.chart : [];
    const services = chart.length
      ? chart.map((item: { name?: string; value?: number }) => `${item.name || "Unknown"}: ${item.value ?? 0}`)
      : ["No service usage data available"];

    const lines = [
      "Smart Farm AI Farmer Report",
      `Period: ${periodLabel(period)}`,
      `Generated At: ${new Date().toISOString()}`,
      `Farmer ID: ${user_id}`,
      " ",
      "Dashboard Summary",
      `Total Analyses: ${stats?.statistics?.total ?? 0}`,
      `Analyses Today: ${stats?.statistics?.today ?? 0}`,
      `Most Used Service: ${stats?.statistics?.most_used ?? "N/A"}`,
      " ",
      "Service Usage",
      ...services,
      " ",
      "Weather Snapshot",
      `Location: ${stats?.weather?.location ?? "N/A"}`,
      `Temperature: ${stats?.weather?.temp ?? "N/A"}`,
      `Humidity: ${stats?.weather?.humidity ?? "N/A"}`,
      `Wind: ${stats?.weather?.wind ?? "N/A"}`,
    ];

    const pdfBytes = buildPdf(lines);
    const fileName = `Farm_Report_${user_id}_${period}_${new Date().toISOString().slice(0, 10)}.pdf`;

    return json({
      success: true,
      file_name: fileName,
      mime_type: "application/pdf",
      file_base64: toBase64(pdfBytes),
      file_size_bytes: pdfBytes.byteLength,
      report_type: period,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});