import React from "react";

/**
 * DediRig v3 — rig vektor DETAIL Dedi Santoso, DITRACING dari sheet modular
 * (dedi-modular-breakdown.jpg, 28 Nov 2026). Ronde 1: perbaikan SEMUA
 * mismatch v2.4 (MISMATCH-v2.4.md, skor 53% -> target >=95%).
 *
 * Perubahan vs v2.4:
 *  - Rambut DIGAMBAR ULANG: messy tersapu, strand panjang jatuh melewati
 *    telinga di kedua sisi, fringe zigzag TIDAK beraturan (titik & lembah
 *    bervariasi), coklat medium #6b4226 + highlight strand coklat muda.
 *    Tidak ada lagi mahkota segitiga simetris; tidak ada garis putih di
 *    puncak (rambut menutup penuh sampai y -606, di atas puncak kepala).
 *  - Kepala OVAL TEGAK: rx 80 / ry 92 (rasio 1.15:1), bukan bulat lebar.
 *  - Mata oval vertikal TINGGI (rx 8.5 / ry 19), hitam solid TANPA highlight.
 *  - Alis MIRING (garis lurus) di SEMUA ekspresi, termasuk neutral.
 *  - Happy = mata TERBUKA + alis miring + mulut terbuka; blush DIHAPUS.
 *  - Rompi DIPERSempit: lebar 116 (~72% lebar kepala 160), taper ringan,
 *    dasi hitam PANJANG sampai tengah dada, lengan pendek putih jelas,
 *    kantong flap halus.
 *  - Jempol DIGAMBAR ULANG: kepalan + 3 alur jari + jempol TEBAL tegak di
 *    sisi kepalan, bersih dari lengan bawah (tpl-thumb.png).
 *  - Sepatu sneaker CHUNKY: toe bulat, sol putih TEBAL membungkus, 3 garis
 *    tali, tongue + kerah ankle (tpl-sneaker.png).
 *  - Proporsi: total ~606; kaki dipanjangkan (pinggul -236 -> tanah 0 =
 *    236), torso dipersempit; figur langsing, bukan chibi gemuk.
 *  - Outline DITIPISKAN di mana-mana (wajah 6->4, rompi 5->3.5, dst).
 *  - Helm: dome bulat PENUH (bukan setengah mangkuk miring).
 *
 * Sendi (pivot transform): bahu, siku, pinggul, lutut. Prop mood ganti
 * bagian wajah; prop hand ganti pose tangan; prop held ganti barang di tangan.
 *
 * Koordinat lokal: origin (0,0) = tanah di tengah telapak kaki, sumbu y
 * negatif ke atas. Tinggi total ~606 unit. DRAFT PREVIEW — jangan dipakai
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
const HAIR = "#6b4226";
const HAIR_HI = "#8a5a33";
const HAIR_DARK = "#4a2c17";
const VEST = "#9aa0a6";
const VEST_DARK = "#878d94";
const STRIPE = "#eef0f2";
const PANTS = "#1b1b1b";
const LIMB = "#1b1b1b";
const RED = "#e53935";
const MOUTH_RED = "#8c3a2b";
const TONGUE = "#e86a6a";

/* ---------------- wajah ---------------- */

/** Alis MIRING (garis lurus) di SEMUA ekspresi — sesuai sheet: ujung dalam
 *  lebih rendah (neutral/smile/determined/angry/surprised), kecuali
 *  worried yang ujung dalamnya terangkat. */
