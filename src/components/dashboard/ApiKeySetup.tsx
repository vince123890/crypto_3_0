"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Eye, EyeOff, CheckCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "csp_gemini_api_key";

export function getStoredApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function saveApiKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, key);
}

export function removeApiKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

interface ApiKeySetupProps {
  onKeySet?: (key: string) => void;
}

export function ApiKeySetup({ onKeySet }: ApiKeySetupProps) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [show, setShow] = useState(false);
  const [existing, setExisting] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredApiKey();
    setExisting(stored);
    if (stored) setSaved(true);
  }, []);

  function handleSave() {
    const trimmed = key.trim();
    if (!trimmed) return;
    saveApiKey(trimmed);
    setExisting(trimmed);
    setSaved(true);
    setKey("");
    onKeySet?.(trimmed);
  }

  function handleRemove() {
    removeApiKey();
    setExisting(null);
    setSaved(false);
    setKey("");
  }

  if (saved && existing) {
    return (
      <Card className="border-green-800/50">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-sm text-green-400">Gemini API Key tersimpan</span>
              <span className="text-xs text-gray-600 font-mono">
                {existing.slice(0, 8)}...{existing.slice(-4)}
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={handleRemove} className="text-gray-500">
              Ganti
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-800/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key size={16} className="text-yellow-400" />
          <span>Setup Gemini API Key</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-gray-400">
          Masukkan Google Gemini API key untuk mengaktifkan Signal Engine (AI analysis).
          Key disimpan hanya di browser Anda (localStorage) — tidak dikirim ke server mana pun selain Google.
        </p>

        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
        >
          <ExternalLink size={12} />
          Dapatkan API key gratis di Google AI Studio
        </a>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={show ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="AIza..."
              className={cn(
                "w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg",
                "text-gray-200 placeholder-gray-600",
                "focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30",
                "pr-10"
              )}
            />
            <button
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <Button onClick={handleSave} disabled={!key.trim()}>
            Simpan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
