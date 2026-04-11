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
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
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

  const sendLocation = useCallback(
    (lat: number, lng: number) => {
      if (!deviceId) return;
      const fLat = Math.round(lat * 1000) / 1000;
      const fLng = Math.round(lng * 1000) / 1000;

      setCoords({ lat: fLat, lng: fLng });

      // Update profile location
      sb.rpc("upsert_profile_location", {
        p_device_id: deviceId,
        p_lng: fLng,
        p_lat: fLat,
      }).then(({ error: err }) => {
        if (err) console.error("Location update failed:", err);
      });

      // Notify agent via location_events
      sb.rpc("insert_location_event", {
        p_device_id: deviceId,
        p_lat: fLat,
        p_lng: fLng,
      }).then(({ error: err }) => {
        if (!err) {
          setLastUpdate(new Date().toLocaleTimeString());
          setStatus("tracking");
          setRefreshing(false);
        }
      });
    },
    [deviceId],
  );

  const onGeoError = useCallback((err: GeolocationPositionError) => {
    setRefreshing(false);
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

    // Clear existing watch
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }

    // Force a fresh position (maximumAge: 0)
    navigator.geolocation.getCurrentPosition(
      (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
      onGeoError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );

    // Restart watch
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
                <p className="font-mono text-[11px] text-[#b8ad9e]/70 mb-1">Your location (blurred)</p>
                <p className="font-mono text-[13px] text-[#e8e0d4]">
                  {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
                </p>
              </div>
            )}

            <p className="font-mono text-xs text-[#b8ad9e] mb-4">
              Your agent can now see your location. Keep this page open.
            </p>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="font-mono text-xs px-4 py-2 transition-colors"
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
              <p className="font-mono text-[10px] text-[#b8ad9e]/50 mt-3">
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