const Brows: React.FC<{ mood: DediMood }> = ({ mood }) => {
  const s = { stroke: INK, strokeWidth: 4, strokeLinecap: "round" as const, fill: "none" };
  if (mood === "smile") {
    return (
      <g {...s}>
        <path d="M -48,-494 L -14,-487" />
        <path d="M 14,-487 L 48,-494" />
      </g>
    );
  }
  if (mood === "determined") {
    return (
      <g {...s}>
        <path d="M -50,-494 L -14,-480" />
        <path d="M 14,-480 L 50,-494" />
      </g>
    );
  }
  if (mood === "angry") {
    return (
      <g {...s}>
        <path d="M -50,-486 L -14,-476" />
        <path d="M 14,-476 L 50,-486" />
      </g>
    );
  }
  if (mood === "worried") {
    return (
      <g {...s}>
        <path d="M -48,-482 L -14,-492" />
        <path d="M 14,-492 L 48,-482" />
      </g>
    );
  }
  if (mood === "surprised") {
    return (
      <g {...s}>
        <path d="M -48,-500 L -14,-494" />
        <path d="M 14,-494 L 48,-500" />
      </g>
    );
  }
  // neutral: miring ke dalam (ujung dalam lebih rendah) — seperti sheet Normal
  return (
    <g {...s}>
      <path d="M -48,-490 L -14,-482" />
      <path d="M 14,-482 L 48,-490" />
    </g>
  );
};

/** Mata oval vertikal TINGGI, hitam solid TANPA highlight — semua mood
 *  bermata terbuka (termasuk Happy, sesuai sheet). */
const Eyes: React.FC<{ mood: DediMood }> = ({ mood }) => {
  const ry = mood === "surprised" ? 21 : 19;
  return (
    <g>
      <ellipse cx={-30} cy={-458} rx={8.5} ry={ry} fill={INK} />
      <ellipse cx={30} cy={-458} rx={8.5} ry={ry} fill={INK} />
    </g>
  );
};

const Mouth: React.FC<{ mood: DediMood }> = ({ mood }) => {
  if (mood === "smile") {
    // Happy sheet: mulut terbuka lebar + lidah merah (mata tetap terbuka)
    return (
      <g>
        <path
          d="M -20,-420 Q 0,-414 20,-420 Q 17,-392 0,-392 Q -17,-392 -20,-420 Z"
          fill={MOUTH_RED}
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <ellipse cx={0} cy={-397} rx={7} ry={4} fill={TONGUE} />
      </g>
    );
  }
  if (mood === "angry") {
    return (
      <g>
        <path
          d="M -15,-412 Q 0,-406 15,-412 Q 13,-394 0,-394 Q -13,-394 -15,-412 Z"
          fill={MOUTH_RED}
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <ellipse cx={0} cy={-398} rx={6} ry={3.5} fill={TONGUE} />
      </g>
    );
  }
  if (mood === "surprised") {
    return (
      <g>
        <ellipse cx={0} cy={-410} rx={12} ry={14} fill={MOUTH_RED} stroke={INK} strokeWidth={3} />
        <ellipse cx={0} cy={-405} rx={7} ry={5} fill={TONGUE} />
      </g>
    );
  }
  if (mood === "worried") {
    return (
      <path d="M -9,-408 Q 0,-414 9,-408" stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
    );
  }
  if (mood === "determined") {
    return (
      <path d="M -13,-414 L 13,-416" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
    );
  }
  return (
    <path d="M -9,-414 Q 0,-410 9,-414" stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
  );
};

/** Kepala lengkap: telinga + wajah oval tegak + rambut messy tersapu.
 *  Pusat kepala (0,-478). Rambut menutup puncak sampai y -606. */
