"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSignalStore } from "@/store/useSignalStore";
import { getStoredApiKey } from "@/components/dashboard/ApiKeySetup";
import { generateSignalClient } from "@/lib/signalEngineClient";
import { MarketData, Pair } from "@/types";
import { Zap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function SignalGenerator() {
  const { isGenerating, setGenerating, addSignal, addToast, selectedPair, setSelectedPair } =
    useSignalStore();
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");

  const pairs: Pair[] = ["BTCUSDT", "ETHUSDT"];

  async function handleGenerate() {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      addToast({
        title: "API Key belum diset",
        description: "Masukkan Gemini API key di form di atas terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setStatusText("Mengambil data market...");
    try {
      // Step 1: Fetch OHLCV dari server (Binance → Next.js API route)
      const marketRes = await fetch("/api/ohlcv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pair: selectedPair }),
      });

      if (!marketRes.ok) {
        const err = await marketRes.json();
        throw new Error(err.error ?? "Gagal fetch data market");
      }

      const marketData: MarketData = await marketRes.json();

      // Step 2: Panggil Gemini langsung dari browser (bypass server Vercel)
      setStatusText("Menganalisis dengan Gemini 2.5...");
      const signal = await generateSignalClient(marketData, apiKey);

      addSignal(signal);
      setLastGenerated(new Date().toLocaleTimeString("id-ID"));

      addToast({
        title: `Signal ${signal.pair === "BTCUSDT" ? "BTC" : "ETH"} — ${signal.bias}`,
        description: `Confidence: ${signal.confidenceScore}% | Entry: ${signal.entryLow.toLocaleString()}`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      addToast({
        title: "Gagal generate signal",
        description: msg.length > 100 ? msg.slice(0, 100) + "..." : msg,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
      setStatusText("");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Signal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Pair selector */}
          <div className="flex rounded-lg border border-gray-700 overflow-hidden">
            {pairs.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPair(p)}
                disabled={isGenerating}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
                  selectedPair === p
                    ? "bg-blue-600 text-white"
                    : "bg-transparent text-gray-400 hover:bg-gray-800"
                )}
              >
                {p === "BTCUSDT" ? "BTC" : "ETH"}
              </button>
            ))}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 sm:flex-none"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                {statusText || "Menganalisis..."}
              </>
            ) : (
              <>
                <Zap size={16} />
                Analisis &amp; Generate Signal
              </>
            )}
          </Button>

          {lastGenerated && !isGenerating && (
            <span className="text-xs text-gray-500">
              Terakhir: {lastGenerated}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-600 mt-3">
          OHLCV diambil dari Binance → Gemini 2.5 Flash dijalankan langsung dari browser Anda
          (SMC + Bandarmologi framework).
        </p>
      </CardContent>
    </Card>
  );
}
