import React from "react";
import { STAND, Stick, type Limb, type Look, type Mood, type Pose } from "./Stick";
import { C, FONT } from "./style";

/**
 * Characters — 5 model karakter Cerita Pekerja (DRAFT PREVIEW).
 *
 * Sumber kebenaran: ~/workspace/cerita-pekerja/character-models/
 * referensi-model-karakter-cerita-pekerja-teks.docx (TEKS SAJA).
 * PNG model sheet lama hanya contoh gambar — bila teks dan gambar
 * bertentangan, TEKS yang diikuti (mis. celana Yanto HITAM, bukan
 * putih seperti di gambar; Bambang TIDAK pakai topi cap).
 *
 * DRAFT PREVIEW — komponen ini BELUM dipakai episode mana pun dan
 * BELUM disetujui Avenir untuk produksi. Jangan sambungkan ke
 * komposisi episode sebelum ada persetujuan eksplisit.
 *
 * Pola: setiap karakter = satu Look kit + overlay SVG (rompi, hijab,
 * apron, kumis, rambut panjang, tas delivery) yang digambar dalam
 * koordinat lokal Stick (pinggul = 0,0; leher = 0,-190; kepala = 0,-276;
 * r kepala = 68; kaki ≈ +253,5). Overlay badan ikut rotasi lean pose;
 * overlay kepala diasumsikan pose tegak (error kecil bila lean/tilt besar).
 * Ekspresi model sheet: senyum = mood "relieved", khawatir = "worried",
 * tegas = "determined" (mood kit, alis + mulut).
 */

/** Jarak kaki terjauh dari pinggul untuk sebuah pose (cermin Stick.tsx: thigh 128, shin 126). */
const lowestFoot = (pose: Pose): number => {
  const fy = (lg: Limb) => Math.cos(lg[0]) * 128 + Math.cos(lg[0] - lg[1]) * 126;
  return Math.max(fy(pose.legF), fy(pose.legB));
};

export interface CharProps {
  x: number; // pusat kaki (px)
  floor: number; // lantai y (px) — kaki menapak di sini
  scale?: number;
  mood?: Mood;
  pose?: Pose;
  facing?: 1 | -1;
  holdF?: React.ReactNode;
  holdB?: React.ReactNode;
}

/** Rangka bersama: Stick + overlay belakang (sebelum Stick) + overlay depan (sesudah Stick). */
const CharFrame: React.FC<CharProps & { look: Look; back?: React.ReactNode; front?: React.ReactNode }> = ({
  x, floor, scale = 1, mood, pose = STAND, facing = 1, holdF, holdB, look, back, front,
}) => {
  const lf = lowestFoot(pose);
  return (
    <g transform={`translate(${x},${floor - lf * scale}) scale(${scale})`}>
      {back}
      <Stick x={0} floor={lf} scale={1} facing={facing} pose={pose} look={look} mood={mood} holdF={holdF} holdB={holdB} />
      {front}
    </g>
  );
};

/** Garis merah di helm (Dedi putih, Yanto hijau). */
const HelmetStripe: React.FC = () => (
  <path d="M-66,-304 Q0,-322 66,-304" fill="none" stroke="#db483b" strokeWidth={9} strokeLinecap="round" />
);

/** Segitiga kemeja putih di leher (di balik jaket/blazer). */
const ShirtV: React.FC<{ depth?: number }> = ({ depth = 138 }) => (
  <path d={`M-16,-192 L16,-192 L0,${-depth} Z`} fill="#f5f2e8" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
);

/* ------------------------------------------------------------------ */
/* 1. DEDI SANTOSO — operator pabrik garmen, Bekasi.                   */
/* Teks: helm safety putih bergaris merah, rompi abu-abu di atas       */
/* kemeja putih + dasi hitam + celana hitam, name tag "DEDI" di dada.  */
/* ------------------------------------------------------------------ */
export const DEDI_LOOK: Look = { body: "#f5f2e8", pants: "#1d1d1f", tie: "#1d1d1f", helmet: "#fdf8ea" };

