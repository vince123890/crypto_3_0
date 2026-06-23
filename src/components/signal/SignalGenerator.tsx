"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSignalStore } from "@/store/useSignalStore";
import { getStoredApiKey } from "@/components/dashboard/ApiKeySetup";
import { Pair } from "@/types";
import { Zap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function SignalGenerator() {
  const { isGenerating, setGenerating, addSignal, addToast, selectedPair, setSelectedPair } =
    useSignalStore();
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

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
    try {
      const res = await fetch("/api/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pair: selectedPair, apiKey }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Gagal generate signal");

      const signal = data.signal;
      addSignal(signal);
      setLastGenerated(new Date().toLocaleTimeString("id-ID"));

      addToast({
        title: `Signal ${signal.pair === "BTCUSDT" ? "BTC" : "ETH"} — ${signal.bias}`,
        description: `Confidence: ${signal.confidenceScore}% | Entry: ${signal.entryLow.toLocaleString()}`,
      });
    } catch (err) {
      addToast({
        title: "Gagal generate signal",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
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
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
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
                Menganalisis...
              </>
            ) : (
              <>
                <Zap size={16} />
                Analisis & Generate Signal
              </>
            )}
          </Button>

          {lastGenerated && (
            <span className="text-xs text-gray-500">
              Terakhir: {lastGenerated}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-600 mt-3">
          AI akan menganalisis OHLCV multi-timeframe (Daily, 4H, 1H, 15m) + Fear & Greed Index
          menggunakan framework SMC + Bandarmologi via Gemini 2.5 Flash.
        </p>
      </CardContent>
    </Card>
  );
}
