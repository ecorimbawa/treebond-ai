"use client";

import {
  Image as ImageIcon,
  LoaderCircle,
  RotateCcw,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toIpfsUrl } from "@/lib/web3/format";

type Status = "idle" | "uploading" | "done" | "error";

/**
 * Uploads a photo to IPFS on selection and reports back the `ipfs://<cid>`
 * URI — used anywhere a form used to make an operator type a CID by hand
 * (project cover, tree metadata, monitoring evidence).
 *
 * Deliberately not `required`: callers fall back to a placeholder CID
 * (lib/ipfs/placeholder.ts) when `value` is still null at submit time, so a
 * server with no Pinata key configured — or an operator who just wants to
 * skip it — doesn't newly block a flow that worked before this existed.
 */
export function ImageUploadField({
  label,
  hint,
  uploadLabel,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  /** Used as the Pinata pin name prefix, e.g. "project-hutan-klaten". */
  uploadLabel: string;
  value: string | null;
  onChange: (uri: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(value ? "done" : "idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("label", uploadLabel);
      const res = await fetch("/api/ipfs/upload", { method: "POST", body });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Upload failed");
      onChange(json.data.uri);
      setStatus("done");
    } catch (err) {
      onChange(null);
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
    }
  }

  return (
    <div>
      <span className="text-sm font-bold text-[#163D2A]">{label}</span>
      {hint && <p className="mt-0.5 text-xs text-[#929A94]">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <div className="mt-1.5 flex items-center gap-3">
        {value && status === "done" ? (
          // biome-ignore lint/performance/noImgElement: ipfs:// gateway URLs aren't in next.config's remotePatterns, and this is operator-only tooling, not the public site
          <img
            src={toIpfsUrl(value)}
            alt=""
            className="size-16 rounded-xl border border-[#e2e7e2] object-cover"
          />
        ) : (
          <span className="grid size-16 shrink-0 place-items-center rounded-xl border border-dashed border-[#d9e2da] text-[#929A94]">
            <ImageIcon size={20} aria-hidden="true" />
          </span>
        )}

        <div className="flex-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={status === "uploading"}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#d9e2da] bg-white px-3 text-xs font-bold text-[#163D2A] transition hover:border-[#246B45] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "uploading" ? (
              <LoaderCircle
                size={14}
                className="animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Upload size={14} aria-hidden="true" />
            )}
            {status === "uploading"
              ? "Uploading…"
              : status === "done"
                ? "Replace photo"
                : "Upload photo"}
          </button>

          {error && (
            <div className="mt-1.5">
              <p className="text-xs font-semibold text-[#B3402F]">{error}</p>
              {error.includes("not configured") && (
                <p className="mt-0.5 text-xs text-[#929A94]">
                  <RotateCcw
                    size={11}
                    className="mr-1 inline"
                    aria-hidden="true"
                  />
                  No problem — a placeholder will be used instead.
                </p>
              )}
            </div>
          )}
          {!error && status === "idle" && (
            <p className="mt-1 text-[11px] text-[#929A94]">
              Optional — a placeholder is used if you skip this.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