export const Dedi: React.FC<CharProps> = (p) => {
  const leanDeg = ((p.pose ?? STAND).lean * 180) / Math.PI;
  return (
    <CharFrame
      {...p}
      look={DEDI_LOOK}
      front={
        <>
          {/* rompi abu-abu: dua panel, dasi + kemeja terlihat di celah tengah */}
          <g transform={`rotate(${leanDeg})`}>
            <path d="M-58,-182 L-16,-182 L-20,-4 L-54,-4 Z" fill={C.steel} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d="M16,-182 L58,-182 L54,-4 L20,-4 Z" fill={C.steel} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <rect x={-48} y={-96} width={22} height={18} rx={3} fill="#7c838a" stroke={C.ink} strokeWidth={3} />
            <rect x={26} y={-96} width={22} height={18} rx={3} fill="#7c838a" stroke={C.ink} strokeWidth={3} />
            {/* name tag di panel kiri rompi */}
            <rect x={-54} y={-142} width={36} height={24} rx={3} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
            <text x={-36} y={-125} fontFamily={FONT.mono} fontWeight={800} fontSize={13} fill={C.ink} textAnchor="middle">DEDI</text>
          </g>
          <HelmetStripe />
        </>
      }
    />
  );
};

/* ------------------------------------------------------------------ */
/* 2. WULAN AYU — kasir minimarket, Yogyakarta.                        */
/* Teks: hijab krem, apron merah di atas kemeja putih, celana hitam,   */
/* name tag "WULAN" di apron.                                          */
/* ------------------------------------------------------------------ */
export const WULAN_LOOK: Look = { body: "#f5f2e8", pants: "#1d1d1f" };

export const Wulan: React.FC<CharProps> = (p) => {
  const leanDeg = ((p.pose ?? STAND).lean * 180) / Math.PI;
  return (
    <CharFrame
      {...p}
      look={WULAN_LOOK}
      back={
        /* hijab: lingkaran krem di belakang kepala — wajah Stick menutup tengahnya */
        <circle cx={0} cy={-276} r={82} fill="#e8dcc0" stroke={C.ink} strokeWidth={7} />
      }
      front={
        <g transform={`rotate(${leanDeg})`}>
          {/* ujung hijab di sisi leher */}
          <path d="M-70,-258 L-52,-258 L-58,-180 L-76,-180 Z" fill="#e8dcc0" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M52,-258 L70,-258 L76,-180 L58,-180 Z" fill="#e8dcc0" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          {/* apron merah + 2 saku + name tag */}
          <path d="M-56,-188 L56,-188 L64,-20 L60,112 L-60,112 L-64,-20 Z" fill="#c8241c" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={-48} y={-42} width={26} height={30} rx={4} fill="#9e1b14" stroke={C.ink} strokeWidth={3} />
          <rect x={22} y={-42} width={26} height={30} rx={4} fill="#9e1b14" stroke={C.ink} strokeWidth={3} />
          <rect x={-34} y={-164} width={68} height={26} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
          <text x={0} y={-146} fontFamily={FONT.mono} fontWeight={800} fontSize={15} fill={C.ink} textAnchor="middle">WULAN</text>
        </g>
      }
    />
  );
};

/* ------------------------------------------------------------------ */
/* 3. BAMBANG RIYANTO — kuli bangunan, Jakarta.                        */
/* Teks: rambut beruban + kumis, helm proyek kuning, kaos kerja putih,  */
/* celana hitam. TIDAK pakai topi cap. Prop: helm kuning + sekop.       */
/* ------------------------------------------------------------------ */
export const BAMBANG_LOOK: Look = { body: "#f5f2e8", pants: "#1d1d1f", helmet: "#ffc338", shortHair: "#b9b6ae" };

export const Bambang: React.FC<CharProps> = (p) => {
  const leanDeg = ((p.pose ?? STAND).lean * 180) / Math.PI;
  return (
    <CharFrame
      {...p}
      look={BAMBANG_LOOK}
      front={
        <>
          <g transform={`rotate(${leanDeg})`}>
            {/* ikat pinggang + gesper merah, saku kaos list merah */}
            <rect x={-46} y={-14} width={92} height={16} rx={4} fill="#1d1d1f" stroke={C.ink} strokeWidth={3} />
            <rect x={-10} y={-12} width={20} height={12} rx={2} fill="#c0241c" stroke={C.ink} strokeWidth={3} />
            <rect x={-46} y={-152} width={26} height={22} rx={3} fill="#f5f2e8" stroke="#c0241c" strokeWidth={3} />
          </g>
          {/* kumis abu-abu dua lobus — celah tengah membiarkan mulut mood terbaca */}
          <ellipse cx={-15} cy={-259} rx={12} ry={6.5} fill="#b9b6ae" stroke={C.ink} strokeWidth={3} />
          <ellipse cx={15} cy={-259} rx={12} ry={6.5} fill="#b9b6ae" stroke={C.ink} strokeWidth={3} />
        </>
      }
    />
  );
};

