import { FearGreedData } from "@/types";

const API_URL = "https://api.alternative.me/fng/?limit=1";

export async function fetchFearGreed(): Promise<FearGreedData> {
  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const item = json.data?.[0];
    if (!item) throw new Error("No data");
    return {
      value: parseInt(item.value),
      label: item.value_classification,
      timestamp: item.timestamp,
    };
  } catch {
    // Fallback: neutral score
    return {
      value: 50,
      label: "Neutral",
      timestamp: new Date().toISOString(),
    };
  }
}
