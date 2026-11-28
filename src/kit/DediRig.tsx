import React from "react";

/**
 * DediRig v2 — rig vektor DETAIL Dedi Santoso, DITRACING dari sheet modular
 * BARU (dedi-modular-breakdown.jpg, 28 Nov 2026).
 *
 * Perbedaan dari pilot v1 (breakdown-04 + style-reference):
 *  - Kepala JAUH lebih besar (~34% tinggi total, sesuai sheet) + rambut
 *    spike coklat besar menutupi puncak kepala (bukan helm + jambul kecil).
 *  - Lengan & kaki TIPIS HITAM dengan SENDI BOLA (bahu/siku/pinggul/lutut),
 *    sesuai panel Arms / Legs & Shoes di sheet — bukan lengan putih tebal.
 *  - Tangan HITAM solid (telapak/kepal/tunjuk/jempol/peace), bukan kulit.
 *  - Sepatu sneaker detail: sol putih + tali putih.
 *  - Helm BUKAN dipakai — jadi PROP yang dipegang (hero pose: helm di tangan).
 *  - 6 ekspresi sesuai sheet: normal / happy / angry / worried / sad /
 *    surprised (+ determined = varian tegas ala hero pose).
 *
 * Sendi (pivot transform): bahu, siku, pinggul, lutut. Prop mood ganti
 * bagian wajah; prop hand ganti pose tangan; prop held ganti barang di tangan.
 *
 * Koordinat lokal: origin (0,0) = tanah di tengah telapak kaki, sumbu y
 * negatif ke atas. Tinggi total ~530 unit. DRAFT PREVIEW — jangan dipakai
 * episode sebelum Avenir menyetujui.
 */

export type DediMood = "neutral" | "smile" | "worried" | "determined" | "angry" | "surprised";
export type DediHand = "telapak" | "kepal" | "peace" | "tunjuk" | "jempol";
export type DediHeld = "none" | "helm" | "clipboard" | "ht";

