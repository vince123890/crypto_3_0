"use client";

import { useState } from "react";
import { useSignalStore } from "@/store/useSignalStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignalCard } from "./SignalCard";
import { exportSignalsCSV } from "@/lib/localStorage";
import { Pair } from "@/types";
import { Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterBias = "all" | "LONG" | "SHORT" | "WAIT";
type FilterPair = "all" | Pair;

export function SignalHistory() {
  const { signals, clearAllSignals, addToast } = useSignalStore();
  const [filterPair, setFilterPair] = useState<FilterPair>("all");
  const [filterBias, setFilterBias] = useState<FilterBias>("all");

  const filtered = signals.filter((s) => {
    if (filterPair !== "all" && s.pair !== filterPair) return false;
    if (filterBias !== "all" && s.bias !== filterBias) return false;
    return true;
  });

  function handleExport() {
    exportSignalsCSV(signals);
    addToast({ title: "Export CSV", description: `${signals.length} sinyal diekspor` });
  }

  function handleClear() {
    if (confirm("Hapus semua histori sinyal? Aksi ini tidak bisa dibatalkan.")) {
      clearAllSignals();
      addToast({ title: "Histori dihapus", description: "Semua sinyal telah dihapus" });
    }
  }

  const filterBtnClass = (active: boolean) =>
    cn(
      "px-3 py-1 text-xs rounded-full border transition-colors",
      active
        ? "bg-blue-600 border-blue-600 text-white"
        : "border-gray-700 text-gray-400 hover:border-gray-500"
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>Histori Signal ({filtered.length})</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} disabled={signals.length === 0}>
              <Download size={14} />
              CSV
            </Button>
            <Button size="sm" variant="danger" onClick={handleClear} disabled={signals.length === 0}>
              <Trash2 size={14} />
              Hapus
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="flex gap-1">
            {(["all", "BTCUSDT", "ETHUSDT"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPair(p)}
                className={filterBtnClass(filterPair === p)}
              >
                {p === "all" ? "Semua" : p === "BTCUSDT" ? "BTC" : "ETH"}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["all", "LONG", "SHORT"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setFilterBias(b)}
                className={filterBtnClass(filterBias === b)}
              >
                {b === "all" ? "Semua Bias" : b}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm">Belum ada histori sinyal</p>
            <p className="text-xs mt-1">Generate sinyal pertama Anda di atas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((signal) => (
              <SignalCard key={signal.id} signal={signal} compact />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
