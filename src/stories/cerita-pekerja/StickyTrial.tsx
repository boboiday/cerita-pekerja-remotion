import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "../../kit/style";
import { PakSipir, PrisonCell, Udin, type FaceMood } from "../../kit/StickyPrison";

/**
 * StickyTrial — "Penjara Bintang Lima" (TRIAL gaya The Sticky, PREVIEW — bukan untuk diposting).
 * 1080x1920, 30fps, 887 frame (29,54 dtk). Satu lokasi (sel penjara), satu angle
 * statis + push-in halus. 2 karakter ORIGINAL (SVG flat): UDIN (jumpsuit oranye)
 * + PAK SIPIR (navy, kumis). Dialog 8 baris, caption karaoke kata-per-kata
 * (kata aktif HIJAU, sisanya putih).
 *
 * TIMING ASLI dari alignment.json (faster-whisper small, 47 kata):
 * VO Charon (Sipir) + Puck (Udin), voice.mp3 29,538 dtk, public/sticky-trial-voice.mp3.
 * Catatan alignment: "Sekarang" terdeteksi di 0,000 (artefak Whisper) -> di-floor ke
 * start baris (frame 15). "Hahaha!" didengar "Ha ha ha ha" -> caption satu kata
 * "HAHAHA!" di frame 799. Teks caption mengikuti naskah ("lima!", "Hah!").
 */

// ---- easing helpers (semua transisi pakai ini, jangan linear) ----
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeInOutCubic = (t: number) => {
  const u = clamp01(t);
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
};
const easeOutBack = (t: number, c1 = 1.2) => {
  const u = clamp01(t);
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));

// ---- TIMING (frame @30fps, dari alignment.json) ----
// L1 Sipir 15-146 · L2 Udin 146-224 · L3 Sipir 224-325 · L4 Udin 325-464
// L5 Sipir 464-597 · L6 Udin 597-705 · L7 Sipir 705-793 · L8 Udin 793-887
export const STICKY_TRIAL_TOTAL = 887;

type CapWord = { text: string; at: number };
type CapLine = { start: number; end: number; words: CapWord[] };

const LINES: CapLine[] = [
  { start: 15, end: 146, words: [
    { text: "Sekarang", at: 15 }, { text: "kamu", at: 45 }, { text: "bebas.", at: 62 },
    { text: "boleh", at: 91 }, { text: "pulang.", at: 105 },
  ] },
  { start: 146, end: 224, words: [
    { text: "Nggak,", at: 146 }, { text: "Pak.", at: 165 }, { text: "Saya", at: 175 },
    { text: "mau", at: 179 }, { text: "di", at: 183 }, { text: "sini", at: 188 }, { text: "aja.", at: 193 },
  ] },
  { start: 224, end: 325, words: [
    { text: "Hah?", at: 230 }, { text: "Kenapa", at: 264 }, { text: "kamu", at: 275 },
    { text: "mau", at: 284 }, { text: "di", at: 290 }, { text: "sini?", at: 295 },
  ] },
  { start: 325, end: 464, words: [
    { text: "Makan", at: 326 }, { text: "gratis,", at: 340 }, { text: "nggak", at: 377 },
    { text: "kerja,", at: 382 }, { text: "ada", at: 415 }, { text: "yang", at: 421 },
    { text: "jagain.", at: 425 },
  ] },
  { start: 464, end: 597, words: [
    { text: "Ini", at: 465 }, { text: "penjara,", at: 481 }, { text: "bukan", at: 514 },
    { text: "hotel", at: 530 }, { text: "bintang", at: 546 }, { text: "lima!", at: 563 },
  ] },
  { start: 597, end: 705, words: [
    { text: "Justru", at: 600 }, { text: "di", at: 616 }, { text: "sini", at: 620 },
    { text: "pelayanannya", at: 628 }, { text: "lebih", at: 645 }, { text: "bagus", at: 652 },
    { text: "daripada", at: 661 }, { text: "di", at: 674 }, { text: "rumah.", at: 679 },
  ] },
  { start: 705, end: 793, words: [
    { text: "Hah!", at: 712 }, { text: "Keluar", at: 740 }, { text: "sana!", at: 755 },
  ] },
  { start: 793, end: 887, words: [
    { text: "Hahaha!", at: 799 },
  ] },
];