/* ------------------------------------------------------------------ */
/* 4. PUTRI MAHARANI — staf admin startup, Bandung.                    */
/* Teks: rambut panjang hitam, kacamata, blazer hitam di atas kemeja    */
/* putih, celana hitam. Prop: laptop + map folder.                     */
/* ------------------------------------------------------------------ */
export const PUTRI_LOOK: Look = { body: "#23282e", pants: "#1d1d1f", glasses: true };

export const Putri: React.FC<CharProps> = (p) => {
  const leanDeg = ((p.pose ?? STAND).lean * 180) / Math.PI;
  return (
    <CharFrame
      {...p}
      look={PUTRI_LOOK}
      back={
        /* rambut panjang: massa hitam di belakang kepala + jatuh melewati bahu */
        <path d="M-80,-276 A80,80 0 1,1 80,-276 L92,-30 Q92,12 58,12 L-58,12 Q-92,12 -92,-30 Z" fill="#1d1d1f" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      }
      front={
        <>
          <g transform={`rotate(${leanDeg})`}>
            <ShirtV depth={138} />
            <circle cx={0} cy={-118} r={5} fill="#db483b" stroke={C.ink} strokeWidth={2} />
            <circle cx={0} cy={-88} r={5} fill="#db483b" stroke={C.ink} strokeWidth={2} />
          </g>
          {/* helaian rambut depan di sisi wajah, jatuh ke dada */}
          <path d="M-66,-300 Q-82,-200 -70,-116 L-48,-116 Q-60,-200 -48,-296 Z" fill="#1d1d1f" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M48,-296 Q60,-200 70,-116 L48,-116 Q60,-200 66,-300 Z" fill="#1d1d1f" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
        </>
      }
    />
  );
};

/* ------------------------------------------------------------------ */
/* 5. YANTO PRASETYO — driver ojek online, Surabaya.                   */
/* Teks: jaket hijau ojol, helm hijau, tas delivery merah di punggung.  */
/* Base pria berlaku: celana HITAM (gambar lama keliru menggambar       */
/* putih). Prop: helm + HP.                                             */
/* ------------------------------------------------------------------ */
export const YANTO_LOOK: Look = { body: "#3a9e4d", pants: "#1d1d1f", helmet: "#3a9e4d" };

export const Yanto: React.FC<CharProps> = (p) => {
  const leanDeg = ((p.pose ?? STAND).lean * 180) / Math.PI;
  return (
    <CharFrame
      {...p}
      look={YANTO_LOOK}
      back={
        <>
          {/* tas delivery merah di punggung — Stick menutup bagian tengahnya */}
          <rect x={-72} y={-252} width={144} height={212} rx={14} fill="#c0241c" stroke={C.ink} strokeWidth={6} />
          <rect x={-62} y={-236} width={22} height={22} rx={3} fill="#fdf8ea" stroke={C.ink} strokeWidth={2} />
          <path d="M-51,-236 L-51,-214 M-62,-225 L-40,-225" stroke={C.ink} strokeWidth={2} />
        </>
      }
      front={
        <>
          <g transform={`rotate(${leanDeg})`}>
            {/* tali tas di bahu + kaos putih di leher jaket */}
            <rect x={-44} y={-196} width={14} height={132} rx={4} fill="#c0241c" stroke={C.ink} strokeWidth={3} />
            <rect x={30} y={-196} width={14} height={132} rx={4} fill="#c0241c" stroke={C.ink} strokeWidth={3} />
            <ShirtV depth={158} />
          </g>
          <HelmetStripe />
        </>
      }
    />
  );
};

