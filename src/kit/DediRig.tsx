import React from "react";

/**
 * DediRig — rig vektor DETAIL Dedi Santoso, DITRACING dari referensi
 * (style-reference-chibi.jpg + breakdown-04-breakdown-sheet-lengkap.jpg).
 *
 * PILOT — bukan rig Characters.tsx yang simpel (file itu dibiarkan apa adanya).
 * Tiap bagian tubuh digambar sebagai path SVG yang mengikuti bentuk referensi:
 * kepala + rambut + helm safety putih garis merah, alis, mata besar dengan
 * highlight, mulut per mood; badan + rompi abu-abu (kantong, dasi, name tag
 * "DEDI"); lengan terpisah di siku, kaki terpisah di lutut.
 *
 * Sendi (pivot transform): bahu, siku, pinggul, lutut. Prop mood ganti bagian
 * wajah; prop hand ganti pose tangan sesuai 5 pose breakdown-04
 * (telapak / kepal / peace / tunjuk / jempol).
 *
 * Koordinat lokal: origin (0,0) = tanah di tengah telapak kaki, sumbu y
 * negatif ke atas. Tinggi total ~520 unit. DRAFT PREVIEW — jangan dipakai
 * episode sebelum Avenir menyetujui.
 */

export type DediMood = "neutral" | "smile" | "worried" | "determined";
export type DediHand = "telapak" | "kepal" | "peace" | "tunjuk" | "jempol";

export interface DediRigProps {
  x?: number;
  floor?: number;
  scale?: number;
  flip?: boolean;
  mood?: DediMood;
  handL?: DediHand;
  handR?: DediHand;
  shoulderL?: number;
  shoulderR?: number;
  elbowL?: number;
  elbowR?: number;
  wristL?: number;
  wristR?: number;
  hipL?: number;
  hipR?: number;
  kneeL?: number;
  kneeR?: number;
  headTilt?: number;
  bounce?: number;
}

const INK = "#1b1b1b";
const SKIN = "#fff6ea";
const HAND_SKIN = "#ffdfb5";
const HAIR = "#3a2a1a";
const HELMET_RED = "#e53935";
const VEST = "#9aa0a6";
const VEST_DARK = "#878d94";
const VEST_LIGHT = "#d8dde1";
const PANTS = "#232323";

/* ---------------- wajah ---------------- */

const Brows: React.FC<{ mood: DediMood }> = ({ mood }) => {
  const d =
    mood === "smile"
      ? { l: "M -31,-447 Q -21,-453 -11,-447", r: "M 11,-447 Q 21,-453 31,-447" }
      : mood === "worried"
        ? { l: "M -31,-440 Q -21,-451 -11,-445", r: "M 11,-445 Q 21,-451 31,-440" }
        : mood === "determined"
          ? { l: "M -32,-449 L -9,-441", r: "M 9,-441 L 32,-449" }
          : { l: "M -31,-443 Q -21,-449 -11,-443", r: "M 11,-443 Q 21,-449 31,-443" };
  return (
    <g stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none">
      <path d={d.l} />
      <path d={d.r} />
    </g>
  );
};

const Eyes: React.FC<{ mood: DediMood }> = ({ mood }) => {
  if (mood === "smile") {
    // mata tertutup bahagia (busur)
    return (
      <g stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none">
        <path d="M -29,-418 Q -20,-430 -11,-418" />
        <path d="M 11,-418 Q 20,-430 29,-418" />
      </g>
    );
  }
  const ry = mood === "worried" ? 11 : 13;
  return (
    <g>
      <ellipse cx={-20} cy={-420} rx={8} ry={ry} fill={INK} />
      <ellipse cx={20} cy={-420} rx={8} ry={ry} fill={INK} />
      <circle cx={-22} cy={-425} r={2.5} fill="#fff" />
      <circle cx={18} cy={-425} r={2.5} fill="#fff" />
    </g>
  );
};