const Head: React.FC<{ mood: DediMood }> = ({ mood }) => (
  <g>
    {/* telinga */}
    <ellipse cx={-80} cy={-462} rx={8} ry={12} fill={SKIN} stroke={INK} strokeWidth={3} />
    <ellipse cx={80} cy={-462} rx={8} ry={12} fill={SKIN} stroke={INK} strokeWidth={3} />
    {/* wajah: oval tegak 160 x 184 (rasio 1.15:1) */}
    <ellipse cx={0} cy={-478} rx={80} ry={92} fill={SKIN} stroke={INK} strokeWidth={4} />
    {/* rambut messy tersapu — ditracing dari tpl-hair.png / tpl-front.png:
        massa menyapu ke samping, spike luar tidak beraturan, strand panjang
        jatuh melewati telinga (ujung -400/-408), fringe zigzag bervariasi
        (titik -496..-500, lembah -516..-520). */}
    <path
      d="M -88,-400 L -102,-434 L -90,-442 L -106,-464 L -88,-468 L -102,-494 L -82,-492 L -90,-524 L -66,-508 L -68,-544 L -44,-524 L -38,-596 L -12,-572 L 0,-606 L 22,-576 L 44,-600 L 60,-574 L 78,-594 L 88,-566 L 104,-574 L 96,-542 L 112,-528 L 96,-508 L 108,-484 L 92,-472 L 100,-448 L 86,-440 L 90,-408 L 78,-434 L 68,-458 L 60,-496 L 48,-516 L 34,-498 L 22,-518 L 8,-500 L -6,-520 L -20,-500 L -34,-518 L -48,-500 L -62,-516 L -74,-494 L -84,-448 Z"
      fill={HAIR}
      stroke={INK}
      strokeWidth={3.5}
      strokeLinejoin="round"
    />
    {/* highlight strand coklat muda mengikuti arah sapuan */}
    <g stroke={HAIR_HI} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.75}>
      <path d="M -70,-522 Q -30,-560 30,-556" />
      <path d="M -62,-484 Q -10,-512 52,-502" />
      <path d="M 18,-582 Q 58,-562 88,-532" />
    </g>
    {/* garis pemisah strand (coklat gelap) */}
    <g stroke={HAIR_DARK} strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.6}>
      <path d="M -78,-500 Q -50,-540 -6,-548" />
      <path d="M 40,-540 Q 70,-520 92,-492" />
    </g>
    <Brows mood={mood} />
    <Eyes mood={mood} />
    <Mouth mood={mood} />
    {mood === "surprised" && (
      <g stroke={INK} strokeWidth={3.5} strokeLinecap="round">
        <line x1={100} y1={-492} x2={108} y2={-504} />
        <line x1={105} y1={-464} x2={116} y2={-464} />
        <line x1={100} y1={-436} x2={108} y2={-424} />
      </g>
    )}
  </g>
);

/* ---------------- tangan (5 pose, HITAM solid sesuai sheet) ---------------- */

/** Tangan digambar menghadap penonton, jari mengarah +y (menjauhi pergelangan).
 *  Kepalan sheet: 3 alur jari melengkung di depan kepalan. */
const FistGrooves: React.FC = () => (
  <g stroke={INK} strokeWidth={2.5} strokeLinecap="round" fill="none">
    <path d="M -8,10 Q 0,13 8,10" />
    <path d="M -8,17 Q 0,20 8,17" />
    <path d="M -8,24 Q 0,27 8,24" />
  </g>
);

