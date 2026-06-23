"use client";

import { MarketData, Signal } from "@/types";
import { v4 as uuidv4 } from "uuid";

const SYSTEM_PROMPT = `You are an expert cryptocurrency trading analyst specializing in Smart Money Concepts (SMC), Wyckoff Method, and Bandarmologi (Indonesian smart money tracking).

Your task is to analyze multi-timeframe OHLCV data for BTC/USDT or ETH/USDT and generate precise trading signals.

## Analysis Framework

**Layer 1 — Structure Analysis (HTF Bias)**
- Analyze Daily + 4H to determine primary market direction
- Higher High (HH) + Higher Low (HL) = Bullish Structure
- Lower Low (LL) + Lower High (LH) = Bearish Structure
- Break of Structure (BOS) = trend confirmation
- Change of Character (CHoCH) = potential reversal

**Layer 2 — Liquidity Mapping**
- Buy-side Liquidity (BSL): stop clusters above equal highs / swing highs
- Sell-side Liquidity (SSL): stop clusters below equal lows / swing lows
- Liquidity Sweep: spike beyond level then reversal = smart money accumulation/distribution

**Layer 3 — Point of Interest (POI) Detection**
- Order Block (OB): last candle before an impulsive move
- Fair Value Gap (FVG): gap/imbalance between candles
- Breaker Block: broken OB acting as opposite S/R

**Layer 4 — Confluence Scoring (weights)**
- HTF Structure Alignment (4H + Daily same direction): 20%
- Liquidity Sweep Confirmed: 20%
- Order Block Retest: 15%
- Fair Value Gap Fill: 15%
- Volume Divergence at OB: 10%
- Fear & Greed alignment with bias: 10%
- Multi-TF Confluence (1H entry aligns 4H): 10%

Each factor scored: 1.0 strong, 0.7 moderate, 0.4 weak.
Threshold: <60% = WAIT | 60-74% = LOW | 75-84% = MEDIUM | 85-94% = HIGH | >=95% = PREMIUM

## Signal Rules
- Entry zone: OB range or FVG range
- Stop Loss: below OB low (LONG) or above OB high (SHORT), 0.5% buffer
- TP1: 1:1 R:R or nearest swing
- TP2: 1:2 R:R or next liquidity level
- TP3: 1:3 R:R or major liquidity pool
- If no valid setup: bias = "WAIT", set all prices to currentPrice, confidenceScore = 0

Output ONLY a valid JSON object, no markdown fences, no explanation. Schema:
{
  "bias": "LONG"|"SHORT"|"WAIT",
  "entryLow": number,
  "entryHigh": number,
  "stopLoss": number,
  "tp1": number,
  "tp2": number,
  "tp3": number,
  "rrRatio": number,
  "confidenceScore": number,
  "timeframeHTF": string,
  "timeframeEntry": string,
  "reasoning": string[],
  "invalidationNote": string
}`;

interface OHLCVRow {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function formatCandles(candles: OHLCVRow[], limit = 20): string {
  return candles
    .slice(-limit)
    .map((c) => `O:${c.open} H:${c.high} L:${c.low} C:${c.close} V:${c.volume.toFixed(0)}`)
    .join(" | ");
}

function buildPrompt(data: MarketData): string {
  const pairName = data.pair === "BTCUSDT" ? "BTC/USDT" : "ETH/USDT";
  return `Analyze ${pairName} and generate a trading signal.

Current Price: ${data.currentPrice}
24h Change: ${data.change24h}%
Fear & Greed Index: ${data.fearGreed.value}/100 (${data.fearGreed.label})

DAILY OHLCV (last 20 candles, oldest→newest):
${formatCandles(data.daily, 20)}

4H OHLCV (last 30 candles):
${formatCandles(data.h4, 30)}

1H OHLCV (last 30 candles):
${formatCandles(data.h1, 30)}

15M OHLCV (last 20 candles):
${formatCandles(data.m15, 20)}

Apply SMC + Bandarmologi analysis framework. Output JSON only.`;
}

export async function generateSignalClient(
  data: MarketData,
  apiKey: string
): Promise<Signal> {
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: buildPrompt(data) }],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
  };

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API HTTP ${res.status}: ${errText}`);
      }

      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Gemini returned empty response");

      // Strip markdown fences if present
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const signal: Signal = {
        id: uuidv4(),
        pair: data.pair,
        bias: parsed.bias ?? "WAIT",
        entryLow: Number(parsed.entryLow) || data.currentPrice,
        entryHigh: Number(parsed.entryHigh) || data.currentPrice,
        stopLoss: Number(parsed.stopLoss) || data.currentPrice,
        tp1: Number(parsed.tp1) || data.currentPrice,
        tp2: Number(parsed.tp2) || data.currentPrice,
        tp3: Number(parsed.tp3) || data.currentPrice,
        rrRatio: Number(parsed.rrRatio) || 0,
        confidenceScore: Number(parsed.confidenceScore) || 0,
        timeframeHTF: parsed.timeframeHTF ?? "4H",
        timeframeEntry: parsed.timeframeEntry ?? "1H",
        reasoning: Array.isArray(parsed.reasoning) ? parsed.reasoning : [],
        invalidationNote: parsed.invalidationNote ?? "",
        status: "active",
        fearGreedScore: data.fearGreed.value,
        fearGreedLabel: data.fearGreed.label,
        generatedAt: new Date().toISOString(),
        closedAt: null,
      };

      return signal;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  throw lastError ?? new Error("Gagal generate signal setelah 3 percobaan");
}
