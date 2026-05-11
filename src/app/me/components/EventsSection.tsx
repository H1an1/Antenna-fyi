"use client";

import { EngravedPanel } from "@/app/components/EngravedPanel";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";

function SignalStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`signal-rule w-16 ${className}`} aria-hidden="true">
      <span className="sr-only">signal divider</span>
    </div>
  );
}

interface EventUpdate {
  event_id: string;
  event_name: string;
  code: string;
  status: "pending" | "active" | "rejected";
  role: "creator" | "cohost" | "participant";
  requires_approval: boolean;
  starts_at: string;
  ends_at: string;
  checked_in: boolean;
}

interface EventsSectionProps {
  deviceId: string;
  supabase: SupabaseClient;
  onEventTodoCountChange?: (count: number) => void;
  t: {
    eventsHeader: string;
    viewAll: string;
    noEventTasks: string;
    noEventTasksReason: string;
    eventStatusPending: string;
    eventStatusActive: string;
    eventStatusRejected: string;
    eventRoleOrganizer: string;
    eventNotCheckedIn: string;
    eventViewPage: string;
  };
}

const statusStyles: Record<EventUpdate["status"], string> = {
  pending: "border-amber-300/40 text-amber-200",
  active: "border-emerald-300/40 text-emerald-200",
  rejected: "border-red-300/40 text-red-200/60",
};

export function EventsSection({ deviceId, supabase, onEventTodoCountChange, t }: EventsSectionProps) {
  const [events, setEvents] = useState<EventUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_my_event_updates", {
        p_device_id: deviceId,
      });
      if (error) {
        console.error("Failed to fetch events:", error);
        return;
      }
      setEvents((data as EventUpdate[]) || []);
      const todoCount = ((data as EventUpdate[]) || []).filter(e => e.status === "pending" || (!e.checked_in && e.status === "active" && new Date(e.starts_at) <= new Date())).length;
      onEventTodoCountChange?.(todoCount);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, deviceId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const statusLabel = (status: EventUpdate["status"]) => {
    switch (status) {
      case "pending":
        return t.eventStatusPending;
      case "active":
        return t.eventStatusActive;
      case "rejected":
        return t.eventStatusRejected;
    }
  };

  const isStarted = (event: EventUpdate) => new Date(event.starts_at) <= new Date();

  const hasEvents = events.length > 0;

  return (
    <EngravedPanel quiet className="dashboard-side-card flex-1 p-5">
      <div className="dashboard-side-header mb-4 flex items-start justify-between gap-3 border-b border-[#d7b866]/14 pb-3">
        <div className="flex items-center gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
            {t.eventsHeader}
          </p>
          <SignalStrip />
        </div>
        {hasEvents && (
          <span className="font-mono text-xs text-[#d8cab8]">
            {events.length}
          </span>
        )}
      </div>
      <div className="dashboard-side-body pt-2">
        {loading ? (
          <p className="font-mono text-[0.875rem] text-[#A89888]">Loading...</p>
        ) : !hasEvents ? (
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="dashboard-side-empty-title mythic-soft-title font-serif text-xl leading-tight">
                {t.noEventTasks}
              </p>
              <SignalStrip className="hidden sm:flex" />
            </div>
            <p className="dashboard-side-empty-copy mt-2 font-mono text-[0.875rem] leading-[1.7] text-[#A89888]">
              {t.noEventTasksReason}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {events.map((event) => (
              <div
                key={event.event_id}
                className="flex items-center justify-between gap-3 border-b border-[#d7b866]/12 py-3 last:border-b-0"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-mono text-sm text-[#A89888] truncate">
                    {event.event_name}
                  </span>
                  {(event.role === "creator" || event.role === "cohost") && (
                    <span className="shrink-0 font-mono text-[10px] text-[#e2c46e]">
                      {t.eventRoleOrganizer}
                    </span>
                  )}
                  <span
                    className={`shrink-0 inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${statusStyles[event.status]}`}
                  >
                    {statusLabel(event.status)}
                  </span>
                  {event.status === "active" && isStarted(event) && !event.checked_in && (
                    <span className="shrink-0 font-mono text-[10px] text-amber-200/70">
                      {t.eventNotCheckedIn}
                    </span>
                  )}
                </div>
                <a
                  href={`https://antenna.fyi/events/${event.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 font-mono text-[11px] text-[#d8cab8] transition-colors hover:text-[#e2c46e]"
                >
                  {t.eventViewPage}
                  <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </EngravedPanel>
  );
}