const Hand: React.FC<{ pose: DediHand }> = ({ pose }) => {
  const s = { fill: LIMB, stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const };
  if (pose === "kepal") {
    return (
      <g {...s}>
        <rect x={-12} y={2} width={24} height={26} rx={9} />
        <FistGrooves />
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
    // Ditracing dari tpl-thumb.png: kepalan + jempol TEBAL tegak di SISI
    // kepalan (x -21..-9, bersih dari lengan bawah yang lebarnya -6..6),
    // menjulang 32 unit di atas kepalan, ujung membulat, sedikit miring
    // ke luar supaya terbaca sebagai jempol, bukan tonjolan.
    return (
      <g {...s}>
        <rect x={-21} y={-32} width={12} height={36} rx={6} transform="rotate(-10 -15 -14)" />
        <rect x={-12} y={2} width={24} height={26} rx={9} />
        <FistGrooves />
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

/** Helm safety putih garis merah — dome bulat PENUH, origin di tengah rim. */
export const Helmet: React.FC = () => (
  <g>
    <path d="M -54,0 A 54,52 0 0 1 54,0 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -10,-50 Q 0,-54 10,-50 L 10,0 L -10,0 Z" fill={RED} />
    <circle cx={0} cy={-52} r={5} fill={RED} stroke="#fff" strokeWidth={2} />
    <rect x={-54} y={-9} width={108} height={10} fill={RED} stroke={INK} strokeWidth={3} />
    <rect x={-60} y={0} width={120} height={9} rx={4} fill="#fff" stroke={INK} strokeWidth={3.5} />
  </g>
);

/** Clipboard checklist — origin di tengah atas klip. */
export const Clipboard: React.FC = () => (
  <g>
    <rect x={-34} y={-6} width={68} height={92} rx={6} fill="#fdf8ea" stroke={INK} strokeWidth={3.5} />
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
    <rect x={-22} y={-8} width={16} height={52} rx={4} fill="#2b2b2e" stroke={INK} strokeWidth={3.5} transform="rotate(8 -14 18)" />
    <line x1={-14} y1={-58} x2={-14} y2={-10} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <rect x={-20} y={-6} width={40} height={64} rx={8} fill="#3a3a3f" stroke={INK} strokeWidth={3.5} />
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
    <circle cx={0} cy={0} r={9} fill={LIMB} stroke={INK} strokeWidth={3} />
    <path
      d="M -6.5,0 L 6.5,0 L 6.5,58 Q 6.5,72 0,72 Q -6.5,72 -6.5,58 Z"
      fill={LIMB}
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <g transform={`translate(0,72) rotate(${elbow})`}>
      {/* lengan bawah: siku (0,0) -> pergelangan (0,66), sendi bola di siku */}
      <circle cx={0} cy={0} r={7} fill={LIMB} stroke={INK} strokeWidth={3} />
      <path
        d="M -6,0 L 6,0 L 6,54 Q 6,66 0,66 Q -6,66 -6,54 Z"
        fill={LIMB}
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <g transform={`translate(0,66) rotate(${wrist})`}>
        <Hand pose={hand} />
        <Held kind={held} />
      </g>
    </g>
  </g>
);

/** Kaki: paha 108 + betis 108, pergelangan di (0,216). Sepatu chunky
 *  ditracing dari tpl-sneaker.png / tpl-legs.png: toe bulat, sol putih
 *  TEBAL membungkus bawah, 3 garis tali, tongue + kerah ankle. */
const Leg: React.FC<{ hip: number; knee: number; flip?: boolean }> = ({ hip, knee, flip }) => (
  <g transform={`rotate(${hip})`}>
    {/* paha: pinggul (0,0) -> lutut (0,108), sendi bola di pinggul */}
    <circle cx={0} cy={0} r={9} fill={LIMB} stroke={INK} strokeWidth={3} />
    <path
      d="M -7,0 L 7,0 L 7,96 Q 7,108 0,108 Q -7,108 -7,96 Z"
      fill={PANTS}
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <g transform={`translate(0,108) rotate(${knee})`}>
      {/* betis: lutut (0,0) -> pergelangan (0,108), sendi bola di lutut */}
      <circle cx={0} cy={0} r={7} fill={LIMB} stroke={INK} strokeWidth={3} />
      <path
        d="M -7,0 L 7,0 L 7,96 Q 7,108 0,108 Q -7,108 -7,96 Z"
        fill={PANTS}
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* sepatu sneaker chunky: ujung ke arah luar (flip untuk kaki kiri).
          Lokal: kerah -18, sol bawah +20 (= tanah). */}
      <g transform={`translate(0,108) scale(${flip ? -1 : 1},1)`}>
        {/* kerah ankle */}
        <path d="M -15,-6 Q 0,-18 15,-6 L 15,4 L -15,4 Z" fill="#262626" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        {/* tongue */}
        <rect x={-3} y={-16} width={14} height={14} rx={4} fill="#333333" stroke={INK} strokeWidth={2.5} />
        {/* badan atas: toe bulat membesar ke depan */}
        <path
          d="M -16,-4 L 10,-4 C 30,-4 38,3 36,12 L 34,14 L -18,14 C -24,8 -22,0 -16,-4 Z"
          fill="#262626"
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        {/* 3 garis tali putih */}
        <g stroke="#fff" strokeWidth={3} strokeLinecap="round">
          <line x1={0} y1={-1} x2={14} y2={-1} />
          <line x1={0} y1={4} x2={16} y2={4} />
          <line x1={2} y1={9} x2={18} y2={9} />
        </g>
        {/* sol putih TEBAL membungkus bawah */}
        <path
          d="M -20,12 L 36,12 C 39,12 39,20 34,20 L -18,20 C -24,20 -24,14 -20,12 Z"
          fill="#f2f2f2"
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      </g>
    </g>
  </g>
);

/* ---------------- badan ---------------- */

const Torso: React.FC = () => (
  <g>
    {/* kemeja putih + lengan pendek (jelas terlihat di luar rompi) */}
    <path d="M -56,-366 L 56,-366 L 54,-236 L -54,-236 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -54,-364 L -80,-340 L -74,-310 L -52,-322 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M 54,-364 L 80,-340 L 74,-310 L 52,-322 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    {/* kerah kemeja */}
    <path d="M -18,-366 L -2,-346 L -2,-360 L -16,-368 Z" fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M 18,-366 L 2,-346 L 2,-360 L 16,-368 Z" fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    {/* dasi hitam PANJANG sampai tengah dada (ujung runcing y -284) */}
    <path d="M -8,-364 L 8,-364 L 5,-348 L -5,-348 Z" fill={INK} />
    <path d="M -5,-348 L 5,-348 L 8,-300 L 0,-284 L -8,-300 Z" fill={INK} />
    {/* rompi abu-abu: lebar 116 (~72% lebar kepala 160), taper ringan
        ke hem 108, bukaan V di dada, belahan V kecil di hem bawah */}
    <path
      d="M -58,-366 L -14,-366 L 0,-338 L 14,-366 L 58,-366 L 54,-236 L 6,-236 L 0,-244 L -6,-236 L -54,-236 Z"
      fill={VEST}
      stroke={INK}
      strokeWidth={3.5}
      strokeLinejoin="round"
    />
    {/* garis reflektif putih (2) */}
    <rect x={-55} y={-302} width={110} height={9} fill={STRIPE} />
    <rect x={-54} y={-274} width={108} height={9} fill={STRIPE} />
    {/* resleting tengah (di bawah ujung dasi) */}
    <line x1={0} y1={-284} x2={0} y2={-236} stroke="#6e747a" strokeWidth={2} />
    {/* kantong flap halus */}
    <rect x={-48} y={-254} width={26} height={9} rx={2} fill={VEST_DARK} stroke={INK} strokeWidth={3} />
    <rect x={22} y={-254} width={26} height={9} rx={2} fill={VEST_DARK} stroke={INK} strokeWidth={3} />
    {/* name tag DEDI — panel kanan (sesuai sheet) */}
    <rect x={16} y={-332} width={32} height={12} fill="#fff" stroke={INK} strokeWidth={2.5} />
    <text x={32} y={-323} fontSize={9} fontWeight={800} textAnchor="middle" fill={INK} fontFamily="Arial, sans-serif">
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
    {/* kaki: pinggul di (±22,-236) */}
    <g transform="translate(-22,-236)">
      <Leg hip={hipL} knee={kneeL} flip />
    </g>
    <g transform="translate(22,-236)">
      <Leg hip={hipR} knee={kneeR} />
    </g>
    {/* leher */}
    <rect x={-13} y={-388} width={26} height={24} fill={SKIN} stroke={INK} strokeWidth={3.5} />
    {/* badan */}
    <Torso />
    {/* kepala (putar di leher 0,-368) */}
    <g transform={`rotate(${headTilt} 0 -368)`}>
      <Head mood={mood} />
    </g>
    {/* lengan kiri (belakang) + kanan (depan): bahu di (±50,-342) */}
    <g transform="translate(-50,-342)">
      <Arm shoulder={shoulderL} elbow={elbowL} wrist={wristL} hand={handL} held={heldL} />
    </g>
    <g transform="translate(50,-342)">
      <Arm shoulder={shoulderR} elbow={elbowR} wrist={wristR} hand={handR} held={heldR} />
    </g>
  </g>
);
