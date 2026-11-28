import React from "react";

/**
 * DediRig v9 — ronde 7 (MISMATCH-v8.md, skor 87% -> target >=95%).
 *
 * Perubahan vs v8 (spike ubun-ubun ditonjolkan — siluet atas BUKAN
 * lagi kubah):
 *  - SPIKE UBUN-UBUN MENONJOL: 4 spike di ubun-ubun DITINGGIKAN
 *    8–12 unit (puncak -612/-620/-622/-616, v8 -602/-610/-606),
 *    lembah antar spike dipertahankan -584..-590 sehingga spike
 *    terbaca runcing membulat dan tersapu ke kanan, bukan kubah
 *    mulus; ujung spike menyempit (kontrol Q dekat ujung).
 *  - STRAND BERUJUNG DI TEPI: 2 sliver tumpang tindih BARU yang
 *    berakhir dengan UJUNG RUNCING tepat di tepi siluet (kiri
 *    (-70,-566), kanan (80,-568)) + 1 garis strand bold ke-7 yang
 *    mengikuti kubah baru yang lebih tinggi — strand terbaca
 *    sebagai bentuk tumpang tindih, bukan garis di dalam dome.
 *  - Rompi: hem taper 88 -> 86, sisi lebih melengkung ke dalam
 *    (kurangi boxiness); stripes + kantong menyesuaikan.
 *  - Sepatu: toe kurang bulat lagi (tonjolan ke x 24, v8 26, muka
 *    depan lebih datar), tiap sepatu digeser 1 unit lagi ke luar
 *    (celah 16 -> 18).
 *  - Outline rambut ditipiskan: strokeWidth 2.0 -> 1.75.
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
 *  + wajah. Pusat kepala (0,-478). Rambut menutup puncak sampai y -597.
 *  Urutan: wajah -> TELINGA KECIL (terselip di bawah rambut) -> SATU
 *  siluet rambut (dome bulat fluffy + strand samping MELENGKUNG
 *  mengalir berujung bulat + fringe SCALLOP kecil bervariasi,
 *  ditracing dari tpl-hair.png) -> highlight strand DI DALAM massa
 *  rambut -> alis/mata/mulut. TIDAK ADA garis seam, TIDAK ADA plank
 *  tirai, TIDAK ADA garis highlight di atas dahi. */
