import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { MarketData, Signal, OHLCVCandle, Pair } from "@/types";
import { v4 as uuidv4 } from "uuid";

const SYSTEM_PROMPT = `You are an expert cryptocurrency trading analyst specializing in Smart Money Concepts (SMC), Wyckoff Method, and Bandarmologi (Indonesian smart money tracking).

Your task is to analyze multi-timeframe OHLCV data for BTC/USDT or ETH/USDT and generate precise trading signals.

## Analysis Framework

**Layer 1 — Structure Analysis (HTF Bias)**
- Analyze Daily + 4H to determine primary market direction
- Identify: Higher High (HH), Higher Low (HL) = Bullish Structure
- Identify: Lower Low (LL), Lower High (LH) = Bearish Structure
- Detect: Break of Structure (BOS) = trend confirmation
- Detect: Change of Character (CHoCH) = potential reversal

**Layer 2 — Liquidity Mapping**
- Buy-side Liquidity (BSL): clusters of stops above equal highs / swing highs
- Sell-side Liquidity (SSL): clusters of stops below equal lows / swing lows
- Liquidity Sweep: price spike beyond level then reversal = smart money accumulation/distribution

**Layer 3 — Point of Interest (POI) Detection**
- Order Block (OB): last bearish candle before bullish impulse (demand OB) or last bullish candle before bearish impulse (supply OB)
- Fair Value Gap (FVG): gap between candle 1 high and candle 3 low (bullish FVG) or candle 1 low and candle 3 high (bearish FVG)
- Breaker Block: broken OB that now acts as opposite S/R

**Layer 4 — Confluence Scoring**
- Minimum 3 factors required for a valid signal
- High confidence signal requires 5+ factors converging

## Signal Rules
- Entry zone: OB range or FVG range (2 price levels)
- Stop Loss: below OB low (for LONG) or above OB high (for SHORT), with 0.5% buffer
- TP1: nearest swing high/low or 1:1 R:R
- TP2: next liquidity level or 1:2 R:R
- TP3: major liquidity pool or 1:3 R:R
- If no valid setup exists, output bias = "WAIT"

## Confidence Score Weights
- HTF Structure Alignment (4H + Daily same direction): 20%
- Liquidity Sweep Confirmed: 20%
- Order Block Retest: 15%
- Fair Value Gap Fill: 15%
- Volume Divergence (decreasing volume at OB): 10%
- Fear & Greed alignment with bias: 10%
- Multi-TF Confluence (1H entry aligns with 4H): 10%

Each factor: 1.0 (strong), 0.7 (moderate), 0.4 (weak)
Threshold: <60% = WAIT, 60-74% = LOW, 75-84% = MEDIUM, 85-94% = HIGH, >=95% = PREMIUM

Output ONLY valid JSON matching the schema. No markdown, no explanation outside JSON.`;

function formatCandles(candles: OHLCVCandle[], limit = 20): string {
  return candles
    .slice(-limit)
    .map(
      (c) =>
        `O:${c.open} H:${c.high} L:${c.low} C:${c.close} V:${c.volume.toFixed(0)}`
    )
    .join(" | ");
}

function buildPrompt(data: MarketData): string {
  const pairName = data.pair === "BTCUSDT" ? "BTC/USDT" : "ETH/USDT";
  return `Analyze ${pairName} and generate a trading signal.

Current Price: ${data.currentPrice}
24h Change: ${data.change24h}%
Fear & Greed Index: ${data.fearGreed.value}/100 (${data.fearGreed.label})

DAILY OHLCV (last 20 candles):
${formatCandles(data.daily, 20)}

4H OHLCV (last 30 candles):
${formatCandles(data.h4, 30)}

1H OHLCV (last 30 candles):
${formatCandles(data.h1, 30)}

15M OHLCV (last 20 candles):
${formatCandles(data.m15, 20)}

Apply SMC + Bandarmologi analysis. Generate signal or output WAIT if no valid setup.`;
}

const signalSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    bias: { type: SchemaType.STRING },
    entryLow: { type: SchemaType.NUMBER },
    entryHigh: { type: SchemaType.NUMBER },
    stopLoss: { type: SchemaType.NUMBER },
    tp1: { type: SchemaType.NUMBER },
    tp2: { type: SchemaType.NUMBER },
    tp3: { type: SchemaType.NUMBER },
    rrRatio: { type: SchemaType.NUMBER },
    confidenceScore: { type: SchemaType.NUMBER },
    timeframeHTF: { type: SchemaType.STRING },
    timeframeEntry: { type: SchemaType.STRING },
    reasoning: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    invalidationNote: { type: SchemaType.STRING },
  },
  required: [
    "bias",
    "entryLow",
    "entryHigh",
    "stopLoss",
    "tp1",
    "tp2",
    "tp3",
    "rrRatio",
    "confidenceScore",
    "timeframeHTF",
    "timeframeEntry",
    "reasoning",
    "invalidationNote",
  ],
};

async function callGeminiWithRetry(
  model: ReturnType<InstanceType<typeof GoogleGenerativeAI>["getGenerativeModel"]>,
  prompt: string,
  maxRetries = 3
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error("Max retries exceeded");
}

export async function generateSignal(
  data: MarketData,
  apiKey: string
): Promise<Signal> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: signalSchema,
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
  });

  const prompt = buildPrompt(data);
  const text = await callGeminiWithRetry(model, prompt);

  let parsed: Partial<Signal>;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON response from Gemini");
  }

  const signal: Signal = {
    id: uuidv4(),
    pair: data.pair as Pair,
    bias: parsed.bias ?? "WAIT",
    entryLow: parsed.entryLow ?? data.currentPrice,
    entryHigh: parsed.entryHigh ?? data.currentPrice,
    stopLoss: parsed.stopLoss ?? data.currentPrice,
    tp1: parsed.tp1 ?? data.currentPrice,
    tp2: parsed.tp2 ?? data.currentPrice,
    tp3: parsed.tp3 ?? data.currentPrice,
    rrRatio: parsed.rrRatio ?? 0,
    confidenceScore: parsed.confidenceScore ?? 0,
    timeframeHTF: parsed.timeframeHTF ?? "4H",
    timeframeEntry: parsed.timeframeEntry ?? "1H",
    reasoning: parsed.reasoning ?? [],
    invalidationNote: parsed.invalidationNote ?? "",
    status: "active",
    fearGreedScore: data.fearGreed.value,
    fearGreedLabel: data.fearGreed.label,
    generatedAt: new Date().toISOString(),
    closedAt: null,
  };

  return signal;
}
