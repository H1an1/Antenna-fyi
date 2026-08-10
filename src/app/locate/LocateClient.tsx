"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bcudjloikmpcqwcptuyd.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdWRqbG9pa21wY3F3Y3B0dXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTg1NDgsImV4cCI6MjA4OTk5NDU0OH0.FaoC3QfpfHP1npNGjRchJAoAp2PdZtQe_WhP-t-GN1o";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

type Status = "loading" | "invalid" | "requesting" | "tracking" | "error" | "denied";

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14&addressdetails=1`,
      { headers: { "Accept-Language": "en" } },
    );
    const data = await res.json();
    const a = data.address || {};
    const displayName = data.display_name || "";
    // Resolve city: state > city, but if city is a district, extract from display_name
    let city = a.state || a.city || a.town || a.village || a.county || "";
    if (city && city.endsWith("District")) {
      const parts = displayName.split(",").map((s: string) => s.trim());
      const distIdx = parts.findIndex((p: string) => p === city);
      if (distIdx >= 0 && distIdx + 1 < parts.length) {
        const candidate = parts[distIdx + 1];
        if (candidate && !/^\d+$/.test(candidate)) city = candidate;
      }
    }
    const area = a.neighbourhood || a.suburb || a.quarter || "";
    const parts = [area, city].filter(Boolean);
    return parts.length > 0 ? `Near ${parts.join(", ")}` : "";
  } catch {
    return "";
  }
}

export default function LocateClient() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string>("profile");
  const [eventCode, setEventCode] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [areaName, setAreaName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const watchRef = useRef<number | null>(null);

  const log = (msg: string) => setDebugLog((prev) => [...prev.slice(-4), msg]);

  // Verify token
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    log("Verifying token...");
    sb.rpc("verify_bind_token", { p_token: token }).then(({ data, error: err }) => {
      if (err) {
        log(`Token error: ${err.message}`);
        setStatus("invalid");
        setError(err.message);
        return;
      }
      if (!data || !data.valid) {
        log(`Token invalid: ${data?.error || "unknown"}`);
        setStatus("invalid");
        setError(data?.error || "Invalid token");
        return;
      }
      log(`Token valid: ${data.device_id} purpose=${data.purpose || "profile"}`);
      setDeviceId(data.device_id);
      setPurpose(data.purpose || "profile");
      setEventCode(data.event_code || null);
      setStatus("requesting");
    });
  }, [token]);

  const sendLocation = useCallback(
    async (lat: number, lng: number) => {
      if (!deviceId) return;
      const fLat = Math.round(lat * 1000) / 1000;
      const fLng = Math.round(lng * 1000) / 1000;

      setCoords({ lat: fLat, lng: fLng });
      log(`GPS: ${fLat}, ${fLng}`);

      // Reverse geocode for area name
      reverseGeocode(lat, lng).then((name) => {
        if (name) setAreaName(name);
      });

      // Branch on purpose
      if (purpose === "event" && eventCode) {
        // Update event location (no fuzzy — event GPS is precise)
        const { error: evtLocErr } = await sb.rpc("update_event_location", {
          p_code: eventCode,
          p_lat: lat,
          p_lng: lng,
        });
        if (evtLocErr) {
          log(`Event location write failed: ${evtLocErr.message}`);
        } else {
          log(`Event location updated ✓ (precise: ${lat}, ${lng})`);
        }

        // Still notify agent
        const { error: evtErr } = await sb.rpc("insert_location_event", {
          p_device_id: deviceId,
          p_lat: lat,
          p_lng: lng,
        });
        if (evtErr) {
          log(`Event notify failed: ${evtErr.message}`);
        } else {
          log("Agent notified ✓");
        }
      } else {
        // Update profile location
        const { error: locErr } = await sb.rpc("upsert_profile_location", {
          p_device_id: deviceId,
          p_lng: fLng,
          p_lat: fLat,
        });
        if (locErr) {
          log(`Location write failed: ${locErr.message}`);
        } else {
          log("Location updated ✓");
        }

        // Notify agent via location_events
        const { error: evtErr } = await sb.rpc("insert_location_event", {
          p_device_id: deviceId,
          p_lat: fLat,
          p_lng: fLng,
        });
        if (evtErr) {
          log(`Event write failed: ${evtErr.message}`);
        } else {
          log("Agent notified ✓");
        }
      }

      setLastUpdate(new Date().toLocaleTimeString());
      setStatus("tracking");
      setRefreshing(false);
    },
    [deviceId],
  );

  const onGeoError = useCallback((err: GeolocationPositionError) => {
    setRefreshing(false);
    log(`GPS error: ${err.message}`);
    if (err.code === err.PERMISSION_DENIED) {
      setStatus("denied");
    } else {
      setStatus("error");
      setError(err.message);
    }
  }, []);

  // Start GPS tracking once we have device_id
  const startTracking = useCallback(() => {
    if (!deviceId || !navigator.geolocation) {
      if (!navigator.geolocation) {
        setStatus("error");
        setError("Geolocation not supported");
      }
      return;
    }

    log("Requesting GPS...");
    navigator.geolocation.getCurrentPosition(
      (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
      onGeoError,
      { enableHighAccuracy: true, timeout: 10000 },
    );

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
      onGeoError,
      { enableHighAccuracy: true, maximumAge: 30000 },
    );
  }, [deviceId, sendLocation, onGeoError]);

  useEffect(() => {
    if (status === "requesting") {
      startTracking();
    }
    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, [status, startTracking]);

  // Manual refresh
  const handleRefresh = () => {
    if (!navigator.geolocation) return;
    setRefreshing(true);
    log("Refreshing GPS...");

    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
      onGeoError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
      onGeoError,
      { enableHighAccuracy: true, maximumAge: 30000 },
    );
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#1a1412" }}
    >
      <div
        className="max-w-md w-full p-8 text-center"
        style={{
          backgroundColor: "rgba(42, 34, 24, 0.85)",
          border: "1px solid rgba(184, 173, 158, 0.15)",
        }}
      >
        <h1 className="font-serif text-2xl text-[#e8e0d4] mb-6">Antenna</h1>

        {status === "loading" && (
          <p className="font-mono text-sm text-[#b8ad9e]">Verifying...</p>
        )}

        {status === "invalid" && (
          <div>
            <p className="font-mono text-sm text-[#c4a862] mb-2">⚠ Invalid or expired link</p>
            <p className="font-mono text-xs text-[#b8ad9e]">
              {error || "Ask your agent to generate a new one."}
            </p>
          </div>
        )}

        {status === "requesting" && (
          <div>
            <p className="font-mono text-sm text-[#b8ad9e] mb-4">
              Requesting location access...
            </p>
            <p className="font-mono text-xs text-[#b8ad9e]/60">
              Allow location access so nearby people can find you.
            </p>
          </div>
        )}

        {status === "tracking" && (
          <div>
            <p className="font-mono text-sm text-[#c4a862] mb-3">📍 Location active</p>

            {coords && (
              <div
                className="mb-4 py-3 px-4 text-left"
                style={{
                  backgroundColor: "rgba(196, 168, 98, 0.06)",
                  border: "1px solid rgba(184, 173, 158, 0.1)",
                }}
              >
                <p className="font-mono text-[12px] min-[1151px]:text-[11px] text-[#b8ad9e]/70 mb-1">Your location (blurred ~150m)</p>
                <p className="font-mono text-[13px] text-[#e8e0d4]">
                  {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
                </p>
                {areaName && (
                  <p className="font-mono text-[12px] min-[1151px]:text-[11px] text-[#c4a862] mt-1">{areaName}</p>
                )}
              </div>
            )}

            <p className="font-mono text-xs text-[#b8ad9e] mb-4">
              Your agent can now see your location. Keep this page open.
            </p>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="font-mono text-xs px-4 py-2 transition-colors max-[1150px]:min-h-11"
              style={{
                border: "1px solid rgba(184, 173, 158, 0.2)",
                color: refreshing ? "rgba(184, 173, 158, 0.3)" : "#c4a862",
                backgroundColor: refreshing
                  ? "transparent"
                  : "rgba(196, 168, 98, 0.06)",
                cursor: refreshing ? "not-allowed" : "pointer",
              }}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh location"}
            </button>

            {lastUpdate && (
              <p className="font-mono text-[12px] min-[1151px]:text-[10px] text-[#b8ad9e]/50 mt-3">
                Last update: {lastUpdate}
              </p>
            )}
          </div>
        )}

        {status === "denied" && (
          <div>
            <p className="font-mono text-sm text-[#c4a862] mb-2">⚠ Location denied</p>
            <p className="font-mono text-xs text-[#b8ad9e]">
              Enable location in your browser settings and refresh.
            </p>
          </div>
        )}

        {status === "error" && (
          <div>
            <p className="font-mono text-sm text-[#c4a862] mb-2">⚠ Error</p>
            <p className="font-mono text-xs text-[#b8ad9e]">{error}</p>
          </div>
        )}

        {/* Debug log — collapsed unless troubleshooting is needed. */}
        {debugLog.length > 0 && (
          <>
            <details className="mt-6 pt-4 text-left min-[1151px]:hidden" style={{ borderTop: "1px solid rgba(184, 173, 158, 0.05)" }}>
              <summary className="flex min-h-11 cursor-pointer items-center font-mono text-[12px] text-[#b8ad9e]/50">
                Debug log
              </summary>
              <div className="mt-2">
                {debugLog.map((msg, i) => (
                  <p key={i} className="font-mono text-[9px] text-[#b8ad9e]/30 leading-relaxed">
                    {msg}
                  </p>
                ))}
              </div>
            </details>
            <div className="mt-6 pt-4 max-[1150px]:hidden" style={{ borderTop: "1px solid rgba(184, 173, 158, 0.05)" }}>
              {debugLog.map((msg, i) => (
                <p key={i} className="font-mono text-[9px] text-[#b8ad9e]/30 leading-relaxed">
                  {msg}
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
