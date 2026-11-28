import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  Bambang, CashRegister, Dedi, Folder, HelmetProp, Laptop, Phone, Putri, Receipt,
  SewingKit, Shovel, WallClock, Wulan, Yanto, type ChibiCharProps, type ChibiMood,
} from "../../kit/Characters";
import { C, FONT } from "../../kit/style";

/**
 * CharacterModels — DRAFT PREVIEW 5 model karakter Cerita Pekerja, gaya CHIBI.
 *
 * BUKAN episode tayang dan BELUM dipakai episode mana pun: 5 shot x 2 detik
 * (30 fps), masing-masing satu model sheet — full-body + 3 inset ekspresi
 * (senyum/khawatir/tegas) + 2 prop khas. Stills via workflow Stills
 * (scripts/stills.json -> "CharacterModels").
 *
 * Gaya visual dikunci 28 Nov 2026: chibi (kepala besar + badan kecil,
 * outline tebal, warna flat, palet merah-hitam-putih + aksen).
 * Sumber kebenaran visual: style-reference-chibi.jpg.
 * Sumber identitas/latar/konflik: referensi-model-karakter-cerita-pekerja-teks.docx.
 * Jangan sambungkan komponen ini ke episode sebelum Avenir menyetujui preview-nya.
 */
export const CHARACTER_MODELS_TOTAL = 300;

const FLOOR = 1400;
const INSET_CY = 1600;
const INSET_R = 100;
/** Inset: kepala chibi (pusat lokal 0,-420) diskala 0,68 agar muat di lingkaran R=100. */
const INSET_SCALE = 0.68;
const INSET_FLOOR = INSET_CY + 420 * INSET_SCALE;

const INSET_MOODS: { mood: ChibiMood; label: string; cx: number }[] = [
  { mood: "smile", label: "SENYUM", cx: 230 },
  { mood: "worried", label: "KHAWATIR", cx: 540 },
  { mood: "determined", label: "TEGAS", cx: 850 },
];

interface SheetDef {
  name: string;
  role: string;
  Char: React.FC<ChibiCharProps>;
  propL: React.ReactNode;
  propR: React.ReactNode;
}

const SHEETS: SheetDef[] = [
  { name: "DEDI SANTOSO", role: "OPERATOR PABRIK GARMEN · BEKASI", Char: Dedi, propL: <WallClock />, propR: <SewingKit /> },
  { name: "WULAN AYU", role: "KASIR MINIMARKET · YOGYAKARTA", Char: Wulan, propL: <CashRegister />, propR: <Receipt /> },
  { name: "BAMBANG RIYANTO", role: "KULI BANGUNAN · JAKARTA", Char: Bambang, propL: <HelmetProp color="#ffc338" />, propR: <Shovel /> },
  { name: "PUTRI MAHARANI", role: "STAF ADMIN STARTUP · BANDUNG", Char: Putri, propL: <Laptop />, propR: <Folder /> },
  { name: "YANTO PRASETYO", role: "DRIVER OJEK ONLINE · SURABAYA", Char: Yanto, propL: <HelmetProp color="#3a9e4d" />, propR: <Phone /> },
];

/** Satu panel model sheet: nama + peran + full-body + 3 inset ekspresi + 2 prop. */
const Sheet: React.FC<{ def: SheetDef; index: number }> = ({ def, index }) => {
  const { Char } = def;
  return (
    <AbsoluteFill style={{ background: "#f7f1e3" }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {/* prop khas kiri-kanan */}
        <g transform="translate(185,1120)">{def.propL}</g>
        <g transform="translate(895,1120)">{def.propR}</g>
        {/* full-body, ekspresi netral seperti model sheet */}
        <Char x={540} floor={FLOOR} scale={0.95} />
        {/* 3 inset ekspresi: kepala di dalam lingkaran */}
        {INSET_MOODS.map(({ mood, cx }) => (
          <g key={mood}>
            <defs>
              <clipPath id={`clip-${index}-${mood}`}>
                <circle cx={cx} cy={INSET_CY} r={INSET_R} />
              </clipPath>
            </defs>
            <circle cx={cx} cy={INSET_CY} r={INSET_R} fill="#fdf8ea" stroke={C.ink} strokeWidth={6} />
            <g clipPath={`url(#clip-${index}-${mood})`}>
              <Char x={cx} floor={INSET_FLOOR} scale={INSET_SCALE} mood={mood} />
            </g>
          </g>
        ))}
      </svg>
      {/* lencana DRAFT — preview, belum produksi */}
      <div style={{ position: "absolute", top: 36, right: 40, fontFamily: FONT.mono, fontWeight: 800, fontSize: 22, letterSpacing: 2, color: "white", background: "#c0241c", padding: "10px 18px", borderRadius: 999 }}>
        DRAFT PREVIEW
      </div>
      <div style={{ position: "absolute", top: 118, width: "100%", textAlign: "center", fontFamily: FONT.title, fontSize: 92, color: C.ink }}>
        {def.name}
      </div>
      <div style={{ position: "absolute", top: 240, width: "100%", textAlign: "center", fontFamily: FONT.mono, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: "#6b675f" }}>
        {def.role}
      </div>
      {INSET_MOODS.map(({ label, cx }) => (
        <div key={label} style={{ position: "absolute", top: 1730, left: cx - 110, width: 220, textAlign: "center", fontFamily: FONT.mono, fontWeight: 800, fontSize: 24, letterSpacing: 2, color: C.ink }}>
          {label}
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const CharacterModels: React.FC = () => (
  <AbsoluteFill style={{ background: "#f7f1e3" }}>
    {SHEETS.map((def, i) => (
      <Sequence key={def.name} from={i * 60} durationInFrames={60}>
        <Sheet def={def} index={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
