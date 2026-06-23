"use client";

import { create } from "zustand";
import { Signal, LivePrice, FearGreedData, Preferences, Stats, Pair } from "@/types";
import {
  getSignals,
  saveSignal,
  updateSignalStatus,
  clearSignals,
  getPreferences,
  savePreferences,
  recalculateStats,
} from "@/lib/localStorage";

interface SignalStore {
  // State
  signals: Signal[];
  activeSignals: Signal[];
  livePrices: LivePrice[];
  fearGreed: FearGreedData | null;
  preferences: Preferences;
  stats: Stats | null;
  isGenerating: boolean;
  isLoadingPrices: boolean;
  selectedPair: Pair;
  toasts: Array<{ id: string; title: string; description: string; variant?: "default" | "destructive" }>;

  // Actions
  loadFromStorage: () => void;
  addSignal: (signal: Signal) => void;
  updateStatus: (id: string, status: Signal["status"], closedAt?: string) => void;
  clearAllSignals: () => void;
  setLivePrices: (prices: LivePrice[]) => void;
  setFearGreed: (data: FearGreedData) => void;
  setPreferences: (prefs: Partial<Preferences>) => void;
  setGenerating: (val: boolean) => void;
  setLoadingPrices: (val: boolean) => void;
  setSelectedPair: (pair: Pair) => void;
  addToast: (toast: { title: string; description: string; variant?: "default" | "destructive" }) => void;
  removeToast: (id: string) => void;
}

export const useSignalStore = create<SignalStore>((set, get) => ({
  signals: [],
  activeSignals: [],
  livePrices: [],
  fearGreed: null,
  preferences: getPreferences(),
  stats: null,
  isGenerating: false,
  isLoadingPrices: false,
  selectedPair: "BTCUSDT",
  toasts: [],

  loadFromStorage: () => {
    const signals = getSignals();
    const stats = recalculateStats(signals);
    set({
      signals,
      activeSignals: signals.filter((s) => s.status === "active"),
      stats,
      preferences: getPreferences(),
    });
  },

  addSignal: (signal) => {
    saveSignal(signal);
    const signals = getSignals();
    const stats = recalculateStats(signals);
    set({
      signals,
      activeSignals: signals.filter((s) => s.status === "active"),
      stats,
    });
  },

  updateStatus: (id, status, closedAt) => {
    updateSignalStatus(id, status, closedAt);
    const signals = getSignals();
    const stats = recalculateStats(signals);
    set({
      signals,
      activeSignals: signals.filter((s) => s.status === "active"),
      stats,
    });
  },

  clearAllSignals: () => {
    clearSignals();
    set({ signals: [], activeSignals: [], stats: null });
  },

  setLivePrices: (prices) => set({ livePrices: prices }),
  setFearGreed: (data) => set({ fearGreed: data }),

  setPreferences: (prefs) => {
    savePreferences(prefs);
    set({ preferences: { ...get().preferences, ...prefs } });
  },

  setGenerating: (val) => set({ isGenerating: val }),
  setLoadingPrices: (val) => set({ isLoadingPrices: val }),
  setSelectedPair: (pair) => set({ selectedPair: pair }),

  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    setTimeout(() => get().removeToast(id), 5000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
