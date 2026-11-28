import React from "react";

/**
 * DediRig v5 — ronde 3 (MISMATCH-v4.md, skor 68% -> target >=95%).
 *
 * Perubahan vs v4:
 *  - RAMBUT DIGAMBAR ULANG TOTAL sebagai SATU siluet path ditracing dari
 *    tpl-hair.png: massa atas BULAT fluffy tersapu ke satu sisi, strand
 *    berlapis saling tumpang tindih, fringe zigzag TIDAK beraturan
 *    (ujung -507..-535, panjang bervariasi), strand samping meruncing
 *    mengikuti lengkung kepala sampai y -439/-448. TIDAK ADA lagi
 *    mahkota spike, garis seam melintang, atau plank tirai.
 *  - Telinga KECIL (rx 5) digambar SEBELUM rambut supaya terselip di
 *    bawah rambut, hanya mengintip.
 *  - Alis DITIPISKAN jadi setengah tebal (8 -> 4) dan DIPERPENDEK
 *    (36 -> 28), tetap miring.
 *  - Wajah DIPERSEMPIT: rx 80 -> 70, ry 92 -> 98 (oval tegak).
 *  - Jempol DIBALIK ARAH: dulu menjulur -y (ke arah siku) sehingga
 *    terkubur di lengan saat lengan terangkat; kini menjulur +y
 *    melewati kepalan (ujung y 50, lebar 19) — arah jempol tegak
 *    saat lengan bawah menunjuk ke atas, seperti tpl-thumb.png.
 *  - Rompi: taper pinggang (hem 108 -> 100), lengan baju mengecil
 *    (keluar 14 -> 11), kerah dirapikan.
 *  - Sepatu: toe diratakan (ujung x 30 -> 28, atap lebih lurus).
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
const VEST = "#9aa0a6";
const VEST_DARK = "#878d94";
const STRIPE = "#eef0f2";
const PANTS = "#1b1b1b";
const LIMB = "#1b1b1b";
const RED = "#e53935";
const MOUTH_RED = "#8c3a2b";
const TONGUE = "#e86a6a";

/* ---------------- wajah ---------------- */

/** Alis GARIS TIPIS (poligon 28x4, setengah tebal v4) — sesuai sheet
 *  Normal/Happy: garis tipis miring ke dalam (ujung dalam lebih
 *  rendah), BUKAN balok hitam. Posisi y -500..-496: di bawah fringe
 *  (ujung terdalam -507) dan di atas mata (puncak -477). */
