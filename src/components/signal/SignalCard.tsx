"use client";

import { Signal } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  formatPrice,
  formatDate,
  getConfidenceColor,
  getConfidenceLabel,
  getStatusLabel,
  cn,
} from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useSignalStore } from "@/store/useSignalStore";

interface SignalCardProps {
  signal: Signal;
  compact?: boolean;
}

function getBiasIcon(bias: string) {
  if (bias === "LONG") return <TrendingUp size={16} className="text-green-400" />;
  if (bias === "SHORT") return <TrendingDown size={16} className="text-red-400" />;
  return <Minus size={16} className="text-gray-400" />;
}

function getBiasBadgeVariant(bias: string): "success" | "danger" | "neutral" {
  if (bias === "LONG") return "success";
  if (bias === "SHORT") return "danger";
  return "neutral";
}

function getConfidenceBarColor(score: number): string {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 75) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

export function SignalCard({ signal, compact = false }: SignalCardProps) {
  const [expanded, setExpanded] = useState(!compact);
  const { updateStatus, addToast } = useSignalStore();
  const pairLabel = signal.pair === "BTCUSDT" ? "BTC/USDT" : "ETH/USDT";

  const handleUpdateStatus = (status: Signal["status"]) => {
    updateStatus(signal.id, status, new Date().toISOString());
    addToast({
      title: "Status diperbarui",
      description: `Signal ${pairLabel} → ${getStatusLabel(status)}`,
    });
  };

  return (
    <Card className={cn(signal.status !== "active" && "opacity-70")}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getBiasIcon(signal.bias)}
            <span className="font-bold text-white">{pairLabel}</span>
            <Badge variant={getBiasBadgeVariant(signal.bias)}>{signal.bias}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={signal.status === "active" ? "default" : signal.status.includes("tp") ? "success" : "danger"}>
              {getStatusLabel(signal.status)}
            </Badge>
            {compact && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gray-500 hover:text-gray-300"
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
          </div>
        </div>

        {/* Confidence */}
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-500">Confidence Score</span>
            <span className={cn("text-xs font-bold", getConfidenceColor(signal.confidenceScore))}>
              {signal.confidenceScore}% — {getConfidenceLabel(signal.confidenceScore)}
            </span>
          </div>
          <Progress
            value={signal.confidenceScore}
            barClassName={getConfidenceBarColor(signal.confidenceScore)}
          />
        </div>

        {/* Entry/SL/TP */}
        {expanded && (
          <>
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div className="bg-gray-800/60 rounded-lg p-2.5">
                <div className="text-xs text-gray-500 mb-1">Entry Zone</div>
                <div className="text-white font-mono text-xs">
                  {formatPrice(signal.entryLow, signal.pair)} —
                </div>
                <div className="text-white font-mono text-xs">
                  {formatPrice(signal.entryHigh, signal.pair)}
                </div>
              </div>
              <div className="bg-red-900/20 border border-red-900/40 rounded-lg p-2.5">
                <div className="text-xs text-red-400 mb-1">Stop Loss</div>
                <div className="text-red-300 font-mono text-xs font-semibold">
                  {formatPrice(signal.stopLoss, signal.pair)}
                </div>
              </div>
              <div className="bg-green-900/20 border border-green-900/40 rounded-lg p-2.5">
                <div className="text-xs text-green-400 mb-1">TP1 / TP2</div>
                <div className="text-green-300 font-mono text-xs">
                  {formatPrice(signal.tp1, signal.pair)}
                </div>
                <div className="text-green-300 font-mono text-xs">
                  {formatPrice(signal.tp2, signal.pair)}
                </div>
              </div>
              <div className="bg-emerald-900/20 border border-emerald-900/40 rounded-lg p-2.5">
                <div className="text-xs text-emerald-400 mb-1">TP3 / R:R</div>
                <div className="text-emerald-300 font-mono text-xs">
                  {formatPrice(signal.tp3, signal.pair)}
                </div>
                <div className="text-emerald-300 font-mono text-xs font-bold">
                  1:{signal.rrRatio.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Reasoning */}
            {signal.reasoning.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1.5">Alasan Signal</div>
                <ul className="space-y-1">
                  {signal.reasoning.map((r, i) => (
                    <li key={i} className="flex gap-1.5 text-xs text-gray-300">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Invalidation */}
            {signal.invalidationNote && (
              <div className="mb-3 bg-yellow-900/20 border border-yellow-800/40 rounded-lg px-3 py-2">
                <span className="text-xs text-yellow-400 font-semibold">⚠️ Invalidasi: </span>
                <span className="text-xs text-yellow-300">{signal.invalidationNote}</span>
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>TF: {signal.timeframeHTF} → {signal.timeframeEntry}</span>
              <span>F&G: {signal.fearGreedScore} ({signal.fearGreedLabel})</span>
            </div>
            <div className="text-xs text-gray-600 mb-3">{formatDate(signal.generatedAt)}</div>

            {/* Disclaimer */}
            <div className="text-xs text-gray-600 italic mb-3">
              ⚠️ Bukan financial advice. Keputusan trading sepenuhnya tanggung jawab Anda.
            </div>

            {/* Actions */}
            {signal.status === "active" && (
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="success" onClick={() => handleUpdateStatus("tp1_hit")}>
                  TP1 Hit
                </Button>
                <Button size="sm" variant="success" onClick={() => handleUpdateStatus("tp2_hit")}>
                  TP2 Hit
                </Button>
                <Button size="sm" variant="success" onClick={() => handleUpdateStatus("tp3_hit")}>
                  TP3 Hit
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleUpdateStatus("sl_hit")}>
                  SL Hit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus("expired")}>
                  Expired
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
