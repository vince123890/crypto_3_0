"use client";

import { useState } from "react";
import { useSignalStore } from "@/store/useSignalStore";
import { useAutoRefresh } from "@/lib/useAutoRefresh";
import { LivePriceCard } from "@/components/dashboard/LivePriceCard";
import { FearGreedMeter } from "@/components/dashboard/FearGreedMeter";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { SignalGenerator } from "@/components/signal/SignalGenerator";
import { SignalCard } from "@/components/signal/SignalCard";
import { SignalHistory } from "@/components/signal/SignalHistory";
import { TradingViewWidget } from "@/components/chart/TradingViewWidget";
import { ToastContainer } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
import { ApiKeySetup } from "@/components/dashboard/ApiKeySetup";
import { BarChart3, Clock, History, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "chart" | "history";

export default function Home() {
  const { livePrices, fearGreed, activeSignals, stats, selectedPair, isLoadingPrices } =
    useSignalStore();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useAutoRefresh();

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={16} /> },
    { id: "chart", label: "Chart", icon: <TrendingUp size={16} /> },
    { id: "history", label: "Histori", icon: <History size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">CryptoSignal Pro</h1>
              <p className="text-xs text-gray-500 mt-0.5">BTC/ETH Decision System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isLoadingPrices && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock size={12} className="animate-spin" />
                <span className="hidden sm:inline">Memperbarui...</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="hidden sm:inline">Live</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Disclaimer Banner */}
      {showDisclaimer && (
        <div className="bg-yellow-900/30 border-b border-yellow-800/50">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
            <p className="text-xs text-yellow-400">
              ⚠️ <strong>DISCLAIMER:</strong> CryptoSignal Pro adalah platform analisis teknikal edukatif.
              Seluruh sinyal <strong>BUKAN nasihat investasi</strong>. Keputusan trading sepenuhnya tanggung jawab Anda.
            </p>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="text-yellow-600 hover:text-yellow-400 text-xs flex-shrink-0"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-5">
            {/* Live Prices */}
            <div className="grid grid-cols-2 gap-3">
              {livePrices.length === 0
                ? [0, 1].map((i) => (
                    <div key={i} className="h-24 bg-gray-900 rounded-xl border border-gray-800 animate-pulse" />
                  ))
                : livePrices.map((price) => (
                    <LivePriceCard key={price.symbol} price={price} />
                  ))}
            </div>

            {/* Fear & Greed + Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FearGreedMeter data={fearGreed} />
              <StatsBar stats={stats} />
            </div>

            {/* API Key Setup */}
            <ApiKeySetup />

            {/* Signal Generator */}
            <SignalGenerator />

            {/* Active Signals */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Sinyal Aktif ({activeSignals.length})
              </h2>
              {activeSignals.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-3">🎯</div>
                    <p className="text-sm">Belum ada sinyal aktif</p>
                    <p className="text-xs mt-1">Klik &ldquo;Analisis &amp; Generate Signal&rdquo; untuk memulai</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {activeSignals.map((signal) => (
                    <SignalCard key={signal.id} signal={signal} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chart Tab */}
        {activeTab === "chart" && (
          <div className="space-y-3">
            <div className="flex gap-2 mb-4">
              {(["BTCUSDT", "ETHUSDT"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => useSignalStore.getState().setSelectedPair(p)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                    selectedPair === p
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-700 text-gray-400 hover:border-gray-500"
                  )}
                >
                  {p === "BTCUSDT" ? "BTC/USDT" : "ETH/USDT"}
                </button>
              ))}
            </div>
            <TradingViewWidget pair={selectedPair} />
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && <SignalHistory />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-600">
          <p>CryptoSignal Pro v1.0 — Powered by Gemini 2.5 Flash + Binance API</p>
          <p className="mt-1">
            Data market: Binance Public API | Sentiment: Fear &amp; Greed Index (alternative.me)
          </p>
          <p className="mt-2 text-gray-700">
            ⚠️ Bukan financial advice. Past performance tidak menjamin hasil masa depan.
          </p>
        </div>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