const Mouth: React.FC<{ mood: DediMood }> = ({ mood }) => {
  if (mood === "smile") {
    return (
      <g>
        <path
          d="M -15,-394 Q 0,-390 15,-394 Q 12,-374 0,-374 Q -12,-374 -15,-394 Z"
          fill="#8c3a2b"
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <ellipse cx={0} cy={-378} rx={6} ry={3} fill="#e86a6a" />
      </g>
    );
  }
  if (mood === "worried") {
    return (
      <path d="M -10,-388 Q 0,-394 10,-388" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
    );
  }
  if (mood === "determined") {
    return (
      <path d="M -12,-389 L 12,-392" stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none" />
    );
  }
  return (
    <path d="M -10,-392 Q 0,-386 10,-392" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
  );
};

/** Kepala lengkap: wajah + rambut + helm. Pusat kepala (0,-425). */
const Head: React.FC<{ mood: DediMood }> = ({ mood }) => (
  <g>
    {/* telinga */}
    <ellipse cx={-60} cy={-420} rx={7} ry={11} fill={SKIN} stroke={INK} strokeWidth={3.5} />
    <ellipse cx={60} cy={-420} rx={7} ry={11} fill={SKIN} stroke={INK} strokeWidth={3.5} />
    {/* wajah */}
    <ellipse cx={0} cy={-425} rx={60} ry={56} fill={SKIN} stroke={INK} strokeWidth={5} />
    {/* rambut: jambul di pelipis + poni di bawah helm */}
    <path
      d="M -62,-448 L -72,-414 L -60,-424 L -66,-402 L -52,-418 L -54,-446 Z"
      fill={HAIR}
      stroke={INK}
      strokeWidth={2.5}
      strokeLinejoin="round"
    />
    <path
      d="M 62,-448 L 72,-414 L 60,-424 L 66,-402 L 52,-418 L 54,-446 Z"
      fill={HAIR}
      stroke={INK}
      strokeWidth={2.5}
      strokeLinejoin="round"
    />
    <path
      d="M -56,-446 L -48,-432 L -38,-444 L -26,-431 L -13,-443 L 0,-432 L 13,-443 L 26,-431 L 38,-444 L 48,-432 L 56,-446 C 30,-456 -30,-456 -56,-446 Z"
      fill={HAIR}
    />
    <Brows mood={mood} />
    <Eyes mood={mood} />
    <Mouth mood={mood} />
    {mood === "smile" && (
      <g fill="#f0a0a0" opacity={0.85}>
        <ellipse cx={-38} cy={-400} rx={8} ry={5} />
        <ellipse cx={38} cy={-400} rx={8} ry={5} />
      </g>
    )}
    {mood === "worried" && (
      <path
        d="M 40,-414 C 36,-406 36,-400 40,-398 C 44,-400 44,-406 40,-414 Z"
        fill="#7fb8e8"
        stroke={INK}
        strokeWidth={2}
      />
    )}
    {/* helm safety putih garis merah */}
    <path
      d="M -74,-434 C -74,-498 -42,-520 0,-520 C 42,-520 74,-498 74,-434 C 48,-448 -48,-448 -74,-434 Z"
      fill="#fff"
      stroke={INK}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <path
      d="M -80,-438 C -40,-424 40,-424 80,-438 L 80,-430 C 40,-418 -40,-418 -80,-430 Z"
      fill="#fff"
      stroke={INK}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <path
      d="M -71,-472 C -38,-490 38,-490 71,-472 L 71,-460 C 38,-477 -38,-477 -71,-460 Z"
      fill={HELMET_RED}
    />
    <circle cx={0} cy={-484} r={10} fill={HELMET_RED} stroke="#fff" strokeWidth={2} />
    <circle cx={0} cy={-484} r={3.5} fill="#fff" />
  </g>
);

/* ---------------- tangan (5 pose breakdown-04) ---------------- */

