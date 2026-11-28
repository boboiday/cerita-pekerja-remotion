import React from "react";

/**
 * DediRig v4 — ronde 2 (MISMATCH-v3.md, skor 61% -> target >=95%).
 *
 * Perubahan vs v3:
 *  - FRAMING: demo scale 1.35 -> 1.15 (0.85x) supaya kepala+rambut utuh.
 *  - Alis DIGAMBAR ULANG: batang TEBAL berisi (poligon 36x8, bukan garis
 *    4px), miring ke dalam, di y -500..-492 — DI BAWAH fringe (ujung
 *    fringe terdalam -508) dan DI ATAS mata (puncak -477).
 *  - Rambut DIGAMBAR ULANG 3 lapis: mahkota lebar berspike lebar, 2
 *    helaian samping LEBAR (26-32) berujung runcing melewati telinga,
 *    fringe tersapu tak beraturan (ujung -508..-530). Telinga digambar
 *    SETELAH rambut supaya mengintip di bawah helaian, seperti sheet.
 *  - Dasi DIPINDAH ke ATAS rompi (digambar setelah rompi+stripes):
 *    hitam solid dari kerah sampai tengah dada (ujung -300).
 *  - Jempol DIGAMBAR ULANG: kepalan LEBAR (30) + jempol TEBAL (15)
 *    miring -14° di sisi kepalan, alur jari kontras (fill kepalan
 *    #2e2e33, alur #101010 — sebelumnya alur INK di atas fill
 *    nyaris-hitam sehingga tak terlihat).
 *  - Lengan baju putih DIKECILKAN: menempel bahu (keluar 14, bukan 26).
 *  - Sendi bahu r 9->6, siku r 7->5, pinggul r 9->7, lutut r 7->5.
 *  - Sepatu: toe dipersempit (36->30) supaya dua sepatu tak menyatu.
 *  - Outline wajah 4->3.5.
 */
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
const VEST = "#9aa0a6";
const VEST_DARK = "#878d94";
const STRIPE = "#eef0f2";
const PANTS = "#1b1b1b";
const LIMB = "#1b1b1b";
const RED = "#e53935";
const MOUTH_RED = "#8c3a2b";
const TONGUE = "#e86a6a";

/* ---------------- wajah ---------------- */

/** Alis BATANG TEBAL berisi (poligon 36x8) — sesuai sheet Normal/Happy:
 *  batang hitam tebal miring ke dalam (ujung dalam lebih rendah), BUKAN
 *  garis tipis. Posisi y -500..-492: di bawah fringe (ujung terdalam
 *  -508) dan di atas mata (puncak -477). Digambar SETELAH rambut supaya
 *  tidak tertutup. */
const browBar = (mirror: boolean, y0: number, drop: number) => {
  const s = mirror ? -1 : 1;
  const pts: [number, number][] = [
    [-52, y0],
    [-16, y0 + drop],
    [-16, y0 + drop + 8],
    [-52, y0 + 8],
  ];
  return <polygon points={pts.map(([x, y]) => `${s * x},${y}`).join(" ")} fill={INK} />;
};

