"use client";

import { EngravedPanel } from "@/app/components/EngravedPanel";
import { Bell, KeyRound, RefreshCw, UserRound } from "lucide-react";

type GpsState = "idle" | "requesting" | "saved" | "error";

function SignalStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`signal-rule w-16 ${className}`} aria-hidden="true">
      <span className="sr-only">signal divider</span>
    </div>
  );
}

interface TodaySectionProps {
  hasKey: boolean;
  isProfileComplete: boolean;
  gpsState: GpsState;
  gpsActionLabel: string;
  onGenerateKey: () => void;
  onCompleteProfile: () => void;
  onUpdateGps: () => void;
  t: {
    agentConnection: string;
    firstTimeTitle: string;
    firstTimeBody: string;
    getYourKey: string;
    identityTitle: string;
    profileIncompleteTitle: string;
    profileIncompleteBody: string;
    completeProfile: string;
    todayTitle: string;
    todayReadyTitle: string;
    todayReadyBody: string;
    agentStatus: string;
    layer0Connected: string;
    layer0NeedsSetup: string;
  };
}

export function TodaySection({
  hasKey,
  isProfileComplete,
  gpsState,
  gpsActionLabel,
  onGenerateKey,
  onCompleteProfile,
  onUpdateGps,
  t,
}: TodaySectionProps) {
  if (!hasKey) {
    return (
      <EngravedPanel as="section" className="p-5 backdrop-blur-md md:p-6">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                {t.agentConnection}
              </p>
              <SignalStrip />
            </div>
            <h1 className="mt-2 font-serif text-3xl leading-tight text-[#A89888] md:text-4xl">
              {t.firstTimeTitle}
            </h1>
            <p className="mt-2 max-w-2xl font-mono text-sm leading-relaxed text-[#d8cab8]">
              {t.firstTimeBody}
            </p>
          </div>
          <button
            onClick={onGenerateKey}
            className="inline-flex items-center justify-center gap-2 border border-[#d7b866]/48 bg-[#d7b866]/12 px-5 py-3 font-mono text-sm text-[#e2c46e] transition-colors hover:bg-[#d7b866]/18"
          >
            <KeyRound size={16} />
            {t.getYourKey}
          </button>
        </div>
      </EngravedPanel>
    );
  }

  if (!isProfileComplete) {
    return (
      <EngravedPanel as="section" className="p-5 backdrop-blur-md md:p-6">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                {t.identityTitle}
              </p>
              <SignalStrip />
            </div>
            <h1 className="mt-2 font-serif text-3xl leading-tight text-[#A89888] md:text-4xl">
              {t.profileIncompleteTitle}
            </h1>
            <p className="mt-2 max-w-2xl font-mono text-sm leading-relaxed text-[#d8cab8]">
              {t.profileIncompleteBody}
            </p>
          </div>
          <button
            onClick={onCompleteProfile}
            className="inline-flex items-center justify-center gap-2 border border-[#d7b866]/48 bg-[#d7b866]/12 px-5 py-3 font-mono text-sm text-[#e2c46e] transition-colors hover:bg-[#d7b866]/18"
          >
            <UserRound size={16} />
            {t.completeProfile}
          </button>
        </div>
      </EngravedPanel>
    );
  }

  return (
    <EngravedPanel as="section" className="p-5 backdrop-blur-md md:p-6">
      <div>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="profile-card-kicker font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                {t.todayTitle}
              </p>
              <SignalStrip />
            </div>
            <h1 className="mythic-soft-title mt-1 font-serif text-3xl leading-tight md:text-4xl">
              {t.todayReadyTitle}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#d8cab8]">
            <span>{t.agentStatus}</span>
            <span className="inline-flex items-center gap-1 border border-emerald-300/35 bg-emerald-400/7 px-2.5 py-1 text-[10px] text-emerald-100">
              <span className="text-emerald-200">●</span>
              {t.layer0Connected}
            </span>
          </div>
        </div>
        <EngravedPanel quiet className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-[#e2c46e]">
              <Bell size={16} />
            </span>
            <div>
              <p className="font-mono text-sm text-[#A89888]">{t.todayReadyTitle}</p>
              <p className="mt-1 font-mono text-xs leading-relaxed text-[#d8cab8]">
                {t.todayReadyBody}
              </p>
            </div>
          </div>
          <button
            onClick={onUpdateGps}
            disabled={gpsState === "requesting"}
            className="inline-flex w-fit shrink-0 items-center gap-1.5 border border-[#d7b866]/24 px-2.5 py-1.5 font-mono text-[11px] text-[#A89888] transition-colors hover:border-[#d7b866]/50 hover:text-[#e2c46e] disabled:opacity-50"
          >
            <RefreshCw size={14} className={gpsState === "requesting" ? "animate-spin" : ""} />
            {gpsActionLabel}
          </button>
        </EngravedPanel>
      </div>
    </EngravedPanel>
  );
}
