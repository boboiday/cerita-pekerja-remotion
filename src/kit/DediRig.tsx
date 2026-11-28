import React from "react";

/**
 * DediRig v19 — ronde 17 (Avenir tolak v18: "Kok jadi kurus bro?").
 *
 * Perubahan vs v18 — HANYA lebar badan (kepala/rambut/wajah, leher,
 * dasi, resleting, kerah, dan ukuran tangan TIDAK disentuh):
 *  - ROMPI: atas -58..58 (116) -> -92..92 (184); hem -28..28 (56) ->
 *    -68..68 (136); sisi hampir lurus, sedikit melengkung ke dalam
 *    saja (kontrol 76, bukan taper lagi). Path baru:
 *    M -92,-366 L -16,-366 L 0,-336 L 16,-366 L 92,-366
 *    Q 76,-300 68,-236 L 3,-236 L 0,-244 L -3,-236 L -68,-236
 *    Q -76,-300 -92,-366 Z.
 *  - Stripes reflektif: lebar 66/64 -> 112/110 (x -56 dan -55).
 *  - Kantong: x -29 -> -50 (lebar 23 -> 26), x 7 -> 24 (lebar 26).
 *  - Tag DEDI: x 8 -> 32, teks x 24 -> 48.
 *  - KEMEJA: -56..56 -> -92..92; lengan pendek kiri
 *    M -92,-366 L -103,-354 L -99,-330 L -88,-332 Z (kanan cermin).
 *  - BAHU (titik tempel lengan): ±50 -> ±82, y -342 tetap.
 *  - LENGAN: lebar ±6.5/±6 -> ±9.5/±9; sendi bola bahu r 6 -> 8,
 *    siku r 5 -> 7. Panjang lengan tetap. Tangan tidak diubah.
 *  - PINGGUL (titik tempel kaki): ±22 -> ±30, y -236 tetap.
 *  - KAKI: lebar ±7 -> ±10; sendi bola pinggul r 7 -> 9, lutut
 *    r 5 -> 7. Panjang paha/betis tetap (108+108).
 *  - SEPATU (lebih besar chunky): badan M -22,-4 L 12,-4
 *    C 14,-5 16,-2 16,6 L 16,15 L -24,15 C -30,9 -28,0 -22,-4 Z;
 *    kerah M -20,-6 Q 0,-20 20,-6 L 20,4 L -20,4 Z; tongue x -4
 *    w 18; tali putih ke x 0..13; sol M -26,13 L 16,13 C 19,13
 *    19,22 16,22 L -24,22 C -30,22 -30,15 -26,13 Z; offset
 *    sepatu dari pergelangan 16 -> 20.
 *  - Bayangan lantai rx 92 -> 120.
 *  - Rasio target (sheet): lebar rompi / lebar rambut = 1,02–1,06
 *    (rompi selebar kepala, badan kekar); v18 cuma ~0,61–0,85.
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
        UBUN-UBUN WEDGE TERSAPU v18: bentuk dasar BUKAN dome lagi —
        lembah antar-spike NAIK PROGRESIF ke kanan (-578 -> -599 ->
        -613 -> -623 -> -629 -> -631) dan puncak spike juga naik
        progresif (-590 -> -612 -> -627 -> -641 -> -645 -> -647,
        tertinggi di ujung kanan); tonjolan kiri atas DIRENDAHKAN
        lagi (~-592, lembah sebelum spike 1 -578); tiap spike
        CONDONG KE KANAN (puncak di kanan titik tengah lembahnya,
        kontrol kanan di kanan puncak hampir setinggi puncak —
        flank kiri landai, flank kanan curam, ujung menunjuk kanan).
        EKOR KIRI TETAP DIPOTONG (ujung -528, tonjolan luar maks -89)
        berakhir tepat di gigi fringe paling kiri — tidak ada lagi
        pita tipis menjuntai di samping wajah; sisi kiri 3 strand
        MENGALIR kurva-S lembut, sisi kanan 2 strand pendek + 1 strand
        samping membulat sampai y -440, fringe kiri 2 HELAIAN TERSAPU
        (T7 -19,-549 dan T8 -30,-544, ujung condong ke kanan dari
        lembahnya, lembah -500/-510 di antara; T6 -11,-532; gigi lain
        -524..-552; lembah -494..-516). Outline 0.4 (v16 0.45). */}
    <path
      d="M -80,-528 Q -89,-532 -86,-544 Q -83,-554 -73,-550 Q -79,-560 -70,-560 Q -69,-570 -61,-565 Q -55,-573 -48,-573 Q -58,-584 -54,-590 Q -48,-594 -41,-590 Q -34,-586 -29,-578 Q -21,-597 -10,-612 Q -3,-614 0,-599 Q 5,-613 10,-627 Q 17,-629 17,-613 Q 21,-628 27,-641 Q 34,-643 34,-623 Q 38,-635 42,-645 Q 49,-647 48,-629 Q 51,-639 54,-647 Q 60,-648 60,-631 Q 64,-612 63,-588 Q 71,-580 80,-571 Q 88,-560 92,-546 Q 100,-532 94,-520 Q 88,-510 80,-512 Q 88,-496 86,-482 Q 84,-470 76,-466 Q 72,-452 66,-442 Q 60,-436 56,-448 Q 52,-462 48,-470 Q 56,-546 56,-552 Q 40,-494 46,-544 Q 30,-506 34,-536 Q 16,-512 12,-528 Q 4,-500 0,-534 Q -10,-514 -11,-532 Q -22,-500 -19,-549 Q -36,-510 -30,-544 Q -50,-505 -56,-524 Q -64,-514 -70,-532 Q -76,-506 -80,-528 Z"
      fill={HAIR}
      stroke={INK}
      strokeWidth={0.35}
      strokeLinejoin="round"
    />
    {/* tekstur strand ubun-ubun v18 — 7 STRAND BENTUK TERISI
        MERUNCING (v17 + strand 1 kiri DITURUNKAN sedikit — start
        -578 -> -574, kontrol -596 -> -592 — supaya tetap DI DALAM
        siluet yang hump kirinya direndahkan di v18): strand 1 & 2 (v13, pangkal lebar di kiri,
        menyapu kiri->kanan satu arah, berakhir RUNCING tepat di
        tepi siluet) + S4 lapis tengah-kanan (v14, ujung runcing
        70,-561, DI DALAM siluet) + S3 lapis bawah-kiri (v14, ujung
        runcing 26,-546, di atas gigi fringe) + S5 lapis
        atas-tengah (v15, ujung runcing 30,-594, DI DALAM siluet)
        + S6 lapis atas (v16, ujung runcing 48,-584, DI DALAM
        siluet, staggered terhadap S5) + S7 BARU lapis paling atas
        (ujung runcing 56,-591, DI DALAM siluet, staggered terhadap
        S5/S6) — semuanya lebih pendek dari strand 1 & 2 dan
        ujungnya staggered supaya terbaca sebagai lapisan yang
        saling tumpang tindih, bukan pita sejajar. Garis INK
        sejajar panjang v12 TETAP dihapus; tersisa 3 garis pemisah
        PENDEK di celah antar-strand + 6 highlight pendek di dalam
        badan strand. */}
    <g fill={HAIR_HI} stroke={INK} strokeWidth={1.5} strokeLinejoin="round">
      <path d="M -48,-573 Q -12,-591 62,-585 Q 78,-580 84,-570 Q 56,-570 16,-576 Q -24,-582 -48,-573 Z" />
      <path d="M -46,-562 Q -4,-572 52,-560 Q 74,-554 88,-546 Q 64,-542 32,-547 Q -10,-553 -46,-562 Z" />
      <path d="M -8,-574 Q 24,-580 54,-572 Q 66,-568 70,-561 Q 44,-562 16,-567 Q -2,-570 -8,-574 Z" />
      <path d="M -58,-554 Q -24,-561 12,-554 Q 24,-551 26,-546 Q 2,-546 -22,-550 Q -44,-552 -58,-554 Z" />
      <path d="M -4,-602 Q 12,-608 26,-603 Q 31,-600 30,-594 Q 14,-596 2,-598 Q -4,-600 -4,-602 Z" />
      <path d="M -42,-588 Q 0,-598 42,-590 Q 50,-588 48,-584 Q 8,-586 -28,-584 Q -42,-585 -42,-588 Z" />
      <path d="M -14,-608 Q 12,-615 44,-600 Q 54,-596 56,-591 Q 22,-600 -4,-601 Q -14,-603 -14,-608 Z" />
    </g>
    <g stroke={INK} strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={1}>
      <path d="M -50,-566 Q -14,-572 22,-568" />
      <path d="M -40,-542 Q -6,-547 28,-542" />
      <path d="M -48,-548 Q -20,-552 6,-548" />
    </g>
    <g stroke={HAIR_HI} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.75}>
      <path d="M -40,-580 Q -8,-588 24,-582" />
      <path d="M -28,-556 Q 2,-561 30,-555" />
      <path d="M 6,-573 Q 28,-577 48,-570" />
      <path d="M 2,-603 Q 12,-606 22,-602" />
      <path d="M -28,-590 Q 0,-594 26,-589" />
      <path d="M -2,-609 Q 14,-612 30,-606" />
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
    {/* lengan atas: bahu (0,0) -> siku (0,72), sendi bola di bahu (v19 r 8, lebar ±9.5) */}
    <circle cx={0} cy={0} r={8} fill={LIMB} stroke={INK} strokeWidth={2.5} />
    <path
      d="M -9.5,0 L 9.5,0 L 9.5,58 Q 9.5,72 0,72 Q -9.5,72 -9.5,58 Z"
      fill={LIMB}
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <g transform={`translate(0,72) rotate(${elbow})`}>
      {/* lengan bawah: siku (0,0) -> pergelangan (0,66), sendi bola di siku (v19 r 7, lebar ±9) */}
      <circle cx={0} cy={0} r={7} fill={LIMB} stroke={INK} strokeWidth={2.5} />
      <path
        d="M -9,0 L 9,0 L 9,54 Q 9,66 0,66 Q -9,66 -9,54 Z"
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
    {/* paha: pinggul (0,0) -> lutut (0,108), sendi bola di pinggul (v19 r 9, lebar ±10) */}
    <circle cx={0} cy={0} r={9} fill={LIMB} stroke={INK} strokeWidth={2.5} />
    <path
      d="M -10,0 L 10,0 L 10,96 Q 10,108 0,108 Q -10,108 -10,96 Z"
      fill={PANTS}
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <g transform={`translate(0,108) rotate(${knee})`}>
      {/* betis: lutut (0,0) -> pergelangan (0,108), sendi bola di lutut (v19 r 7, lebar ±10) */}
      <circle cx={0} cy={0} r={7} fill={LIMB} stroke={INK} strokeWidth={2.5} />
      <path
        d="M -10,0 L 10,0 L 10,96 Q 10,108 0,108 Q -10,108 -10,96 Z"
        fill={PANTS}
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* sepatu sneaker chunky: ujung ke arah luar (flip untuk kaki kiri).
          Lokal: kerah -20, sol bawah +22 (= tanah). v19: tiap sepatu
          digeser 20 unit ke luar (v18 16); badan, kerah, tongue,
          dan sol DIPERBESAR chunky (toe ke x 16, sol depan 16). */}
      <g transform={`translate(${flip ? -20 : 20},108) scale(${flip ? -1 : 1},1)`}>
        {/* kerah ankle */}
        <path d="M -20,-6 Q 0,-20 20,-6 L 20,4 L -20,4 Z" fill="#262626" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        {/* tongue */}
        <rect x={-4} y={-16} width={18} height={14} rx={4} fill="#333333" stroke={INK} strokeWidth={2.5} />
        {/* badan atas: toe BULAT chunky (tonjolan ke x 16) */}
        <path
          d="M -22,-4 L 12,-4 C 14,-5 16,-2 16,6 L 16,15 L -24,15 C -30,9 -28,0 -22,-4 Z"
          fill="#262626"
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        {/* 3 garis tali putih (x 0..13) */}
        <g stroke="#fff" strokeWidth={3} strokeLinecap="round">
          <line x1={0} y1={-1} x2={11} y2={-1} />
          <line x1={0} y1={4} x2={12} y2={4} />
          <line x1={2} y1={9} x2={13} y2={9} />
        </g>
        {/* sol putih TEBAL membungkus bawah */}
        <path
          d="M -26,13 L 16,13 C 19,13 19,22 16,22 L -24,22 C -30,22 -30,15 -26,13 Z"
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
    {/* kemeja putih + lengan pendek menempel bahu (v19: keluar 11
        dari x -92, mengikuti bahu yang dilebarkan) */}
    <path d="M -92,-366 L 92,-366 L 90,-236 L -90,-236 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -92,-366 L -103,-354 L -99,-330 L -88,-332 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M 92,-366 L 103,-354 L 99,-330 L 88,-332 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    {/* kerah kemeja */}
    <path d="M -16,-366 L -2,-349 L -2,-360 L -14,-368 Z" fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M 16,-366 L 2,-349 L 2,-360 L 14,-368 Z" fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    {/* rompi abu-abu: lebar 184 (~115% lebar kepala 160), hem 68
        tiap sisi, sisi HAMPIR LURUS sedikit melengkung ke dalam
        (kontrol 76), bukaan V di dada (12), belahan V kecil di
        hem bawah — v19: LEBAR BADAN, koreksi "kurus" v18 */}
    <path
      d="M -92,-366 L -16,-366 L 0,-336 L 16,-366 L 92,-366 Q 76,-300 68,-236 L 3,-236 L 0,-244 L -3,-236 L -68,-236 Q -76,-300 -92,-366 Z"
      fill={VEST}
      stroke={INK}
      strokeWidth={3.5}
      strokeLinejoin="round"
    />
    {/* garis reflektif putih (2) — v19 lebar 112/110 */}
    <rect x={-56} y={-302} width={112} height={9} fill={STRIPE} />
    <rect x={-55} y={-274} width={110} height={9} fill={STRIPE} />
    {/* dasi hitam PANJANG — digambar DI ATAS rompi (setelah rompi +
        stripes). Di v3 dasi digambar SEBELUM rompi sehingga rompi
        menutupnya dan hanya tersisa V kecil di leher. Hitam solid,
        dari kerah sampai tengah dada (ujung runcing y -300, tepat di
        atas garis reflektif pertama). */}
    <path d="M -8,-364 L 8,-364 L 5,-348 L -5,-348 Z" fill={INK} />
    <path d="M -6,-348 L 6,-348 L 8,-308 L 0,-300 L -8,-308 Z" fill={INK} />
    {/* resleting tengah (di bawah ujung dasi) */}
    <line x1={0} y1={-300} x2={0} y2={-236} stroke="#6e747a" strokeWidth={2} />
    {/* kantong flap halus — v19 digeser keluar mengikuti hem lebar */}
    <rect x={-50} y={-254} width={26} height={9} rx={2} fill={VEST_DARK} stroke={INK} strokeWidth={3} />
    <rect x={24} y={-254} width={26} height={9} rx={2} fill={VEST_DARK} stroke={INK} strokeWidth={3} />
    {/* name tag DEDI — panel kanan (sesuai sheet) */}
    <rect x={32} y={-332} width={32} height={12} fill="#fff" stroke={INK} strokeWidth={2.5} />
    <text x={48} y={-323} fontSize={9} fontWeight={800} textAnchor="middle" fill={INK} fontFamily="Arial, sans-serif">
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
    <ellipse cx={0} cy={2} rx={120} ry={12} fill="#000" opacity={0.08} />
    {/* kaki: pinggul di (±30,-236) */}
    <g transform="translate(-30,-236)">
      <Leg hip={hipL} knee={kneeL} flip />
    </g>
    <g transform="translate(30,-236)">
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
    {/* lengan kiri (belakang) + kanan (depan): bahu di (±82,-342) */}
    <g transform="translate(-82,-342)">
      <Arm shoulder={shoulderL} elbow={elbowL} wrist={wristL} hand={handL} held={heldL} />
    </g>
    <g transform="translate(82,-342)">
      <Arm shoulder={shoulderR} elbow={elbowR} wrist={wristR} hand={handR} held={heldR} />
    </g>
  </g>
);
