import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "./style";

/**
 * Kinetic typography kit — teks penekanan yang MUNCUL dengan gerakan,
 * tapi tetap TERBACA penuh (bukan hiasan yang mengorbankan keterbacaan).
 *
 * Aturan keterbacaan (jangan dilanggar di episode):
 * - Kata yang sudah muncul TIDAK PERNAH hilang / keluar frame — hanya pop
 *   masuk sekali (scale spring -> 1, opacity -> 1), lalu diam.
 * - Kontras: putih + bayangan hitam tebal, atau warna aksen di atas
 *   background gelap. Jangan pakai warna tipis / kuning di atas krem.
 * - Maksimal 6 kata per blok, fontSize minimal 72, stagger 2–4 frame.
 * - Kata aksen dibedakan oleh WARNA + ukuran sedikit lebih besar, bukan
 *   oleh posisi yang meloncat-loncat.
 */

/** Satu baris kata kunci yang pop satu-per-satu (seperti big text S06 EP12, kini reusable). */
export const KineticText: React.FC<{
  words: string[];
  at?: number; // frame kata pertama muncul (relatif terhadap Sequence shot)
  stagger?: number; // jeda antar kata, frame (default 3)
  top?: number; // px dari atas frame (default 420)
  fontSize?: number; // default 104
  accent?: string[]; // kata aksen (cocok persis, tanpa case-sensitive) -> merah + 12% lebih besar
  accentColor?: string; // default C.alertRed
  tilt?: number; // kemiringan blok, derajat (default -2; 0 = lurus)
  paddingX?: number; // default 60
}> = ({ words, at = 0, stagger = 3, top = 420, fontSize = 104, accent = [], accentColor = C.alertRed, tilt = -2, paddingX = 60 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accentSet = new Set(accent.map((w) => w.toUpperCase()));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top, width: "100%", textAlign: "center", padding: `0 ${paddingX}px`, transform: `rotate(${tilt}deg)` }}>
        {words.map((w, i) => {
          const wordAt = at + i * stagger;
          const s = frame < wordAt ? 0 : spring({ frame: frame - wordAt, fps, config: { stiffness: 300, damping: 13 } });
          const isAccent = accentSet.has(w.toUpperCase());
          return (
            <span
              key={`${w}-${i}`}
              style={{
                display: "inline-block",
                fontFamily: FONT.title,
                fontSize: isAccent ? fontSize * 1.12 : fontSize,
                lineHeight: 1.05,
                color: isAccent ? accentColor : "white",
                textShadow: "0 6px 0 rgba(0,0,0,0.55)",
                transform: `scale(${s})`,
                opacity: s,
                margin: "0 0.14em",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Satu kalimat penekanan: kata kunci (keyword) berwarna aksen + pop lebih
 * besar + garis bawah yang tumbuh. Sisa kalimat tetap putih dan terbaca.
 * `keyword` harus substring persis dari `text` (case-sensitive).
 */
export const EmphasisLine: React.FC<{
  text: string;
  keyword: string;
  at?: number;
  top?: number;
  fontSize?: number;
  accentColor?: string;
  color?: string;
}> = ({ text, keyword, at = 0, top = 420, fontSize = 88, accentColor = C.capYellow, color = "white" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = text.indexOf(keyword);
  const before = idx >= 0 ? text.slice(0, idx) : text;
  const after = idx >= 0 ? text.slice(idx + keyword.length) : "";
  const fade = frame < at ? 0 : spring({ frame: frame - at, fps, config: { stiffness: 260, damping: 14 } });
  const pop = frame < at + 10 ? 0 : spring({ frame: frame - at - 10, fps, config: { stiffness: 300, damping: 12 } });
  const bar = interpolate(frame, [at + 14, at + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const base: React.CSSProperties = {
    fontFamily: FONT.title,
    fontSize,
    lineHeight: 1.15,
    color,
    textShadow: "0 6px 0 rgba(0,0,0,0.55)",
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top, width: "100%", textAlign: "center", padding: "0 60px", opacity: fade }}>
        <span style={base}>{before}</span>
        {idx >= 0 ? (
          <span style={{ display: "inline-block", position: "relative", ...base, color: accentColor, transform: `scale(${1 + 0.18 * pop})` }}>
            {keyword}
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: -14,
                height: 10,
                background: accentColor,
                transform: `scaleX(${bar})`,
                transformOrigin: "left",
                borderRadius: 5,
              }}
            />
          </span>
        ) : null}
        <span style={base}>{after}</span>
      </div>
    </AbsoluteFill>
  );
};