/** Tangan digambar menghadap penonton, jari mengarah +y (menjauhi pergelangan). */
const Hand: React.FC<{ pose: DediHand }> = ({ pose }) => {
  const s = { fill: HAND_SKIN, stroke: INK, strokeWidth: 3.5, strokeLinejoin: "round" as const };
  if (pose === "kepal") {
    return (
      <g {...s}>
        <rect x={-12} y={4} width={24} height={26} rx={9} />
        <path d="M -7,6 L -7,12 M 0,5 L 0,11 M 7,6 L 7,12" stroke={INK} strokeWidth={2.5} fill="none" />
      </g>
    );
  }
  if (pose === "peace") {
    return (
      <g {...s}>
        <ellipse cx={0} cy={18} rx={11} ry={12} />
        <rect x={-11} y={22} width={6} height={22} rx={3} transform="rotate(-14 -8 30)" />
        <rect x={5} y={22} width={6} height={22} rx={3} transform="rotate(14 8 30)" />
        <circle cx={-6} cy={12} r={3.5} />
        <circle cx={6} cy={12} r={3.5} />
      </g>
    );
  }
  if (pose === "tunjuk") {
    return (
      <g {...s}>
        <rect x={-12} y={6} width={24} height={24} rx={9} />
        <rect x={1} y={22} width={6} height={24} rx={3} transform="rotate(8 4 34)" />
        <circle cx={-7} cy={10} r={3.5} />
        <circle cx={7} cy={10} r={3.5} />
      </g>
    );
  }
  if (pose === "jempol") {
    return (
      <g {...s}>
        <rect x={-12} y={4} width={24} height={26} rx={9} />
        <rect x={-3} y={-16} width={7} height={22} rx={3.5} transform="rotate(-12 0 -5)" />
        <path d="M -7,6 L -7,12 M 0,5 L 0,11 M 7,6 L 7,12" stroke={INK} strokeWidth={2.5} fill="none" />
      </g>
    );
  }
  // telapak (terbuka)
  return (
    <g {...s}>
      <ellipse cx={0} cy={16} rx={12} ry={13} />
      <rect x={-12} y={24} width={5.5} height={16} rx={2.75} transform="rotate(-8 -9 30)" />
      <rect x={-4} y={26} width={5.5} height={18} rx={2.75} />
      <rect x={4} y={26} width={5.5} height={18} rx={2.75} />
      <rect x={11} y={24} width={5.5} height={16} rx={2.75} transform="rotate(8 14 30)" />
      <rect x={-16} y={14} width={5.5} height={14} rx={2.75} transform="rotate(-38 -13 20)" />
    </g>
  );
};

/* ---------------- lengan & kaki ---------------- */

const Arm: React.FC<{
  shoulder: number;
  elbow: number;
  wrist: number;
  hand: DediHand;
}> = ({ shoulder, elbow, wrist, hand }) => (
  <g transform={`translate(0,0) rotate(${shoulder})`}>
    {/* lengan atas: bahu (0,0) -> siku (0,78) */}
    <path
      d="M -13,0 L 13,0 L 13,66 Q 13,78 0,78 Q -13,78 -13,66 Z"
      fill="#fff"
      stroke={INK}
      strokeWidth={4.5}
      strokeLinejoin="round"
    />
    <g transform={`translate(0,78) rotate(${elbow})`}>
      {/* lengan bawah: siku (0,0) -> pergelangan (0,68) */}
      <path
        d="M -12,0 L 12,0 L 12,56 Q 12,68 0,68 Q -12,68 -12,56 Z"
        fill="#fff"
        stroke={INK}
        strokeWidth={4.5}
        strokeLinejoin="round"
      />
      <g transform={`translate(0,68) rotate(${wrist})`}>
        <Hand pose={hand} />
      </g>
    </g>
  </g>
);

const Leg: React.FC<{ hip: number; knee: number; flip?: boolean }> = ({ hip, knee, flip }) => (
  <g transform={`translate(0,0) rotate(${hip})`}>
    {/* paha: pinggul (0,0) -> lutut (0,95) */}
    <path
      d="M -17,0 L 17,0 L 17,82 Q 17,95 0,95 Q -17,95 -17,82 Z"
      fill={PANTS}
      stroke={INK}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <g transform={`translate(0,95) rotate(${knee})`}>
      {/* betis: lutut (0,0) -> pergelangan (0,84) */}
      <path
        d="M -15,0 L 15,0 L 15,72 Q 15,84 0,84 Q -15,84 -15,72 Z"
        fill={PANTS}
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      {/* sepatu, ujung ke arah luar (flip untuk kaki kiri) */}
      <g transform={`translate(0,84) scale(${flip ? -1 : 1},1)`}>
        <path
          d="M -14,0 L 16,0 C 30,0 36,6 34,14 L 32,18 L -16,18 C -22,12 -20,4 -14,0 Z"
          fill="#262626"
          stroke={INK}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <path d="M -16,14 L 32,14" stroke="#555" strokeWidth={2} />
      </g>
    </g>
  </g>
);