/* ------------------------------------------------------------------ */
/* Prop khas (digambar di panel model sheet, titik 0,0 = tengah prop).  */
/* ------------------------------------------------------------------ */

/** Jam dinding shift malam. */
export const WallClock: React.FC = () => (
  <g>
    <circle r={88} fill="#fdf8ea" stroke={C.ink} strokeWidth={7} />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i * Math.PI) / 6;
      const big = i % 3 === 0;
      return (
        <line key={i} x1={Math.sin(a) * (big ? 70 : 76)} y1={-Math.cos(a) * (big ? 70 : 76)} x2={Math.sin(a) * 82} y2={-Math.cos(a) * 82} stroke={C.ink} strokeWidth={big ? 6 : 3} strokeLinecap="round" />
      );
    })}
    {/* jarum ke ~11:00 (shift malam) */}
    <line x1={0} y1={0} x2={-28} y2={-38} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
    <line x1={0} y1={0} x2={0} y2={-58} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    <circle r={7} fill={C.ink} />
  </g>
);

/** Alat jahit: benang, gunting, meteran. */
export const SewingKit: React.FC = () => (
  <g>
    {/* gulungan benang merah */}
    <rect x={-108} y={-52} width={46} height={104} rx={8} fill="#db483b" stroke={C.ink} strokeWidth={5} />
    <ellipse cx={-85} cy={-52} rx={23} ry={10} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
    <line x1={-108} y1={-24} x2={-62} y2={-24} stroke="#00000044" strokeWidth={6} />
    <line x1={-108} y1={0} x2={-62} y2={0} stroke="#00000044" strokeWidth={6} />
    {/* gunting */}
    <g transform="translate(10,0)">
      <path d="M-34,44 L26,-46" stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
      <path d="M-34,44 L26,-46" stroke="#cfcab3" strokeWidth={8} strokeLinecap="round" />
      <path d="M34,44 L-26,-46" stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
      <path d="M34,44 L-26,-46" stroke="#cfcab3" strokeWidth={8} strokeLinecap="round" />
      <circle cx={-42} cy={58} r={14} fill="none" stroke={C.ink} strokeWidth={6} />
      <circle cx={42} cy={58} r={14} fill="none" stroke={C.ink} strokeWidth={6} />
    </g>
    {/* meteran melingkar */}
    <g transform="translate(96,10)">
      <circle r={40} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
      <circle r={26} fill="none" stroke={C.ink} strokeWidth={3} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i * Math.PI) / 3;
        return <line key={i} x1={Math.sin(a) * 30} y1={-Math.cos(a) * 30} x2={Math.sin(a) * 38} y2={-Math.cos(a) * 38} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />;
      })}
    </g>
  </g>
);

/** Mesin kasir merah. */
export const CashRegister: React.FC = () => (
  <g>
    <rect x={-110} y={-64} width={220} height={128} rx={10} fill="#c8241c" stroke={C.ink} strokeWidth={6} />
    <rect x={-110} y={-64} width={220} height={34} rx={10} fill="#9e1b14" stroke={C.ink} strokeWidth={4} />
    {/* display */}
    <rect x={36} y={-108} width={74} height={40} rx={6} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
    <text x={73} y={-80} fontFamily={FONT.mono} fontWeight={800} fontSize={19} fill={C.ink} textAnchor="middle">0.00</text>
    {/* keypad */}
    {[-58, -24, 10].map((y) =>
      [-84, -50, -16].map((x) => (
        <rect key={`${x},${y}`} x={x} y={y} width={26} height={20} rx={3} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
      )),
    )}
    {/* laci + gagang */}
    <line x1={-96} y1={44} x2={96} y2={44} stroke={C.ink} strokeWidth={4} />
    <rect x={-24} y={26} width={48} height={12} rx={6} fill={C.ink} />
  </g>
);

