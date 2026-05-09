"use client";

import { EngravedPanel } from "@/app/components/EngravedPanel";
import { Check, Copy, KeyRound, Plus, X } from "lucide-react";
import { useState } from "react";

interface ApiKey {
  id: number;
  key: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
}

function SignalStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`signal-rule w-16 ${className}`} aria-hidden="true">
      <span className="sr-only">signal divider</span>
    </div>
  );
}

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  activeKeys: ApiKey[];
  setupPrompt: string | null;
  generateKey: () => void;
  revokeKey: (id: number) => void;
  dateLocale: string;
  t: {
    agentConnection: string;
    apiSettings: string;
    closeApiSettings: string;
    keys: string;
    generateKey: string;
    noActiveKeys: string;
    created: string;
    copy: string;
    copied: string;
    revoke: string;
    revokeConfirm: string;
    setupPromptTitle: string;
    generateKeyFirst: string;
    setupHint?: string;
  };
}

export function ApiKeyModal({
  open,
  onClose,
  activeKeys,
  setupPrompt,
  generateKey,
  revokeKey,
  dateLocale,
  t,
}: ApiKeyModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!open) return null;

  const copyToClipboard = async (text: string, id: string) => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10 backdrop-blur-sm">
      <EngravedPanel className="w-full max-w-2xl shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#d7b866]/16 p-5">
          <div>
            <div className="flex items-center gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                {t.agentConnection}
              </p>
              <SignalStrip />
            </div>
            <h2 className="mt-1 font-serif text-2xl text-[#A89888]">{t.apiSettings}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#d8cab8] transition-colors hover:text-[#A89888]"
            aria-label={t.closeApiSettings}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <EngravedPanel as="section" quiet className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-mono text-sm text-[#A89888]">{t.keys}</h3>
              <button
                onClick={generateKey}
                className="inline-flex items-center gap-2 border border-[#d7b866]/40 bg-[#d7b866]/10 px-3 py-2 font-mono text-xs text-[#e2c46e] transition-colors hover:bg-[#d7b866]/16"
              >
                <Plus size={14} />
                {t.generateKey}
              </button>
            </div>

            {activeKeys.length === 0 ? (
              <div className="border border-dashed border-[#d7b866]/24 bg-[#070807]/44 p-4">
                <p className="font-mono text-sm text-[#A89888]">{t.noActiveKeys}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeKeys.map((key) => (
                  <div key={key.id} className="border border-[#d7b866]/18 bg-[#070807]/48 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-all font-mono text-sm text-[#A89888]">
                          {key.key.slice(0, 10)}...{key.key.slice(-4)}
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-[#d8cab8]">
                          {key.name} · {t.created}{" "}
                          {new Date(key.created_at).toLocaleDateString(dateLocale)}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(key.key, key.key)}
                        className="text-[#d8cab8] transition-colors hover:text-[#e2c46e]"
                        aria-label={t.copy}
                      >
                        {copied === key.key ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(t.revokeConfirm)) revokeKey(key.id);
                      }}
                      className="mt-3 font-mono text-[11px] text-red-200 transition-colors hover:text-red-100"
                    >
                      {t.revoke}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </EngravedPanel>

          <EngravedPanel as="section" quiet className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-mono text-sm text-[#A89888]">{t.setupPromptTitle}</h3>
              {setupPrompt && (
                <button
                  onClick={() => copyToClipboard(setupPrompt, "setup")}
                  className="inline-flex items-center gap-2 border border-[#d7b866]/24 px-3 py-2 font-mono text-xs text-[#A89888] transition-colors hover:border-[#d7b866]/48 hover:text-[#e2c46e]"
                >
                  {copied === "setup" ? <Check size={14} /> : <Copy size={14} />}
                  {copied === "setup" ? t.copied : t.copy}
                </button>
              )}
            </div>
            {setupPrompt ? (
              <>
                <pre className="max-h-48 overflow-auto border border-[#d7b866]/18 bg-[#070807]/70 p-3 font-mono text-[11px] leading-relaxed text-[#d8cab8]">
                  {setupPrompt}
                </pre>
                {t.setupHint && (
                  <p className="mt-3 font-mono text-[11px] leading-relaxed text-[#d8cab8]/72">
                    {t.setupHint}
                  </p>
                )}
              </>
            ) : (
              <p className="font-mono text-sm leading-relaxed text-[#d8cab8]">
                {t.generateKeyFirst}
              </p>
            )}
          </EngravedPanel>
        </div>
      </EngravedPanel>
    </div>
  );
}