const browBar = (mirror: boolean, y0: number, drop: number) => {
  const s = mirror ? -1 : 1;
  const pts: [number, number][] = [
    [-48, y0],
    [-20, y0 + drop],
    [-20, y0 + drop + 4],
    [-48, y0 + 4],
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
      <ellipse cx={-27} cy={-458} rx={8.5} ry={ry} fill={INK} />
      <ellipse cx={27} cy={-458} rx={8.5} ry={ry} fill={INK} />
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

/** Kepala lengkap: wajah oval tegak + rambut SATU siluet + telinga kecil
 *  + wajah. Pusat kepala (0,-478). Rambut menutup puncak sampai y -603.
 *  Urutan: wajah -> TELINGA KECIL (terselip di bawah rambut) -> SATU
 *  siluet rambut (dome bulat fluffy + strand samping meruncing +
 *  fringe zigzag tak beraturan, ditracing dari tpl-hair.png) ->
 *  highlight strand -> alis/mata/mulut. TIDAK ADA garis seam dan
 *  TIDAK ADA plank tirai. */
const Head: React.FC<{ mood: DediMood }> = ({ mood }) => (
  <g>
    {/* wajah: oval tegak 140 x 196 (rasio 1.4:1, v4 160x184) */}
    <ellipse cx={0} cy={-478} rx={70} ry={98} fill={SKIN} stroke={INK} strokeWidth={3.5} />
    {/* telinga KECIL terselip di bawah rambut — digambar SEBELUM rambut
        supaya hanya mengintip di bawah strand samping */}
    <ellipse cx={-68} cy={-452} rx={5} ry={8} fill={SKIN} stroke={INK} strokeWidth={3} />
    <ellipse cx={68} cy={-452} rx={5} ry={8} fill={SKIN} stroke={INK} strokeWidth={3} />
    {/* rambut — SATU siluet path: massa atas BULAT fluffy tersapu ke
        satu sisi (kiri), strand berlapis saling tumpang tindih dengan
        ujung meruncing, strand samping mengikuti lengkung kepala turun
        sampai y -439 (kanan) / -448 (kiri), fringe zigzag TIDAK
        beraturan sepanjang dahi (ujung -507..-535, panjang bervariasi) */}
    <path
      d="M -92,-448 L -100,-488 L -87,-493 L -103,-521 L -80,-519 L -93,-553 L -66,-547 L -61,-581 L -37,-567 L -27,-599 L -5,-575 L 9,-603 L 31,-579 L 53,-597 L 63,-571 L 87,-585 L 85,-557 L 103,-547 L 89,-529 L 99,-503 L 81,-497 L 89,-453 L 71,-471 L 65,-439 L 49,-467 L 41,-513 L 30,-508 L 18,-529 L 5,-507 L -9,-531 L -23,-511 L -36,-535 L -50,-509 L -63,-530 L -76,-513 L -84,-487 Z"
      fill={HAIR}
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    {/* highlight strand coklat muda — garis lengkung tersapu, di dalam
        massa rambut, mengikuti arah sapuan ke kiri */}
    <g stroke={HAIR_HI} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.75}>
      <path d="M -70,-560 Q -30,-580 20,-576" />
      <path d="M -58,-540 Q -10,-566 44,-556" />
      <path d="M 10,-588 Q 46,-574 78,-552" />
      <path d="M -78,-522 Q -58,-502 -38,-518" />
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
    // Ditracing dari tpl-thumb.png: kepalan (30) + SATU jempol TEGAK
    // LEBAR (19, lebih lebar dari lengan bawah 12) yang menjulur +y
    // MELEWATI kepalan sampai y 50 — arah jempol tegak saat lengan
    // bawah menunjuk ke atas. Di v4 jempol menjulur -y (ke arah siku)
    // sehingga terkubur di lengan saat lengan terangkat untuk
    // thumbs-up, dan di shot-04 tidak terbaca sama sekali. Pose
    // thumbs-up di demo kini meluruskan lengan bawah ke atas
    // (bahu -120, siku -60) supaya jempol menunjuk ke atas layar.
    return (
      <g stroke={INK} strokeWidth={3} strokeLinejoin="round" fill={FIST_FILL}>
        <rect x={-24} y={8} width={19} height={42} rx={9.5} transform="rotate(-10 -14 28)" />
        <rect x={-15} y={0} width={30} height={28} rx={10} />
        <path d="M -20,14 Q -14,18 -6,14" stroke="#101010" strokeWidth={2.5} fill="none" strokeLinecap="round" />
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
        {/* badan atas: toe diratakan (ujung x 28, atap lebih lurus)
            supaya dua sepatu berdampingan tidak terlihat menyatu */}
        <path
          d="M -16,-4 L 10,-4 C 24,-4 29,1 28,10 L 27,14 L -18,14 C -24,8 -22,0 -16,-4 Z"
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
    {/* kemeja putih + lengan pendek KECIL menempel bahu (keluar 11,
        v4 14 — di v3 seperti sayap segitiga besar) */}
    <path d="M -56,-366 L 56,-366 L 54,-236 L -54,-236 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -56,-366 L -67,-354 L -63,-330 L -52,-332 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M 56,-366 L 67,-354 L 63,-330 L 52,-332 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    {/* kerah kemeja */}
    <path d="M -16,-366 L -2,-349 L -2,-360 L -14,-368 Z" fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M 16,-366 L 2,-349 L 2,-360 L 14,-368 Z" fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    {/* rompi abu-abu: lebar 116 (~72% lebar kepala 160), taper ke
        hem 100, bukaan V di dada, belahan V kecil di hem bawah */}
    <path
      d="M -58,-366 L -14,-366 L 0,-338 L 14,-366 L 58,-366 L 50,-236 L 5,-236 L 0,-244 L -5,-236 L -50,-236 Z"
      fill={VEST}
      stroke={INK}
      strokeWidth={3.5}
      strokeLinejoin="round"
    />
    {/* garis reflektif putih (2) */}
    <rect x={-52} y={-302} width={104} height={9} fill={STRIPE} />
    <rect x={-51} y={-274} width={102} height={9} fill={STRIPE} />
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