/** Struk belanja. */
export const Receipt: React.FC = () => {
  const zig = (w: number, h: number, teeth: number) => {
    let d = `M${-w / 2},${-h / 2}`;
    for (let i = 0; i < teeth; i++) {
      d += ` L${-w / 2 + ((i + 0.5) * w) / teeth},${-h / 2 + 12} L${-w / 2 + ((i + 1) * w) / teeth},${-h / 2}`;
    }
    d += ` L${w / 2},${h / 2}`;
    for (let i = 0; i < teeth; i++) {
      d += ` L${w / 2 - ((i + 0.5) * w) / teeth},${h / 2 - 12} L${w / 2 - ((i + 1) * w) / teeth},${h / 2}`;
    }
    return d + " Z";
  };
  return (
    <g>
      <path d={zig(170, 230, 8)} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <text x={0} y={-72} fontFamily={FONT.mono} fontWeight={800} fontSize={20} fill={C.ink} textAnchor="middle">RECEIPT</text>
      <line x1={-62} y1={-54} x2={62} y2={-54} stroke={C.ink} strokeWidth={3} />
      <text x={0} y={-16} fontFamily={FONT.mono} fontWeight={700} fontSize={17} fill={C.ink} textAnchor="middle">SNACK 5.000</text>
      <text x={0} y={14} fontFamily={FONT.mono} fontWeight={700} fontSize={17} fill={C.ink} textAnchor="middle">DRINK 3.000</text>
      <line x1={-62} y1={38} x2={62} y2={38} stroke={C.ink} strokeWidth={3} />
      <text x={0} y={76} fontFamily={FONT.mono} fontWeight={800} fontSize={19} fill={C.ink} textAnchor="middle">TOTAL 8.000</text>
    </g>
  );
};

/** Helm proyek (prop samping). */
export const HelmetProp: React.FC<{ color?: string }> = ({ color = "#ffc338" }) => (
  <g>
    <path d="M-84,-7 A84,84 0 0 1 84,-7 Z" fill={color} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    <path d="M-14,-86 L-8,-20 M14,-86 L8,-20" stroke={C.ink} strokeWidth={4} opacity={0.5} />
    <rect x={-96} y={-14} width={192} height={16} rx={8} fill={color} stroke={C.ink} strokeWidth={5} />
  </g>
);

/** Sekop. */
export const Shovel: React.FC = () => (
  <g>
    <rect x={-10} y={-150} width={20} height={150} rx={6} fill="#e2a748" stroke={C.ink} strokeWidth={5} />
    <rect x={-10} y={-62} width={20} height={18} fill="#c0241c" stroke={C.ink} strokeWidth={3} />
    <path d="M-42,0 L42,0 L30,86 Q0,106 -30,86 Z" fill="#4a4a4f" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

/** Laptop. */
export const Laptop: React.FC = () => (
  <g>
    <rect x={-105} y={-80} width={210} height={130} rx={8} fill="#3a3a3f" stroke={C.ink} strokeWidth={6} />
    <rect x={-93} y={-68} width={186} height={106} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
    <rect x={-120} y={50} width={240} height={16} rx={6} fill="#8f969b" stroke={C.ink} strokeWidth={5} />
  </g>
);

/** Map folder berisi dokumen. */
export const Folder: React.FC = () => (
  <g>
    <rect x={-95} y={-60} width={190} height={130} rx={8} fill="#c0241c" stroke={C.ink} strokeWidth={6} />
    <rect x={-70} y={-98} width={140} height={62} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
    <line x1={-56} y1={-76} x2={56} y2={-76} stroke={C.ink} strokeWidth={3} />
    <line x1={-56} y1={-58} x2={56} y2={-58} stroke={C.ink} strokeWidth={3} />
    <rect x={-95} y={-22} width={190} height={92} rx={8} fill="#e4d4a8" stroke={C.ink} strokeWidth={6} />
    <rect x={-95} y={-22} width={64} height={20} rx={6} fill="#c0241c" stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Ponsel (prop samping / holdF). */
export const Phone: React.FC = () => (
  <g>
    <rect x={-45} y={-110} width={90} height={220} rx={16} fill="#1d1d1f" stroke={C.ink} strokeWidth={6} />
    <rect x={-35} y={-95} width={70} height={178} rx={8} fill="#ece5dd" stroke={C.ink} strokeWidth={3} />
    <line x1={-20} y1={-102} x2={20} y2={-102} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
    <circle cx={0} cy={96} r={8} fill="#3a3a3f" stroke={C.ink} strokeWidth={2} />
  </g>
);
