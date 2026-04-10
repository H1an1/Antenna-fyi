"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bcudjloikmpcqwcptuyd.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdWRqbG9pa21wY3F3Y3B0dXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTg1NDgsImV4cCI6MjA4OTk5NDU0OH0.FaoC3QfpfHP1npNGjRchJAoAp2PdZtQe_WhP-t-GN1o";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

type Status = "loading" | "invalid" | "requesting" | "tracking" | "error" | "denied";

export default function LocateClient() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchRef = useRef<number | null>(null);

  // Verify token
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    sb.rpc("verify_bind_token", { p_token: token }).then(({ data, error: err }) => {
      if (err || !data?.valid) {
        setStatus("invalid");
        setError(data?.error || err?.message || "Invalid token");
        return;
      }
      setDeviceId(data.device_id);
      setStatus("requesting");
    });
  }, [token]);

  // Start GPS tracking once we have device_id
  const startTracking = useCallback(() => {
    if (!deviceId) return;

    if (!navigator.geolocation) {
      setStatus("error");
      setError("Geolocation not supported");
      return;
    }

    const updateLocation = (pos: GeolocationPosition) => {
      const lat = Math.round(pos.coords.latitude * 1000) / 1000;
      const lng = Math.round(pos.coords.longitude * 1000) / 1000;

      // Update profile location
      sb.rpc("upsert_profile_location", {
        p_device_id: deviceId,
        p_lng: lng,
        p_lat: lat,
      }).then(({ error: err }) => {
        if (err) console.error("Location update failed:", err);
      });

      // Notify agent via location_events (Realtime)
      sb.rpc("insert_location_event", {
        p_device_id: deviceId,
        p_lat: lat,
        p_lng: lng,
      }).then(({ error: err }) => {
        if (!err) {
          setLastUpdate(new Date().toLocaleTimeString());
          setStatus("tracking");
        }
      });
    };

    const onError = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setStatus("denied");
      } else {
        setStatus("error");
        setError(err.message);
      }
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(updateLocation, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
    });

    // Watch for updates
    watchRef.current = navigator.geolocation.watchPosition(updateLocation, onError, {
      enableHighAccuracy: true,
      maximumAge: 30000,
    });
  }, [deviceId]);

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
            <p className="font-mono text-sm text-[#c4a862] mb-2">📍 Location active</p>
            <p className="font-mono text-xs text-[#b8ad9e] mb-4">
              Your agent can now see your location. Keep this page open.
            </p>
            {lastUpdate && (
              <p className="font-mono text-[10px] text-[#b8ad9e]/50">
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
      </div>
    </main>
  );
}