export interface DediRigProps {
  x?: number;
  floor?: number;
  scale?: number;
  flip?: boolean;
  mood?: DediMood;
  handL?: DediHand;
  handR?: DediHand;
  heldL?: DediHeld;
  heldR?: DediHeld;
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
const SKIN = "#fffdf5";
const HAIR = "#5a3a26";
const VEST = "#9aa0a6";
const VEST_DARK = "#878d94";
const STRIPE = "#eef0f2";
const PANTS = "#1b1b1b";
const LIMB = "#1b1b1b";
const RED = "#e53935";
const MOUTH_RED = "#8c3a2b";
const TONGUE = "#e86a6a";

/* ---------------- wajah ---------------- */

const Brows: React.FC<{ mood: DediMood }> = ({ mood }) => {
  const s = { stroke: INK, strokeWidth: 4.5, strokeLinecap: "round" as const, fill: "none" };
  if (mood === "smile") {
    return (
      <g {...s}>
        <path d="M -52,-452 Q -36,-458 -20,-452" />
        <path d="M 20,-452 Q 36,-458 52,-452" />
      </g>
    );
  }
  if (mood === "determined") {
    return (
      <g {...s}>
        <path d="M -54,-444 L -20,-454" />
        <path d="M 20,-454 L 54,-444" />
      </g>
    );
  }
  if (mood === "angry") {
    return (
      <g {...s}>
        <path d="M -52,-440 L -22,-456" />
        <path d="M 22,-456 L 52,-440" />
      </g>
    );
  }
  if (mood === "worried") {
    return (
      <g {...s}>
        <path d="M -52,-446 Q -36,-460 -20,-450" />
        <path d="M 20,-450 Q 36,-460 52,-446" />
      </g>
    );
  }
  if (mood === "sad") {
    return (
      <g {...s}>
        <path d="M -52,-448 Q -36,-452 -20,-448" />
        <path d="M 20,-448 Q 36,-452 52,-448" />
      </g>
    );
  }
  if (mood === "surprised") {
    return (
      <g {...s}>
        <path d="M -52,-464 Q -36,-470 -20,-464" />
        <path d="M 20,-464 Q 36,-470 52,-464" />
      </g>
    );
  }
  // neutral: sedikit miring ke dalam (seperti sheet Normal)
  return (
    <g {...s}>
      <path d="M -52,-450 L -22,-446" />
      <path d="M 22,-446 L 52,-450" />
    </g>
  );
};

const Eyes: React.FC<{ mood: DediMood }> = ({ mood }) => {
  if (mood === "smile") {
    // mata tertutup bahagia (busur)
    return (
      <g stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none">
        <path d="M -46,-425 Q -36,-437 -26,-425" />
        <path d="M 26,-425 Q 36,-437 46,-425" />
      </g>
    );
  }
  if (mood === "sad") {
    // kelopak terkulai: oval + penutup putih di sepertiga atas + garis kelopak
    return (
      <g>
        <ellipse cx={-36} cy={-425} rx={9} ry={14} fill={INK} />
        <ellipse cx={36} cy={-425} rx={9} ry={14} fill={INK} />
        <rect x={-45} y={-441} width={18} height={11} fill={SKIN} />
        <rect x={27} y={-441} width={18} height={11} fill={SKIN} />
        <line x1={-45} y1={-430} x2={-27} y2={-430} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        <line x1={27} y1={-430} x2={45} y2={-430} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      </g>
    );
  }
  const ry = mood === "surprised" ? 17 : 14;
  return (
    <g>
      <ellipse cx={-36} cy={-425} rx={9} ry={ry} fill={INK} />
      <ellipse cx={36} cy={-425} rx={9} ry={ry} fill={INK} />
      <circle cx={-38} cy={-430} r={2.5} fill="#fff" />
      <circle cx={34} cy={-430} r={2.5} fill="#fff" />
    </g>
  );
};

const Mouth: React.FC<{ mood: DediMood }> = ({ mood }) => {
  if (mood === "smile") {
    return (
      <g>
        <path
          d="M -20,-392 Q 0,-386 20,-392 Q 17,-364 0,-364 Q -17,-364 -20,-392 Z"
          fill={MOUTH_RED}
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <ellipse cx={0} cy={-369} rx={7} ry={4} fill={TONGUE} />
      </g>
    );
  }
  if (mood === "angry") {
    return (
      <g>
        <path
          d="M -15,-380 Q 0,-374 15,-380 Q 13,-362 0,-362 Q -13,-362 -15,-380 Z"
          fill={MOUTH_RED}
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <ellipse cx={0} cy={-366} rx={6} ry={3.5} fill={TONGUE} />
      </g>
    );
  }
  if (mood === "surprised") {
    return (
      <g>
        <ellipse cx={0} cy={-380} rx={12} ry={14} fill={MOUTH_RED} stroke={INK} strokeWidth={3.5} />
        <ellipse cx={0} cy={-375} rx={7} ry={5} fill={TONGUE} />
      </g>
    );
  }
  if (mood === "worried" || mood === "sad") {
    return (
      <path d="M -9,-379 Q 0,-385 9,-379" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
    );
  }
  if (mood === "determined") {
    return (
      <path d="M -13,-384 L 13,-386" stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none" />
    );
  }
  return (
    <path d="M -9,-383 Q 0,-379 9,-383" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
  );
};

/** Kepala lengkap: telinga + wajah + rambut spike besar. Pusat kepala (0,-445). */
const Head: React.FC<{ mood: DediMood }> = ({ mood }) => (
  <g>
    {/* telinga */}
    <ellipse cx={-95} cy={-428} rx={9} ry={13} fill={SKIN} stroke={INK} strokeWidth={4} />
    <ellipse cx={95} cy={-428} rx={9} ry={13} fill={SKIN} stroke={INK} strokeWidth={4} />
    {/* wajah: kepala besar bulat */}
    <ellipse cx={0} cy={-445} rx={98} ry={90} fill={SKIN} stroke={INK} strokeWidth={6} />
    {/* rambut spike: massa besar menyapu ke kanan, poni bergerigi di dahi.
        Puncak spike melewati puncak kepala (y -535) supaya tidak ada
        pita putih di atas rambut — sesuai sheet (rambut menutupi puncak). */}
    <path
      d="M -102,-430 L -118,-478 L -96,-462 L -112,-508 L -84,-480 L -92,-526 L -64,-490 L -58,-540 L -34,-498 L -22,-544 L 0,-502 L 18,-538 L 40,-500 L 60,-534 L 76,-496 L 96,-518 L 92,-478 L 116,-468 L 100,-432 L 78,-452 L 60,-434 L 42,-452 L 24,-436 L 6,-454 L -12,-438 L -30,-454 L -48,-438 L -66,-452 L -84,-436 Z"
      fill={HAIR}
      stroke={INK}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <Brows mood={mood} />
    <Eyes mood={mood} />
    <Mouth mood={mood} />
    {mood === "smile" && (
      <g fill="#f0a0a0" opacity={0.85}>
        <ellipse cx={-54} cy={-390} rx={9} ry={5} />
        <ellipse cx={54} cy={-390} rx={9} ry={5} />
      </g>
    )}
    {mood === "surprised" && (
      <g stroke={INK} strokeWidth={4} strokeLinecap="round">
        <line x1={122} y1={-468} x2={132} y2={-482} />
        <line x1={128} y1={-440} x2={140} y2={-440} />
        <line x1={122} y1={-412} x2={132} y2={-398} />
      </g>
    )}
  </g>
);

/* ---------------- tangan (5 pose, HITAM solid sesuai sheet) ---------------- */

/** Tangan digambar menghadap penonton, jari mengarah +y (menjauhi pergelangan). */
const Hand: React.FC<{ pose: DediHand }> = ({ pose }) => {
  const s = { fill: LIMB, stroke: INK, strokeWidth: 3.5, strokeLinejoin: "round" as const };
  if (pose === "kepal") {
    return (
      <g {...s}>
        <rect x={-12} y={2} width={24} height={26} rx={9} />
        <circle cx={-7} cy={6} r={3} fill={INK} />
        <circle cx={0} cy={5} r={3} fill={INK} />
        <circle cx={7} cy={6} r={3} fill={INK} />
      </g>
    );
  }
  if (pose === "peace") {
    return (
      <g {...s}>
        <ellipse cx={0} cy={16} rx={11} ry={12} />
        <rect x={-11} y={20} width={6} height={22} rx={3} transform="rotate(-14 -8 28)" />
        <rect x={5} y={20} width={6} height={22} rx={3} transform="rotate(14 8 28)" />
        <circle cx={-6} cy={10} r={3} fill={INK} />
        <circle cx={6} cy={10} r={3} fill={INK} />
      </g>
    );
  }
  if (pose === "tunjuk") {
    return (
      <g {...s}>
        <rect x={-12} y={4} width={24} height={24} rx={9} />
        <rect x={1} y={20} width={6} height={24} rx={3} transform="rotate(8 4 32)" />
        <circle cx={-7} cy={8} r={3} fill={INK} />
        <circle cx={7} cy={8} r={3} fill={INK} />
      </g>
    );
  }
  if (pose === "jempol") {
    return (
      <g {...s}>
        <rect x={-12} y={2} width={24} height={26} rx={9} />
        {/* jempol: menunjuk -y (ke arah siku) tapi DI SAMPING kepalan,
            supaya kelihatan di samping lengan bawah, bukan tertutup lengan */}
        <rect x={-17} y={-28} width={9} height={30} rx={4.5} transform="rotate(-8 -12 -12)" />
        <circle cx={-7} cy={6} r={3} fill={INK} />
        <circle cx={0} cy={5} r={3} fill={INK} />
        <circle cx={7} cy={6} r={3} fill={INK} />
      </g>
    );
  }
  // telapak (terbuka)
  return (
    <g {...s}>
      <ellipse cx={0} cy={14} rx={12} ry={13} />
      <rect x={-12} y={22} width={5.5} height={16} rx={2.75} transform="rotate(-8 -9 28)" />
      <rect x={-4} y={24} width={5.5} height={18} rx={2.75} />
      <rect x={4} y={24} width={5.5} height={18} rx={2.75} />
      <rect x={11} y={22} width={5.5} height={16} rx={2.75} transform="rotate(8 14 28)" />
      <rect x={-16} y={12} width={5.5} height={14} rx={2.75} transform="rotate(-38 -13 18)" />
    </g>
  );
};

/* ---------------- props ---------------- */

/** Helm safety putih garis merah — origin di tengah rim (dipegang dari atas). */
export const Helmet: React.FC = () => (
  <g>
    <path d="M -52,0 A 52,46 0 0 1 52,0 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -9,-44 Q 0,-48 9,-44 L 9,0 L -9,0 Z" fill={RED} />
    <circle cx={0} cy={-46} r={5} fill={RED} stroke="#fff" strokeWidth={2} />
    <rect x={-52} y={-8} width={104} height={10} fill={RED} stroke={INK} strokeWidth={3} />
    <rect x={-58} y={0} width={116} height={10} rx={4} fill="#fff" stroke={INK} strokeWidth={4} />
  </g>
);

/** Clipboard checklist — origin di tengah atas klip. */
export const Clipboard: React.FC = () => (
  <g>
    <rect x={-34} y={-6} width={68} height={92} rx={6} fill="#fdf8ea" stroke={INK} strokeWidth={4} />
    <rect x={-14} y={-14} width={28} height={16} rx={4} fill="#4a4a4f" stroke={INK} strokeWidth={3} />
    {[6, 26, 46, 66].map((y) => (
      <g key={y}>
        <rect x={-26} y={y} width={10} height={10} rx={2} fill="none" stroke={RED} strokeWidth={2.5} />
        <path d={`M -25,${y + 5} L -22,${y + 8} L -17,${y + 1}`} stroke={RED} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <line x1={-8} y1={y + 5} x2={26} y2={y + 5} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      </g>
    ))}
  </g>
);

/** Handy-talkie (HT) — origin di tengah. */
export const HT: React.FC = () => (
  <g>
    <rect x={-22} y={-8} width={16} height={52} rx={4} fill="#2b2b2e" stroke={INK} strokeWidth={4} transform="rotate(8 -14 18)" />
    <line x1={-14} y1={-58} x2={-14} y2={-10} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <rect x={-20} y={-6} width={40} height={64} rx={8} fill="#3a3a3f" stroke={INK} strokeWidth={4} />
    <rect x={-13} y={2} width={26} height={16} rx={3} fill="#8f969b" stroke={INK} strokeWidth={2.5} />
    {[20, 30, 40].map((y) => (
      <circle key={y} cx={-8} cy={y} r={3} fill="#1b1b1b" />
    ))}
    {[20, 30, 40].map((y) => (
      <circle key={y} cx={8} cy={y} r={3} fill="#1b1b1b" />
    ))}
  </g>
);

/** Barang di tangan — dipasang di pergelangan (origin = pergelangan). */
const Held: React.FC<{ kind: DediHeld }> = ({ kind }) => {
  if (kind === "helm") {
    return (
      <g transform="translate(0,20) rotate(12)">
        <Helmet />
      </g>
    );
  }
  if (kind === "clipboard") {
    return (
      <g transform="translate(0,10) rotate(-8)">
        <Clipboard />
      </g>
    );
  }
  if (kind === "ht") {
    return (
      <g transform="translate(0,14) rotate(10)">
        <HT />
      </g>
    );
  }
  return null;
};

/* ---------------- lengan & kaki ---------------- */

const Arm: React.FC<{
  shoulder: number;
  elbow: number;
  wrist: number;
  hand: DediHand;
  held: DediHeld;
}> = ({ shoulder, elbow, wrist, hand, held }) => (
  <g transform={`rotate(${shoulder})`}>
    {/* lengan atas: bahu (0,0) -> siku (0,72), sendi bola di bahu */}
    <circle cx={0} cy={0} r={10} fill={LIMB} stroke={INK} strokeWidth={4} />
    <path
      d="M -6.5,0 L 6.5,0 L 6.5,58 Q 6.5,72 0,72 Q -6.5,72 -6.5,58 Z"
      fill={LIMB}
      stroke={INK}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <g transform={`translate(0,72) rotate(${elbow})`}>
      {/* lengan bawah: siku (0,0) -> pergelangan (0,66), sendi bola di siku */}
      <circle cx={0} cy={0} r={8} fill={LIMB} stroke={INK} strokeWidth={4} />
      <path
        d="M -6,0 L 6,0 L 6,54 Q 6,66 0,66 Q -6,66 -6,54 Z"
        fill={LIMB}
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <g transform={`translate(0,66) rotate(${wrist})`}>
        <Hand pose={hand} />
        <Held kind={held} />
      </g>
    </g>
  </g>
);

const Leg: React.FC<{ hip: number; knee: number; flip?: boolean }> = ({ hip, knee, flip }) => (
  <g transform={`rotate(${hip})`}>
    {/* paha: pinggul (0,0) -> lutut (0,88), sendi bola di pinggul */}
    <circle cx={0} cy={0} r={10} fill={LIMB} stroke={INK} strokeWidth={4} />
    <path
      d="M -7,0 L 7,0 L 7,76 Q 7,88 0,88 Q -7,88 -7,76 Z"
      fill={PANTS}
      stroke={INK}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <g transform={`translate(0,88) rotate(${knee})`}>
      {/* betis: lutut (0,0) -> pergelangan (0,88), sendi bola di lutut */}
      <circle cx={0} cy={0} r={8} fill={LIMB} stroke={INK} strokeWidth={4} />
      <path
        d="M -7,0 L 7,0 L 7,76 Q 7,88 0,88 Q -7,88 -7,76 Z"
        fill={PANTS}
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      {/* sepatu sneaker: ujung ke arah luar (flip untuk kaki kiri) */}
      <g transform={`translate(0,88) scale(${flip ? -1 : 1},1)`}>
        <path
          d="M -15,0 L 14,0 C 30,0 36,7 34,15 L 32,19 L -17,19 C -23,13 -21,4 -15,0 Z"
          fill="#262626"
          stroke={INK}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <path d="M -17,13 L 32,13 L 32,19 L -17,19 Z" fill="#f2f2f2" stroke={INK} strokeWidth={3} />
        <line x1={-2} y1={4} x2={8} y2={4} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={-2} y1={9} x2={8} y2={9} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    </g>
  </g>
);

/* ---------------- badan ---------------- */

const Torso: React.FC = () => (
  <g>
    {/* kemeja putih + lengan pendek */}
    <path d="M -58,-340 L 58,-340 L 56,-196 L -56,-196 Z" fill="#fff" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
    <path d="M -58,-338 L -78,-314 L -72,-292 L -56,-298 Z" fill="#fff" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
    <path d="M 58,-338 L 78,-314 L 72,-292 L 56,-298 Z" fill="#fff" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
    {/* kerah kemeja */}
    <path d="M -18,-340 L -2,-320 L -2,-334 L -16,-344 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M 18,-340 L 2,-320 L 2,-334 L 16,-344 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    {/* dasi hitam */}
    <path d="M -8,-338 L 8,-338 L 6,-326 L -6,-326 Z" fill={INK} />
    <path d="M -6,-326 L 6,-326 L 9,-296 L 0,-284 L -9,-296 Z" fill={INK} />
    {/* rompi abu-abu: bukaan V di dada, belahan V kecil di hem bawah */}
    <path
      d="M -66,-338 L -10,-338 L 0,-312 L 10,-338 L 66,-338 L 62,-196 L 8,-196 L 0,-204 L -8,-196 L -62,-196 Z"
      fill={VEST}
      stroke={INK}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    {/* garis reflektif putih (2) */}
    <rect x={-60} y={-264} width={120} height={10} fill={STRIPE} />
    <rect x={-60} y={-234} width={120} height={10} fill={STRIPE} />
    {/* resleting tengah */}
    <line x1={0} y1={-312} x2={0} y2={-196} stroke="#6e747a" strokeWidth={2.5} />
    {/* kantong bawah */}
    <rect x={-52} y={-216} width={28} height={16} rx={3} fill={VEST_DARK} stroke={INK} strokeWidth={3.5} />
    <rect x={24} y={-216} width={28} height={16} rx={3} fill={VEST_DARK} stroke={INK} strokeWidth={3.5} />
    {/* name tag DEDI — panel kanan (sesuai sheet) */}
    <rect x={18} y={-298} width={34} height={13} fill="#fff" stroke={INK} strokeWidth={2.5} />
    <text x={35} y={-288} fontSize={9.5} fontWeight={800} textAnchor="middle" fill={INK} fontFamily="Arial, sans-serif">
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
  heldL = "none",
  heldR = "none",
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
    {/* kaki: pinggul di (±24,-196) */}
    <g transform="translate(-24,-196)">
      <Leg hip={hipL} knee={kneeL} flip />
    </g>
    <g transform="translate(24,-196)">
      <Leg hip={hipR} knee={kneeR} />
    </g>
    {/* leher */}
    <rect x={-14} y={-360} width={28} height={20} fill={SKIN} stroke={INK} strokeWidth={4} />
    {/* badan */}
    <Torso />
    {/* kepala (putar di leher 0,-360) */}
    <g transform={`rotate(${headTilt} 0 -360)`}>
      <Head mood={mood} />
    </g>
    {/* lengan kiri (belakang) + kanan (depan): bahu di (±58,-318) */}
    <g transform="translate(-58,-318)">
      <Arm shoulder={shoulderL} elbow={elbowL} wrist={wristL} hand={handL} held={heldL} />
    </g>
    <g transform="translate(58,-318)">
      <Arm shoulder={shoulderR} elbow={elbowR} wrist={wristR} hand={handR} held={heldR} />
    </g>
  </g>
);