const Brows: React.FC<{ mood: DediMood }> = ({ mood }) => {
  // [y0, drop] per mood — drop>0: ujung dalam lebih rendah
  const cfg: Record<DediMood, [number, number]> = {
    smile: [-500, 7],
    determined: [-502, 10],
    angry: [-500, 11],
    worried: [-498, -8],
    surprised: [-504, 4],
    neutral: [-500, 7],
  };
  const [y0, drop] = cfg[mood];
  return (
    <g>
      {browBar(false, y0, drop)}
      {browBar(true, y0, drop)}
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

/** Kepala lengkap: wajah oval tegak + rambut 3 lapis + telinga + wajah.
 *  Pusat kepala (0,-478). Rambut menutup puncak sampai y -610.
 *  Urutan: wajah -> mahkota -> helaian samping -> fringe -> highlight
 *  -> TELINGA (mengintip di bawah helaian, seperti sheet) -> alis/mata/mulut. */
const Head: React.FC<{ mood: DediMood }> = ({ mood }) => (
  <g>
    {/* wajah: oval tegak 160 x 184 (rasio 1.15:1) */}
    <ellipse cx={0} cy={-478} rx={80} ry={92} fill={SKIN} stroke={INK} strokeWidth={3.5} />
    {/* rambut — mahkota: dome lebar dengan spike ATAS beralas lebar
        (bukan segitiga tipis); alas bawah melengkung di y ~-532 */}
    <path
      d="M -92,-486 L -98,-528 L -86,-540 L -98,-566 L -72,-554 L -66,-594 L -40,-572 L -30,-606 L -8,-580 L 2,-610 L 22,-582 L 42,-602 L 54,-576 L 76,-594 L 84,-568 L 100,-574 L 92,-542 L 98,-514 Q 0,-550 -92,-514 L -92,-486 Z"
      fill={HAIR}
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    {/* helaian samping LEBAR berlapis (lebar 26-32, ujung runcing),
        mengalir ke bawah melewati telinga sampai y -396/-410 */}
    <path d="M -102,-522 L -74,-522 L -70,-446 L -83,-396 L -96,-446 L -106,-498 Z" fill={HAIR} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M -84,-512 L -60,-512 L -58,-442 L -71,-410 L -83,-446 Z" fill={HAIR} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M 74,-522 L 102,-522 L 106,-498 L 96,-446 L 83,-396 L 70,-446 Z" fill={HAIR} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M 60,-512 L 84,-512 L 83,-446 L 71,-410 L 58,-442 Z" fill={HAIR} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    {/* fringe tersapu ke satu sisi, zigzag TIDAK beraturan:
        ujung -508..-530 (terdalam -508, di atas alis -500) */}
    <path
      d="M -88,-538 L -88,-518 L -72,-530 L -58,-512 L -42,-532 L -26,-510 L -8,-530 L 8,-508 L 26,-528 L 42,-510 L 58,-526 L 72,-512 L 88,-524 L 88,-538 Q 0,-554 -88,-538 Z"
      fill={HAIR}
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    {/* highlight strand coklat muda — di dalam mahkota (y <= -552) */}
    <g stroke={HAIR_HI} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.75}>
      <path d="M -64,-562 Q -18,-582 36,-578" />
      <path d="M -50,-552 Q 0,-574 54,-562" />
      <path d="M 14,-592 Q 52,-576 84,-556" />
    </g>
    {/* telinga — setelah rambut supaya mengintip di bawah helaian */}
    <ellipse cx={-80} cy={-462} rx={8} ry={12} fill={SKIN} stroke={INK} strokeWidth={3} />
    <ellipse cx={80} cy={-462} rx={8} ry={12} fill={SKIN} stroke={INK} strokeWidth={3} />
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
 *  Kepalan sheet: 3 alur jari melengkung di depan kepalan. Alur harus
 *  KONTRAS: kepalan diisi #2e2e33 (lebih terang dari lengan #1b1b1b),
 *  alur digambar #101010 — di v3 alur INK di atas fill nyaris-hitam
 *  sehingga tidak terlihat sama sekali. */
const FIST_FILL = "#2e2e33";
const FistGrooves: React.FC = () => (
  <g stroke="#101010" strokeWidth={3} strokeLinecap="round" fill="none">
    <path d="M -10,10 Q 0,13 10,10" />
    <path d="M -10,17 Q 0,20 10,17" />
    <path d="M -10,24 Q 0,27 10,24" />
  </g>
);

const Hand: React.FC<{ pose: DediHand }> = ({ pose }) => {
  const s = { fill: LIMB, stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const };
  if (pose === "kepal") {
    return (
      <g stroke={INK} strokeWidth={3} strokeLinejoin="round" fill={FIST_FILL}>
        <rect x={-15} y={0} width={30} height={28} rx={10} />
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
    // Ditracing dari tpl-thumb.png / sheet jempol: kepalan LEBAR (30)
    // dengan 3 alur jari + SATU jempol TEBAL (lebar 15, jelas lebih lebar
    // dari lengan bawah 12) yang miring -14° menjauhi sumbu lengan,
    // menjulang 38 unit di atas kepalan, pangkal menyatu dengan kepalan.
    // Di v3 jempol setipis lengan bawah dan sejajar dengannya sehingga
    // terbaca sebagai dua pil vertikal + bola.
    return (
      <g stroke={INK} strokeWidth={3} strokeLinejoin="round" fill={FIST_FILL}>
        <rect x={-26} y={-38} width={15} height={46} rx={7.5} transform="rotate(-14 -18 -15)" />
        <rect x={-15} y={0} width={30} height={28} rx={10} />
        <path d="M -11,0 Q -17,-10 -15,-22" stroke="#101010" strokeWidth={2.5} fill="none" strokeLinecap="round" />
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
    {/* lengan atas: bahu (0,0) -> siku (0,72), sendi bola KECIL di bahu */}
    <circle cx={0} cy={0} r={6} fill={LIMB} stroke={INK} strokeWidth={2.5} />
    <path
      d="M -6.5,0 L 6.5,0 L 6.5,58 Q 6.5,72 0,72 Q -6.5,72 -6.5,58 Z"
      fill={LIMB}
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <g transform={`translate(0,72) rotate(${elbow})`}>
      {/* lengan bawah: siku (0,0) -> pergelangan (0,66), sendi bola KECIL di siku */}
      <circle cx={0} cy={0} r={5} fill={LIMB} stroke={INK} strokeWidth={2.5} />
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
    <circle cx={0} cy={0} r={7} fill={LIMB} stroke={INK} strokeWidth={2.5} />
    <path
      d="M -7,0 L 7,0 L 7,96 Q 7,108 0,108 Q -7,108 -7,96 Z"
      fill={PANTS}
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <g transform={`translate(0,108) rotate(${knee})`}>
      {/* betis: lutut (0,0) -> pergelangan (0,108), sendi bola di lutut */}
      <circle cx={0} cy={0} r={5} fill={LIMB} stroke={INK} strokeWidth={2.5} />
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
        {/* badan atas: toe lebih ramping (ujung x 30, bukan 36) supaya
            dua sepatu berdampingan tidak terlihat menyatu */}
        <path
          d="M -16,-4 L 8,-4 C 26,-4 32,2 30,11 L 28,14 L -18,14 C -24,8 -22,0 -16,-4 Z"
          fill="#262626"
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        {/* 3 garis tali putih */}
        <g stroke="#fff" strokeWidth={3} strokeLinecap="round">
          <line x1={0} y1={-1} x2={12} y2={-1} />
          <line x1={0} y1={4} x2={14} y2={4} />
          <line x1={2} y1={9} x2={16} y2={9} />
        </g>
        {/* sol putih TEBAL membungkus bawah */}
        <path
          d="M -20,12 L 30,12 C 33,12 33,20 28,20 L -18,20 C -24,20 -24,14 -20,12 Z"
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
    {/* kemeja putih + lengan pendek KECIL menempel bahu (keluar 14,
        bukan 26 — di v3 seperti sayap segitiga besar) */}
    <path d="M -56,-366 L 56,-366 L 54,-236 L -54,-236 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -56,-366 L -70,-352 L -66,-326 L -52,-332 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M 56,-366 L 70,-352 L 66,-326 L 52,-332 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    {/* kerah kemeja */}
    <path d="M -18,-366 L -2,-346 L -2,-360 L -16,-368 Z" fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M 18,-366 L 2,-346 L 2,-360 L 16,-368 Z" fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
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
    {/* dasi hitam PANJANG — digambar DI ATAS rompi (setelah rompi +
        stripes). Di v3 dasi digambar SEBELUM rompi sehingga rompi
        menutupnya dan hanya tersisa V kecil di leher. Hitam solid,
        dari kerah sampai tengah dada (ujung runcing y -300, tepat di
        atas garis reflektif pertama). */}
    <path d="M -8,-364 L 8,-364 L 5,-348 L -5,-348 Z" fill={INK} />
    <path d="M -6,-348 L 6,-348 L 8,-308 L 0,-300 L -8,-308 Z" fill={INK} />
    {/* resleting tengah (di bawah ujung dasi) */}
    <line x1={0} y1={-300} x2={0} y2={-236} stroke="#6e747a" strokeWidth={2} />
    {/* kantong flap halus */}
    <rect x={-48} y={-254} width={26} height={9} rx={2} fill={VEST_DARK} stroke={INK} strokeWidth={3} />
    <rect x={22} y={-254} width={26} height={9} rx={2} fill={VEST_DARK} stroke={INK} strokeWidth={3} />
    {/* name tag DEDI — panel kanan (sesuai sheet) */}
    <rect x={8} y={-332} width={32} height={12} fill="#fff" stroke={INK} strokeWidth={2.5} />
    <text x={24} y={-323} fontSize={9} fontWeight={800} textAnchor="middle" fill={INK} fontFamily="Arial, sans-serif">
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