const Head: React.FC<{ mood: DediMood }> = ({ mood }) => (
  <g>
    {/* wajah: oval tegak 140 x 196 (rasio 1.4:1, v4 160x184) */}
    <ellipse cx={0} cy={-478} rx={70} ry={98} fill={SKIN} stroke={INK} strokeWidth={3.5} />
    {/* telinga KECIL terselip di bawah rambut — digambar SEBELUM rambut
        supaya hanya mengintip di bawah strand samping */}
    <ellipse cx={-68} cy={-452} rx={5} ry={8} fill={SKIN} stroke={INK} strokeWidth={3} />
    <ellipse cx={68} cy={-452} rx={5} ry={8} fill={SKIN} stroke={INK} strokeWidth={3} />
    {/* rambut — SATU siluet path, semua ujung MEMBULAT (kurva Q):
        UBUN-UBUN BER-SPIKE v9: 4 spike MENONJOL (puncak -612/-620/
        -622/-616, v8 -602/-610/-606 — ditinggikan 8–12 unit),
        lembah antar spike -584..-590 sehingga spike terbaca
        runcing-membulat tersapu ke kanan seperti tpl-hair.png,
        BUKAN kubah mulus; sisi kiri 3 strand MENGALIR kurva-S lembut
        (tonjolan maks ~-95), sisi kanan 2 strand pendek + 1 strand
        samping membulat sampai y -440, fringe SCALLOP BERVARIASI
        (gigi -524..-544; gigi x 38 di sisi sapuan DIPANJANGKAN ke
        -544, gigi terpanjang; gigi x 24 -> -538, x -28 -> -540;
        lembah -500..-516). Outline 1.75 (v8 2.0). */}
    <path
      d="M -88,-448 Q -99,-464 -93,-482 Q -89,-495 -80,-492 Q -93,-508 -87,-526 Q -82,-540 -71,-536 Q -81,-552 -69,-566 Q -59,-578 -48,-573 Q -54,-596 -44,-612 Q -34,-598 -28,-588 Q -24,-606 -14,-620 Q -4,-604 2,-590 Q 6,-608 14,-622 Q 22,-606 28,-588 Q 34,-604 40,-616 Q 48,-598 54,-584 Q 66,-578 78,-570 Q 88,-560 92,-546 Q 100,-532 94,-520 Q 88,-510 80,-512 Q 88,-496 86,-482 Q 84,-470 76,-466 Q 72,-452 66,-442 Q 60,-436 56,-448 Q 52,-462 48,-470 Q 43,-548 38,-544 Q 30,-502 24,-538 Q 18,-514 12,-528 Q 4,-500 0,-534 Q -8,-516 -14,-526 Q -22,-503 -28,-540 Q -36,-512 -42,-530 Q -50,-505 -56,-524 Q -64,-514 -70,-532 Q -76,-506 -80,-528 Q -84,-510 -85,-492 Q -87,-470 -88,-448 Z"
      fill={HAIR}
      stroke={INK}
      strokeWidth={1.75}
      strokeLinejoin="round"
    />
    {/* tekstur strand ubun-ubun BOLD v9 — 6 BENTUK sliver terpisah
        yang tumpang tindih (fill HAIR_HI, outline INK 2.5) = helaian
        berlapis seperti tpl-hair.png, BUKAN sekadar garis; 2 sliver
        BARU berujung RUNCING tepat di tepi siluet (ujung kiri
        (-70,-566) di tepi atas-kiri, ujung kanan (80,-568) di tepi
        atas-kanan) supaya strand terbaca sebagai bentuk tumpang
        tindih; di atasnya 7 garis outline strand INK TEBAL
        (strokeWidth 3, opacity 1.0) + 3 highlight, semuanya di dalam
        siluet dome, tersapu ke kanan mengikuti arah rambut. */}
    <g fill={HAIR_HI} stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
      <path d="M -68,-556 Q -30,-580 8,-580 Q -28,-568 -68,-556 Z" />
      <path d="M -52,-576 Q -10,-592 30,-588 Q -8,-580 -52,-576 Z" />
      <path d="M -20,-548 Q 20,-562 58,-552 Q 22,-550 -20,-548 Z" />
      <path d="M 10,-570 Q 40,-578 62,-566 Q 40,-566 10,-570 Z" />
      <path d="M -58,-548 Q -68,-556 -70,-566 Q -58,-560 -44,-552 Z" />
      <path d="M 34,-556 Q 58,-560 80,-568 Q 60,-552 36,-548 Z" />
    </g>
    <g stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" opacity={1}>
      <path d="M -66,-554 Q -36,-576 -4,-578 Q 22,-579 40,-570" />
      <path d="M -44,-580 Q -12,-588 16,-586 Q 38,-582 52,-572" />
      <path d="M -30,-548 Q 2,-560 34,-556 Q 52,-553 62,-544" />
      <path d="M -8,-566 Q 24,-572 48,-560 Q 60,-554 66,-544" />
      <path d="M -58,-566 Q -30,-584 0,-584" />
      <path d="M -16,-532 Q 14,-540 40,-534 Q 54,-530 62,-524" />
      <path d="M -44,-584 Q -14,-594 14,-594 Q 34,-590 46,-580" />
    </g>
    <g stroke={HAIR_HI} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.75}>
      <path d="M -56,-560 Q -28,-574 0,-572" />
      <path d="M -18,-582 Q 8,-586 32,-580" />
      <path d="M 6,-552 Q 28,-556 46,-548" />
    </g>
    {/* pemisah strand samping KANAN v8 — 2 garis di dalam massa
        coklat polos (x 66..84, y -468..-520), tersapu mengikuti
        arah strand. */}
    <g stroke={INK} strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={1}>
      <path d="M 78,-520 Q 84,-500 80,-478" />
      <path d="M 66,-500 Q 74,-486 72,-468" />
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
        <rect x={-16} y={0} width={32} height={30} rx={10} />
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
    // LEBAR yang menjulur +y MELEWATI kepalan — arah jempol tegak
    // saat lengan bawah menunjuk ke atas. v6: kapsul DIPERBESAR 1.5x
    // (19x42 -> 28x60, rx 14, ujung y 62 = 34 unit melewati kepalan,
    // hampir setinggi kepalan seperti sheet), tetap tegak dan
    // terpisah dari kepalan. Pose thumbs-up di demo meluruskan
    // lengan bawah ke atas (bahu -120, siku -60) supaya jempol
    // menunjuk ke atas layar. v7: kapsul DITIPISKAN 28 -> 25
    // (rx 14 -> 12.5, ujung y 62 tetap), kepalan 30x28 -> 32x30.
    return (
      <g stroke={INK} strokeWidth={3} strokeLinejoin="round" fill={FIST_FILL}>
        <rect x={-30.5} y={2} width={25} height={60} rx={12.5} transform="rotate(-10 -18 30)" />
        <rect x={-16} y={0} width={32} height={30} rx={10} />
        <path d="M -26,15 Q -18,20 -8,15" stroke="#101010" strokeWidth={2.5} fill="none" strokeLinecap="round" />
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
          Lokal: kerah -18, sol bawah +20 (= tanah). v9: tiap sepatu
          digeser 7 unit ke luar (v8 6; celah antar sepatu 16 -> 18)
          supaya dua sepatu berdampingan tidak menyatu; toe KURANG
          BULAT lagi (tonjolan ke x 24, v8 26, muka depan lebih datar). */}
      <g transform={`translate(${flip ? -7 : 7},108) scale(${flip ? -1 : 1},1)`}>
        {/* kerah ankle */}
        <path d="M -15,-6 Q 0,-18 15,-6 L 15,4 L -15,4 Z" fill="#262626" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        {/* tongue */}
        <rect x={-3} y={-16} width={14} height={14} rx={4} fill="#333333" stroke={INK} strokeWidth={2.5} />
        {/* badan atas: toe KURANG BULAT (tonjolan ke x 24, v8 26,
            muka depan lebih datar) */}
        <path
          d="M -16,-4 L 8,-4 C 19,-5 24,-1 24,7 L 23,14 L -18,14 C -24,8 -22,0 -16,-4 Z"
          fill="#262626"
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        {/* 3 garis tali putih */}
        <g stroke="#fff" strokeWidth={3} strokeLinecap="round">
          <line x1={0} y1={-1} x2={11} y2={-1} />
          <line x1={0} y1={4} x2={13} y2={4} />
          <line x1={2} y1={9} x2={15} y2={9} />
        </g>
        {/* sol putih TEBAL membungkus bawah */}
        <path
          d="M -20,12 L 24,12 C 27,12 27,20 22,20 L -18,20 C -24,20 -24,14 -20,12 Z"
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
        hem 86 (v8 88), sisi LEBIH MELENGKUNG ke dalam (kurangi
        boxiness), bukaan V di dada dipersempit (12, v5 14),
        belahan V kecil di hem bawah */}
    <path
      d="M -58,-366 L -12,-366 L 0,-336 L 12,-366 L 58,-366 Q 50,-300 43,-236 L 4,-236 L 0,-244 L -4,-236 L -43,-236 Q -50,-300 -58,-366 Z"
      fill={VEST}
      stroke={INK}
      strokeWidth={3.5}
      strokeLinejoin="round"
    />
    {/* garis reflektif putih (2) — dipersempit mengikuti taper */}
    <rect x={-46} y={-302} width={92} height={9} fill={STRIPE} />
    <rect x={-44} y={-274} width={88} height={9} fill={STRIPE} />
    {/* dasi hitam PANJANG — digambar DI ATAS rompi (setelah rompi +
        stripes). Di v3 dasi digambar SEBELUM rompi sehingga rompi
        menutupnya dan hanya tersisa V kecil di leher. Hitam solid,
        dari kerah sampai tengah dada (ujung runcing y -300, tepat di
        atas garis reflektif pertama). */}
    <path d="M -8,-364 L 8,-364 L 5,-348 L -5,-348 Z" fill={INK} />
    <path d="M -6,-348 L 6,-348 L 8,-308 L 0,-300 L -8,-308 Z" fill={INK} />
    {/* resleting tengah (di bawah ujung dasi) */}
    <line x1={0} y1={-300} x2={0} y2={-236} stroke="#6e747a" strokeWidth={2} />
    {/* kantong flap halus — digeser masuk mengikuti taper hem */}
    <rect x={-42} y={-254} width={24} height={9} rx={2} fill={VEST_DARK} stroke={INK} strokeWidth={3} />
    <rect x={18} y={-254} width={24} height={9} rx={2} fill={VEST_DARK} stroke={INK} strokeWidth={3} />
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
    {/* kepala (putar di leher 0,-368) — v6: diskala 0.95 tentang
        leher supaya kepala sedikit lebih kecil vs badan */}
    <g transform={`translate(0,-368) scale(0.95) rotate(${headTilt}) translate(0,368)`}>
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
