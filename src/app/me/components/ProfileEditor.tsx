"use client";

import { EngravedPanel } from "@/app/components/EngravedPanel";
import {
  PROFILE_CONVERSATION_MAX_LENGTH,
  PROFILE_MORE_INFORMATION_MAX_LENGTH,
  PROFILE_DESCRIPTION_MAX_LENGTH,
  PROFILE_LOOKING_FOR_MAX_LENGTH,
  limitProfileConversation,
  limitMoreInformation,
  limitProfileDescription,
  limitProfileLookingFor,
  normalizeProfileSlug,
  sanitizeTags,
  type ProfileDraft,
} from "@/lib/profile";
import { AlertCircle, Check, MapPin, Plus, RefreshCw, Save, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type SaveState = "idle" | "saving" | "saved" | "partial";
type SlugStatus = "idle" | "checking" | "available" | "taken";
type GpsState = "idle" | "requesting" | "saved" | "error";

interface ProfileEditorProps {
  profileDraft: ProfileDraft;
  updateDraft: (patch: Partial<ProfileDraft>) => void;
  saveProfile: () => void;
  saveState: SaveState;
  setSlugManuallyEdited: (v: boolean) => void;
  checkSlugAvailability: (slug: string) => Promise<boolean>;
  t: {
    publicCard: string;
    displayName: string;
    publicSlug: string;
    publicSlugHint: string;
    line: (index: number) => string;
    interestTags: string;
    addTagPlaceholder: string;
    tagsMax: string;
    addInterestTag: string;
    signalDetails: string;
    city: string;
    cityPlaceholder: string;
    status: string;
    link: (index: number) => string;
    profileContext: string;
    contextBody: string;
    contextPlaceholder: string;
    contextAgentOnlyHint: string;
    saveProfile: string;
    saving: string;
    saved: string;
    savedLocally: string;
    active: string;
    quiet: string;
    slugTaken: string;
  };
  tagInput: string;
  setTagInput: (v: string) => void;
  onUpdateGps: () => void;
  gpsState: GpsState;
  gpsActionLabel: string;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-[#d8cab8]">
      {children}
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  helper?: string;
}) {
  const showCount = typeof maxLength === "number" && maxLength > 10;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#d8cab8]">
          {label}
        </label>
        {showCount && (
          <span className="shrink-0 font-mono text-[10px] text-[#d8cab8]/62">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full border border-[#d7b866]/24 bg-[#070807]/70 px-3 py-2.5 font-mono text-sm text-[#A89888] outline-none transition-colors placeholder:text-[#d8cab8]/48 focus:border-[#e2c46e]/70"
      />
      {helper && (
        <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-[#d8cab8]/72">{helper}</p>
      )}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#d8cab8]">
          {label}
        </label>
        {maxLength && (
          <span className="shrink-0 font-mono text-[10px] text-[#d8cab8]/62">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full resize-none border border-[#d7b866]/24 bg-[#070807]/70 px-3 py-2.5 font-mono text-sm leading-relaxed text-[#A89888] outline-none transition-colors placeholder:text-[#d8cab8]/48 focus:border-[#e2c46e]/70"
      />
    </div>
  );
}

export function ProfileEditor({
  profileDraft,
  updateDraft,
  saveProfile,
  saveState,
  setSlugManuallyEdited,
  checkSlugAvailability,
  t,
  tagInput,
  setTagInput,
  onUpdateGps,
  gpsState,
  gpsActionLabel,
}: ProfileEditorProps) {
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset slugStatus when profileSlug changes
  useEffect(() => {
    setSlugStatus("idle");
  }, [profileDraft.profileSlug]);

  const handleSlugBlur = useCallback(() => {
    const slug = profileDraft.profileSlug.trim();
    if (!slug) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setSlugStatus("checking");
      try {
        const available = await checkSlugAvailability(slug);
        setSlugStatus(available ? "available" : "taken");
      } catch {
        setSlugStatus("idle");
      }
    }, 500);
  }, [profileDraft.profileSlug, checkSlugAvailability]);
  const saveProfileLabel =
    saveState === "saving"
      ? t.saving
      : saveState === "saved"
        ? t.saved
        : saveState === "partial"
          ? t.savedLocally
          : t.saveProfile;

  const profileStatusLabel = profileDraft.isActive ? t.active : t.quiet;

  const addTag = () => {
    const nextTags = sanitizeTags([...profileDraft.interestTags, tagInput]);
    updateDraft({ interestTags: nextTags });
    setTagInput("");
  };

  return (
    <div className="space-y-5">
      <EngravedPanel quiet className="space-y-4 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e2c46e]">
          {t.publicCard}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label={t.displayName}
            value={profileDraft.displayName}
            onChange={(value) => updateDraft({ displayName: value })}
          />
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#d8cab8]">
                  {t.publicSlug}
                </label>
                {slugStatus === "checking" && (
                  <span className="font-mono text-[10px] text-[#d8cab8]/60">…</span>
                )}
                {slugStatus === "available" && (
                  <Check size={12} className="text-emerald-300" />
                )}
                {slugStatus === "taken" && (
                  <span className="inline-flex items-center gap-1">
                    <AlertCircle size={12} className="text-red-300" />
                    <span className="font-mono text-[10px] text-red-300">{t.slugTaken}</span>
                  </span>
                )}
              </div>
            </div>
            <input
              value={profileDraft.profileSlug}
              onChange={(event) => {
                setSlugManuallyEdited(true);
                updateDraft({ profileSlug: normalizeProfileSlug(event.target.value) });
              }}
              onBlur={handleSlugBlur}
              className={`w-full border bg-[#070807]/70 px-3 py-2.5 font-mono text-sm text-[#A89888] outline-none transition-colors placeholder:text-[#d8cab8]/48 focus:border-[#e2c46e]/70 ${
                slugStatus === "taken"
                  ? "border-red-400/60"
                  : "border-[#d7b866]/24"
              }`}
            />
            <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-[#d8cab8]/72">{t.publicSlugHint}</p>
          </div>
        </div>
        <div className="space-y-4 border-t border-[#d7b866]/12 pt-4">
          <TextArea
            label={t.line(1)}
            value={profileDraft.personalDescription}
            onChange={(value) => updateDraft({ personalDescription: limitProfileDescription(value) })}
            rows={4}
            maxLength={PROFILE_DESCRIPTION_MAX_LENGTH}
          />
        </div>

        <div>
          <FieldLabel>{t.interestTags}</FieldLabel>
          <div className="mb-2 flex flex-wrap gap-2">
            {profileDraft.interestTags.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  updateDraft({
                    interestTags: profileDraft.interestTags.filter((item) => item !== tag),
                  })
                }
                className="inline-flex items-center gap-1 border border-[#d7b866]/20 bg-[#d7b866]/8 px-2.5 py-1 font-mono text-[10px] text-[#d8cab8] transition-colors hover:border-red-300/45 hover:text-red-200"
              >
                {tag}
                <X size={12} />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  addTag();
                }
              }}
              disabled={profileDraft.interestTags.length >= 8}
              placeholder={
                profileDraft.interestTags.length >= 8 ? t.tagsMax : t.addTagPlaceholder
              }
              className="min-w-0 flex-1 border border-[#d7b866]/24 bg-[#070807]/70 px-3 py-2.5 font-mono text-sm text-[#A89888] outline-none placeholder:text-[#d8cab8]/48 focus:border-[#e2c46e]/70 disabled:opacity-50"
            />
            <button
              onClick={addTag}
              disabled={!tagInput.trim() || profileDraft.interestTags.length >= 8}
              className="inline-flex items-center justify-center border border-[#d7b866]/40 px-3 text-[#e2c46e] transition-colors hover:bg-[#d7b866]/12 disabled:opacity-40"
              aria-label={t.addInterestTag}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="grid gap-4 border-t border-[#d7b866]/12 pt-4 md:grid-cols-2">
          <TextArea
            label={t.line(2)}
            value={profileDraft.lookingFor}
            onChange={(value) => updateDraft({ lookingFor: limitProfileLookingFor(value) })}
            rows={3}
            maxLength={PROFILE_LOOKING_FOR_MAX_LENGTH}
          />
          <TextArea
            label={t.line(3)}
            value={profileDraft.ourConversation}
            onChange={(value) => updateDraft({ ourConversation: limitProfileConversation(value) })}
            rows={3}
            maxLength={PROFILE_CONVERSATION_MAX_LENGTH}
          />
        </div>
      </EngravedPanel>

      <EngravedPanel quiet className="profile-editor-signal-panel space-y-4 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e2c46e]">
          {t.signalDetails}
        </p>
        <div className="profile-editor-signal-grid grid gap-4">
          <div className="min-w-0">
            <FieldLabel>{t.city}</FieldLabel>
            <div className="profile-editor-location-row grid items-center gap-2">
              {profileDraft.city ? (
                <p className="flex min-w-0 items-center gap-2 border border-[#d7b866]/24 bg-[#070807]/70 px-3 py-2.5 font-mono text-sm text-[#A89888]">
                  <MapPin size={14} className="shrink-0 text-[#e2c46e]" />
                  <span className="truncate">{profileDraft.city}</span>
                </p>
              ) : (
                <p className="min-w-0 border border-dashed border-[#d7b866]/18 bg-[#070807]/44 px-3 py-2.5 font-mono text-sm text-[#d8cab8]/48">
                  {t.cityPlaceholder}
                </p>
              )}
              <button
                onClick={onUpdateGps}
                disabled={gpsState === "requesting"}
                className="profile-editor-gps-button inline-flex items-center gap-1.5 border border-[#d7b866]/24 px-3 py-2.5 font-mono text-xs text-[#A89888] transition-colors hover:border-[#d7b866]/50 hover:text-[#e2c46e] disabled:opacity-50"
              >
                <RefreshCw size={14} className={gpsState === "requesting" ? "animate-spin" : ""} />
                <span className="truncate">{gpsActionLabel}</span>
              </button>
            </div>
          </div>
          <div className="min-w-0">
            <FieldLabel>{t.status}</FieldLabel>
            <button
              onClick={() => updateDraft({ isActive: !profileDraft.isActive })}
              className={`profile-editor-status-button border font-mono transition-colors ${
                profileDraft.isActive
                  ? "border-emerald-300/35 text-emerald-200 hover:bg-emerald-400/8"
                  : "border-red-300/35 text-red-200 hover:bg-red-400/8"
              }`}
            >
              {profileStatusLabel}
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <TextInput
              key={index}
              label={t.link(index + 1)}
              value={profileDraft.links[index] || ""}
              onChange={(value) => {
                const links = [...profileDraft.links];
                links[index] = value;
                updateDraft({ links });
              }}
              placeholder="https://..."
            />
          ))}
        </div>
      </EngravedPanel>

      <EngravedPanel quiet className="space-y-4 p-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e2c46e]">
            {t.profileContext}
          </p>
          <p className="mt-1 font-mono text-[11px] leading-relaxed text-[#d8cab8]">
            {t.contextBody}
          </p>
        </div>
        <TextArea
          label={t.profileContext}
          value={profileDraft.context}
          onChange={(value) => updateDraft({ context: limitMoreInformation(value) })}
          placeholder={t.contextPlaceholder}
          rows={6}
          maxLength={PROFILE_MORE_INFORMATION_MAX_LENGTH}
        />
        <p className="border border-[#d7b866]/18 bg-black/10 p-3 font-mono text-[11px] leading-relaxed text-[#d8cab8]">
          {t.contextAgentOnlyHint}
        </p>
      </EngravedPanel>

      <div className="flex justify-end border-t border-[#d7b866]/16 pt-5">
        <button
          onClick={saveProfile}
          disabled={saveState === "saving"}
          className="inline-flex w-fit items-center gap-2 border border-[#d7b866]/44 bg-[#d7b866]/10 px-4 py-2.5 font-mono text-xs text-[#e2c46e] transition-colors hover:bg-[#d7b866]/16 disabled:opacity-50"
        >
          {saveState === "saved" ? <Check size={15} /> : <Save size={15} />}
          {saveProfileLabel}
        </button>
      </div>
    </div>
  );
}
