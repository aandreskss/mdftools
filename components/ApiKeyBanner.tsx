"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";

export default function ApiKeyBanner() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/brand-profile")
      .then((r) => r.json())
      .then((data) => setHasKey(!!data?.hasApiKey))
      .catch(() => setHasKey(null));
  }, []);

  if (hasKey !== false || dismissed) return null;

  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 border-b border-amber-500/25">
      <AlertTriangle size={15} className="text-amber-400 flex-shrink-0" />
      <p className="text-amber-300 text-sm flex-1">
        <span className="font-semibold">API Key no configurada.</span>{" "}
        Para usar los agentes de IA necesitas agregar tu API key de Anthropic.{" "}
        <Link
          href="/dashboard/perfil"
          className="underline underline-offset-2 hover:text-amber-200 transition-colors"
        >
          Ir a Perfil de Marca →
        </Link>
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-500 hover:text-amber-300 transition-colors flex-shrink-0"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
    </div>
  );
}