// ---- Caption karaoke: kata aktif HIJAU, sisanya putih (seperti referensi) ----
const KaraokeCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const line = LINES.find((l) => frame >= l.start && frame < l.end);
  if (!line) return null;
  // halaman ≤4 kata, pecah di tanda baca (pola Captions CP)
  const pages: CapWord[][] = [];
  let cur: CapWord[] = [];
  for (const w of line.words) {
    cur.push(w);
    if (/[.,?!:]$/.test(w.text) || cur.length >= 4) {
      pages.push(cur);
      cur = [];
    }
  }
  if (cur.length) pages.push(cur);
  const page = [...pages].reverse().find((p) => frame >= p[0].at);
  if (!page) return null;
  const spoken = page.filter((w) => frame >= w.at);
  if (!spoken.length) return null;
  const activeIdx = spoken.length - 1;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute", top: "68%", width: "100%", textAlign: "center",
          fontFamily: FONT.caption, fontWeight: 900, fontSize: 54, letterSpacing: 0.5,
          color: "white", WebkitTextStroke: "5px #000", paintOrder: "stroke fill",
          textShadow: "0 4px 12px rgba(0,0,0,0.65)", padding: "0 40px", lineHeight: 1.2,
        }}
      >
        {spoken.map((w, i) => (
          <span key={i} style={{ display: "inline-block", margin: "0 0.16em", color: i === activeIdx ? "#3ecf6e" : "white" }}>
            {w.text.toUpperCase()}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Trial: React.FC = () => {
  const f = useCurrentFrame();

  // ---- kamera: push-in halus sepanjang video + ekstra di punchline (L7-L8) ----
  const camBase = 1 + 0.04 * easeInOutCubic(f / STICKY_TRIAL_TOTAL);
  const camPunch = 1 + 0.03 * easeInOutCubic(seg(f, 705, 780));
  const cam = camBase * camPunch;

  // ---- napas idle (kedua karakter, fade in setelah 2 detik) ----
  const breathAmp = seg(f, 60, 90);
  const breath = -2 * Math.sin((f * 2 * Math.PI) / 60) * breathAmp;

  // ---- UDIN: berbaring (sitT 0) -> duduk saat L3 (224-314), koran turun ----
  const sitT = easeInOutCubic(seg(f, 224, 314));
  const paperUp = f < 260;
  const udinMood: "relaxed" | "smile" | "surprised" | "laugh" =
    f < 325 ? "relaxed" : f < 453 ? "smile" : f < 587 ? "surprised" : f < 695 ? "smile" : f < 782 ? "surprised" : "laugh";
  const udinHead: number =
    f < 146 ? 4 : f < 325 ? -2 : f < 453 ? 3 : f < 587 ? -6 : f < 695 ? 2 : f < 782 ? -6 : 0;
  const laughShake = f >= 793 ? Math.abs(Math.sin((f - 793) * 0.5)) : 0;

  // ---- PAK SIPIR: masuk dari pintu saat L1, maju saat marah (L5), nunjuk (L7) ----
  const enterT = easeInOutCubic(seg(f, 15, 135));
  const sipirX = lerp(1040, 920, enterT) - 40 * easeInOutCubic(seg(f, 464, 500));
  const sipirMood: FaceMood =
    f < 224 ? "serious" : f < 314 ? "confused" : f < 464 ? "serious" : "angry";
  const pointT = easeOutBack(seg(f, 705, 729));
  const sipirHead = f < 224 ? 0 : f < 314 ? 8 : f < 464 ? 0 : f < 587 ? -4 : -6;
  const sipirLean = 4 * easeInOutCubic(seg(f, 464, 500)) * (1 - seg(f, 705, 737));

  return (
    <AbsoluteFill style={{ background: "#8f9296" }}>
      <Audio src={staticFile("sticky-trial-voice.mp3")} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${cam})`, transformOrigin: "50% 55%" }}>
        <PrisonCell />
        <Udin
          x={300}
          hipY={1230}
          sitT={sitT}
          mood={udinMood}
          headTilt={udinHead}
          bounce={breath}
          paperUp={paperUp}
          laughShake={laughShake}
        />
        <PakSipir
          x={sipirX}
          floorY={1500}
          mood={sipirMood}
          pointT={pointT}
          headTilt={sipirHead}
          bounce={breath}
          lean={sipirLean}
        />
      </div>
      <KaraokeCaptions />
      {/* vignette halus */}
      <div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 62%, rgba(0,0,0,0.28) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const StickyTrial: React.FC = () => <Trial />;