/* ---------------- badan ---------------- */

const Torso: React.FC = () => (
  <g>
    {/* kemeja putih (dasar) */}
    <path d="M -58,-350 L 58,-350 L 56,-196 L -56,-196 Z" fill="#fff" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
    {/* dasi hitam */}
    <path d="M -8,-344 L 8,-344 L 6,-330 L -6,-330 Z" fill={INK} />
    <path d="M -6,-330 L 6,-330 L 9,-292 L 0,-280 L -9,-292 Z" fill={INK} />
    {/* rompi abu-abu, bukaan V di dada */}
    <path
      d="M -66,-348 L -26,-348 L 0,-316 L 26,-348 L 66,-348 L 60,-196 L -60,-196 Z"
      fill={VEST}
      stroke={INK}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    {/* garis tengah rompi */}
    <path d="M 0,-316 L 0,-196" stroke="#6e747a" strokeWidth={2.5} />
    {/* garis reflektif */}
    <rect x={-58} y={-302} width={116} height={9} fill={VEST_LIGHT} />
    <rect x={-58} y={-256} width={116} height={9} fill={VEST_LIGHT} />
    {/* kantong bawah + tutup */}
    <rect x={-50} y={-240} width={32} height={24} rx={3} fill={VEST_DARK} stroke={INK} strokeWidth={3.5} />
    <rect x={18} y={-240} width={32} height={24} rx={3} fill={VEST_DARK} stroke={INK} strokeWidth={3.5} />
    <path d="M -50,-232 L -18,-232 M 18,-232 L 50,-232" stroke={INK} strokeWidth={2.5} />
    {/* name tag DEDI */}
    <rect x={16} y={-282} width={34} height={13} fill="#fff" stroke={INK} strokeWidth={2.5} />
    <text x={33} y={-272} fontSize={9.5} fontWeight={800} textAnchor="middle" fill={INK} fontFamily="Arial, sans-serif">
      DEDI
    </text>
  </g>
);

/* ---------------- rig lengkap ---------------- */

export const DediRig: React.FC<DediRigProps> = ({
  x = 0,
  floor = 0,
  scale = 1,
  flip = false,
  mood = "neutral",
  handL = "telapak",
  handR = "telapak",
  shoulderL = 0,
  shoulderR = 0,
  elbowL = 0,
  elbowR = 0,
  wristL = 0,
  wristR = 0,
  hipL = 0,
  hipR = 0,
  kneeL = 0,
  kneeR = 0,
  headTilt = 0,
  bounce = 0,
}) => (
  <g transform={`translate(${x},${floor + bounce}) scale(${flip ? -scale : scale},${scale})`}>
    {/* bayangan lantai */}
    <ellipse cx={0} cy={2} rx={92} ry={12} fill="#000" opacity={0.08} />
    {/* kaki */}
    <g transform="translate(-24,-198)">
      <Leg hip={hipL} knee={kneeL} flip />
    </g>
    <g transform="translate(24,-198)">
      <Leg hip={hipR} knee={kneeR} />
    </g>
    {/* badan */}
    <Torso />
    {/* kepala (putar di leher 0,-360) */}
    <g transform={`rotate(${headTilt} 0 -360)`}>
      <Head mood={mood} />
    </g>
    {/* lengan kiri (belakang) + kanan (depan) */}
    <g transform="translate(-60,-330)">
      <Arm shoulder={shoulderL} elbow={elbowL} wrist={wristL} hand={handL} />
    </g>
    <g transform="translate(60,-330)">
      <Arm shoulder={shoulderR} elbow={elbowR} wrist={wristR} hand={handR} />
    </g>
  </g>
);
