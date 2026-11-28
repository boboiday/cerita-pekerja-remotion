import type { Caption } from "@remotion/captions";
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions, type CapLine, Vignette } from "../../kit/Overlays";
import { STAND, Stick, StickDefs, walk, walkCycle, type Look, type Pose } from "../../kit/Stick";
import { C, FONT } from "../../kit/style";
import { Camera, Parallax, ParallaxLayer } from "../../kit/Camera";
import { KineticText } from "../../kit/KineticText";
import { CitySkylineBg, HomeInteriorBg, MinimarketBg, SkylineFar, SkylineNear } from "../../kit/Backgrounds";

/**
 * EP23 — "Mengganti Barang Perusahaan" (24 fps, 1080x1920, 73,18 detik).
 * Format >60 detik (naskah 150 kata, pita 140–150; pace 0,488 dtk/kata).
 * Gilang, 27 th, kasir minimarket di Makassar, 2 tahun: akhir shift kas
 * selisih Rp1.250.000 — manajer Bu Ratna suruh ganti penuh + denda
 * Rp1.000.000 = potongan Rp2.250.000 (64% gaji Rp3.500.000).
 * Saksi: Rina, kasir shift lain — bulan lalu dipotong Rp1.800.000 dari
 * gaji Rp3.000.000 (60%).
 * Hukum: PP 36/2021 Pasal 65 (total potongan upah paling banyak 50%
 * dari setiap pembayaran upah) + Pasal 63 ayat (1) dan (2) + UU 27/2026
 * Pasal 135 ayat (7) dan (8) + Pasal 310 (PP 36/2021 tetap berlaku).
 * VO: Sulafat 73,18 dtk (public/voice_over_ep23.mp3; raw 87,91 dtk, trim
 * jeda max 0,4 dtk -> 83,41 dtk, atempo 1.14), word timings dari
 * alignment.json faster-whisper small (139 token; koreksi: angka dieja,
 * "27 juta tahun"->dua puluh tujuh tahun, mini market->minimarket,
 * Makasar.->Makassar., Manager->Manajer, No.->Nomor,
 * sebagainya->sebagaimana, pekerja buru.->Pekerja/Buruh., upah->Upah,
 * pasal->Pasal (S07 saja), gajinya,->gajinya: (P1) / gajinya. (P5),
 * bulan->Bulan, separuh,->separuh. + karena->Karena).
 * 8 shot, 3 beat per shot, match cuts, 3-second hook gate di S01,
 * tracking shot penuh di S02, arc 5 tahap, beat saksi Rina (S05).
 * Render: GitHub Actions. Set: rumah pagi (HomeInteriorBg) + jalan
 * Makassar (parallax) + minimarket (MinimarketBg kit: rak + mesin kasir
 * + meja kasir; laci kas digambar inline) + rumah malam
 * (HomeInteriorBg night).
 * Kartu hukum S07 langsung pakai dimensi final EP22 (top 60, font 28,
 * margin 18, padding 20/24) — pelajaran bug overlap EP21/EP22.
 * Mood "calm" BUKAN mood valid di kit — S03 memakai hopeful -> worried.
 */

export const EP23_TOTAL = 1756; // 73,18 s @ 24 fps

/** Gilang: kemeja kasir merah bata + name tag "GILANG". */
const GILANG: Look = { body: "#a63a2e", pants: "#1d1d1f", nameTag: "GILANG" };
/** Rina: blus kuning, rambut pendek + name tag "RINA". */
const RINA: Look = { body: "#e2a748", pants: "#1d1d1f", shortHair: "#3a2a1a", nameTag: "RINA" };
/** Bu Ratna, manajer toko: blazer navy, rambut diikat (bun) + name tag "BU RATNA". */
const RATNA: Look = { body: "#3a4a6a", pants: "#1d1d1f", bun: true, hair: "#2a1a12", nameTag: "BU RATNA" };

const FLOOR = 1400;

/** Word timings dari alignment (ms, absolut). startMs relatif ke awal shot. */
const timedCaptions = (words: [string, number, number][], lineStartMs: number): Caption[] =>
  words.map(([w, s, e], i) => ({
    text: (i ? " " : "") + w,
    startMs: Math.round(s - lineStartMs),
    endMs: Math.round(e - lineStartMs),
    timestampMs: Math.round((s + e) / 2 - lineStartMs),
    confidence: null,
  }));

/** SVG canvas dalam ruang piksel komposisi. */
const Canvas: React.FC<{ children?: React.ReactNode; bg?: string }> = ({ children, bg = "#1e2436" }) => {
  const { width, height } = useVideoConfig();
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, background: bg }}>
      <StickDefs />
      {children}
    </svg>
  );
};

/** Matahari pagi + langit krem (dipakai S02/S08a). */
const MorningSky: React.FC = () => (
  <g>
    <circle cx={880} cy={250} r={92} fill="#db483b" opacity={0.9} />
    <circle cx={350} cy={280} r={52} fill="#f5f2e8" />
  </g>
);

/** Slip gaji Gilang: gaji Rp3.500.000, potongan Rp2.250.000, diterima Rp1.250.000. */
const PaySlip: React.FC<{ mini?: boolean }> = ({ mini = false }) => {
  if (mini) {
    return (
      <g>
        <rect x={-28} y={-40} width={56} height={80} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
        <line x1={-18} y1={-24} x2={18} y2={-24} stroke={C.ink} strokeWidth={3} />
        <line x1={-18} y1={-10} x2={18} y2={-10} stroke={C.ink} strokeWidth={3} />
        <line x1={-18} y1={8} x2={18} y2={8} stroke="#c0241c" strokeWidth={4} />
        <line x1={-18} y1={22} x2={18} y2={22} stroke="#c0241c" strokeWidth={4} />
      </g>
    );
  }
  return (
    <g>
      <rect x={-180} y={-240} width={360} height={480} rx={10} fill="#fdf8ea" stroke={C.ink} strokeWidth={6} />
      <rect x={-180} y={-240} width={360} height={62} rx={10} fill="#1d1d1f" />
      <rect x={-180} y={-198} width={360} height={20} fill="#1d1d1f" />
      <text x={0} y={-198} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill="#fdf8ea" textAnchor="middle">SLIP GAJI</text>
      <text x={0} y={-130} fontFamily={FONT.mono} fontWeight={800} fontSize={22} fill={C.ink} textAnchor="middle">GILANG — KASIR</text>
      <text x={0} y={-90} fontFamily={FONT.mono} fontWeight={700} fontSize={20} fill="#6b675f" textAnchor="middle">GAJI Rp3.500.000</text>
      <line x1={-150} y1={-60} x2={150} y2={-60} stroke={C.ink} strokeWidth={3} opacity={0.5} />
      <text x={0} y={-10} fontFamily={FONT.mono} fontWeight={700} fontSize={22} fill={C.ink} textAnchor="middle">DIPOTONG</text>
      <text x={0} y={28} fontFamily={FONT.mono} fontWeight={800} fontSize={28} fill="#c0241c" textAnchor="middle">Rp2.250.000</text>
      <text x={0} y={88} fontFamily={FONT.mono} fontWeight={800} fontSize={24} fill="#c0241c" textAnchor="middle">64% GAJI</text>
      <line x1={-150} y1={120} x2={150} y2={120} stroke={C.ink} strokeWidth={3} opacity={0.5} />
      <text x={0} y={170} fontFamily={FONT.mono} fontWeight={700} fontSize={20} fill="#6b675f" textAnchor="middle">DITERIMA Rp1.250.000</text>
    </g>
  );
};

/** Kalkulator kecil di meja S01. Titik (0,0) = tengah kalkulator. */
const Calculator: React.FC = () => (
  <g>
    <rect x={-70} y={-95} width={140} height={190} rx={10} fill="#3a3a3f" stroke={C.ink} strokeWidth={5} />
    <rect x={-52} y={-78} width={104} height={36} rx={4} fill="#7fb3d5" stroke={C.ink} strokeWidth={3} />
    <text x={0} y={-52} fontFamily={FONT.mono} fontWeight={800} fontSize={20} fill={C.ink} textAnchor="middle">2250000</text>
    {[0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => (
        <rect key={`${r}-${c}`} x={-52 + c * 38} y={-28 + r * 38} width={30} height={30} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
      )),
    )}
  </g>
);

/** Laci kas terbuka dengan lembaran uang (di atas meja kasir S03/S04). Titik (0,0) = tengah bawah laci. */
const CashDrawer: React.FC = () => (
  <g>
    <rect x={-90} y={-46} width={180} height={46} rx={6} fill="#4a3428" stroke={C.ink} strokeWidth={5} />
    <rect x={-70} y={-86} width={44} height={44} rx={4} fill="#3f7a4a" stroke={C.ink} strokeWidth={3} transform="rotate(-8 -48 -64)" />
    <rect x={-14} y={-92} width={44} height={44} rx={4} fill="#3f7a4a" stroke={C.ink} strokeWidth={3} />
    <rect x={36} y={-84} width={44} height={44} rx={4} fill="#3f7a4a" stroke={C.ink} strokeWidth={3} transform="rotate(7 58 -62)" />
    <line x1={-70} y1={-22} x2={70} y2={-22} stroke="#fdf8ea" strokeWidth={4} opacity={0.6} />
  </g>
);

/** Map cokelat berlabel PASAL 65 (di meja S06, di tangan S08a). */
const PasalFolder: React.FC<{ big?: boolean }> = ({ big = false }) => (
  <g>
    <rect x={-60} y={-80} width={120} height={160} rx={8} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
    <rect x={-60} y={-80} width={120} height={34} rx={8} fill="#6b4423" stroke={C.ink} strokeWidth={4} />
    <text x={0} y={-58} fontFamily={FONT.mono} fontWeight={800} fontSize={16} fill="#fdf8ea" textAnchor="middle">PASAL</text>
    <text x={0} y={10} fontFamily={FONT.mono} fontWeight={800} fontSize={big ? 28 : 22} fill="#fdf8ea" textAnchor="middle">65</text>
    <line x1={-44} y1={40} x2={44} y2={40} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
    <line x1={-44} y1={58} x2={44} y2={58} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
  </g>
);

/** Kartu nama di meja kasir: "GILANG — KASIR MINIMARKET". */
const NameCard: React.FC<{ name?: string; role?: string }> = ({ name = "GILANG", role = "KASIR MINIMARKET" }) => (
  <g>
    <rect x={-55} y={-22} width={110} height={44} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
    <text x={0} y={-4} fontFamily={FONT.mono} fontWeight={800} fontSize={15} fill={C.ink} textAnchor="middle">{name}</text>
    <text x={0} y={14} fontFamily={FONT.mono} fontWeight={700} fontSize={11} fill="#6b675f" textAnchor="middle">{role}</text>
  </g>
);

/** Shot 1 (0–225): rumah Gilang pagi. Gilang menatap slip gaji; big text. */
const Shot01: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Beat 1 (0–40f): Gilang di meja, slip di tangan. Beat 2 (40–100f): angka Rp2.250.000 muncul. Beat 3 (100–225f): big text.
  const showSlip = frame >= 40;
  const bubble = frame < 60 ? 0 : spring({ frame: frame - 60, fps, config: { stiffness: 260, damping: 13 } });
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 55%">
      <Canvas bg="#f7f1e3">
        <HomeInteriorBg />
        {/* slip gaji besar di meja + kalkulator */}
        <g transform="translate(540,1010)">
          <PaySlip />
        </g>
        <g transform="translate(830,1100)">
          <Calculator />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={320} floor={FLOOR} scale={0.95} look={GILANG} pose={{ ...STAND, armF: [0.5, 0.5], armB: [0.2, 0.1], lean: 0.02, headTilt: 0.06 }} mood={frame < 100 ? "worried" : "shocked"} lookAt={0.5} holdF={showSlip ? <PaySlip mini /> : undefined} />
      </Canvas>
      {/* bubble angka Rp2.250.000 (HTML, terbaca) */}
      <div style={{ position: "absolute", top: 290, left: "50%", transform: `translateX(-50%) scale(${bubble})`, opacity: bubble, width: 860, background: "white", borderRadius: 24, padding: "22px 30px", boxShadow: "0 8px 0 rgba(0,0,0,0.4)", textAlign: "center" }}>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 34, color: "#c0241c", lineHeight: 1.25 }}>
          Dipotong: Rp2.250.000
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, color: "#6b675f", marginTop: 8 }}>dari gaji Rp3.500.000 • 64% hilang</div>
      </div>
      <KineticText words={["GAJI", "DIPOTONG", "64%"]} at={100} stagger={3} top={520} fontSize={80} accent={["64%"]} />
    </Camera>
  );
};

/** Shot 2 (225–455): tracking shot jalan pagi Makassar. Gilang menyeberang penuh kiri -> kanan, parallax 2 lapis, gerbang minimarket di kanan. */
const Shot02: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, dur], [80, 1000], { extrapolateRight: "clamp" });
  const pose = { ...walk((x - 80) / walkCycle(0.9, 0.95), 0.9), headTilt: 0 };
  const lookRight = frame > 130;
  return (
    <Camera dur={dur} move="static" blur>
      <Canvas bg="#f7f1e3">
        <MorningSky />
        <Parallax dur={dur}>
          <ParallaxLayer speed={260}>
            <SkylineFar />
          </ParallaxLayer>
          <ParallaxLayer speed={620}>
            <SkylineNear />
          </ParallaxLayer>
        </Parallax>
        {/* jalan + trotoar */}
        <rect x={0} y={1400} width={1080} height={520} fill="#3a3a3f" />
        <rect x={0} y={1400} width={1080} height={16} fill="#5c564a" />
        <rect x={0} y={1460} width={1080} height={10} fill="#e2a748" strokeDasharray="40 30" />
        {/* gerbang minimarket */}
        <g>
          <rect x={760} y={1080} width={260} height={320} fill="#23282e" stroke={C.ink} strokeWidth={5} />
          <text x={890} y={1170} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill="#fdf8ea" textAnchor="middle">MINIMARKET</text>
          <text x={890} y={1215} fontFamily={FONT.mono} fontWeight={800} fontSize={28} fill="#fdf8ea" textAnchor="middle">MAKASSAR</text>
        </g>
        <Stick x={x} floor={FLOOR} scale={0.95} look={GILANG} pose={pose} mood="hopeful" lookAt={lookRight ? 1 : 0.5} />
      </Canvas>
      <KineticText words={["KASIR,", "2", "TAHUN"]} at={60} stagger={3} top={420} fontSize={64} accent={["TAHUN"]} />
    </Camera>
  );
};

/** Shot 3 (455–640): minimarket, akhir shift. Gilang menghitung uang kas, laci kas terbuka; Bu Ratna menunjuk slip selisih. */
const Shot03: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat tenang (0–92f): hopeful — "calm" bukan Mood valid di kit.
  const m = frame < 92 ? "hopeful" : "worried";
  return (
    <Camera dur={dur} move="push-in" amount={0.05} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <MinimarketBg />
        {/* laci kas terbuka di atas meja kasir */}
        <g transform="translate(430,1120)">
          <CashDrawer />
        </g>
        <g transform="translate(290,1280)">
          <NameCard />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick
          x={340}
          floor={FLOOR}
          scale={0.95}
          look={GILANG}
          pose={{ ...STAND, armF: [0.9, 0.4], armB: [0.3, 0.5], lean: 0.08, headTilt: frame >= 92 ? 0.12 : 0 }}
          mood={m}
          lookAt={0.8}
          holdF={frame >= 60 ? <PaySlip mini /> : undefined}
        />
        <Stick x={820} floor={FLOOR} scale={0.95} look={RATNA} pose={{ ...STAND, armF: [1.2, 0.2], armB: [0.2, 0.1], lean: -0.03, headTilt: -0.08 }} mood="worried" lookAt={-0.8} />
      </Canvas>
      <KineticText words={["SELISIH", "RP1.250.000"]} at={92} stagger={3} top={420} fontSize={64} accent={["RP1.250.000"]} />
    </Camera>
  );
};

/** Shot 4 (640–866): close-up meja kasir. Gilang menghitung ulang — tidak ada yang ia ambil; Bu Ratna menyerahkan slip gaji yang sudah dipotong. */
const Shot04: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 2 (100f+): Gilang menggeleng — tidak ada yang ia ambil; ekspresi worried -> sad.
  const m = frame < 100 ? "worried" : "sad";
  return (
    <Camera dur={dur} move="push-in" amount={0.08} origin="50% 45%">
      <Canvas bg="#f7f1e3">
        <MinimarketBg />
        {/* laci kas terbuka di atas meja kasir */}
        <g transform="translate(430,1120)">
          <CashDrawer />
        </g>
        <g transform="translate(290,1280)">
          <NameCard />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={300} floor={FLOOR} scale={1.15} look={GILANG} pose={{ ...STAND, armF: [0.5, 0.6], armB: [0.35, 0.55], lean: -0.02, headTilt: 0.1 }} mood={m} lookAt={1} holdF={frame >= 100 ? <PaySlip mini /> : undefined} />
        <Stick x={780} floor={FLOOR} scale={1.15} look={RATNA} pose={{ ...STAND, armF: [0.9, 0.3], armB: [0.2, 0.1], lean: 0.02, headTilt: 0.1 }} mood="worried" lookAt={-0.6} holdF={<PaySlip mini />} />
      </Canvas>
      <KineticText words={["64%", "HILANG"]} at={40} stagger={3} top={420} fontSize={88} accent={["HILANG"]} />
    </Camera>
  );
};

/** Shot 5 (866–1116): Rina di meja kasir sebelah membuka slip gajinya juga — "Rina juga sama". */
const Shot05: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const mood = frame < 125 ? "resigned" : "determined";
  return (
    <Camera dur={dur} move="push-in" amount={0.04} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <MinimarketBg />
        <g transform="translate(290,1280)">
          <NameCard name="RINA" role="KASIR SHIFT LAIN" />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={300} floor={FLOOR} scale={1.15} look={GILANG} pose={{ ...STAND, armF: [0.5, 0.5], armB: [0.2, 0.1], lean: 0.02, headTilt: 0.12 }} mood="worried" lookAt={1} />
        <Stick x={780} floor={FLOOR} scale={1.15} look={RINA} pose={{ ...STAND, armF: [0.9, 0.3], armB: [0.2, 0.1], lean: -0.04, headTilt: -0.06 }} mood={mood} lookAt={-0.6} holdF={frame >= 40 ? <PaySlip mini /> : undefined} />
      </Canvas>
      <KineticText words={["RINA", "JUGA", "SAMA"]} at={30} stagger={3} top={420} fontSize={88} accent={["SAMA"]} />
    </Camera>
  );
};

/** Shot 6 (1116–1271): rumah malam. Gilang mengangkat salinan pasal; big text kinetik. */
const Shot06: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–50f): jalan masuk ke meja. Beat 2 (50–155f): angkat pasal + big text.
  const walking = frame < 50;
  const x = walking ? interpolate(frame, [0, 50], [80, 420], { extrapolateRight: "clamp" }) : 420;
  const pose: Pose = walking
    ? walk((x - 80) / walkCycle(0.9, 0.95), 0.9)
    : { ...STAND, armF: [1.0, 0.25], armB: [0.2, 0.1], lean: -0.04, headTilt: -0.08 };
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 45%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        {/* meja + lampu meja + salinan pasal */}
        <rect x={180} y={1150} width={720} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={200} y={1176} width={680} height={224} fill="#4a3428" />
        <rect x={780} y={980} width={14} height={170} fill={C.ink} />
        <path d="M787,980 L700,930 L874,930 Z" fill="#ffe9a8" stroke={C.ink} strokeWidth={5} />
        <circle cx={787} cy={975} r={26} fill="#ffe9a8" opacity={0.85} />
        <g transform="translate(560,1090)">
          {frame < 50 ? <PasalFolder big /> : null}
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#1c130d" />
        <rect x={0} y={1400} width={1080} height={18} fill="#120b06" />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={GILANG}
          pose={pose}
          mood="determined"
          lookAt={0.5}
          holdF={frame >= 50 ? <PasalFolder /> : undefined}
        />
      </Canvas>
      <KineticText words={["PASAL", "65"]} at={50} stagger={3} top={420} fontSize={88} accent={["65"]} />
    </Camera>
  );
};

/** Item kartu hukum: centang muncul progresif mengikuti narasi. */
  const LawItem: React.FC<{ at: number; children: React.ReactNode; big?: React.ReactNode }> = ({ at, children, big }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { stiffness: 300, damping: 14 } });
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginTop: 18, transform: `scale(${interpolate(s, [0, 1], [0.9, 1])})`, opacity: s }}>
      <div style={{ flexShrink: 0, width: 50, height: 50, borderRadius: "50%", background: "#c0241c", color: "white", fontFamily: FONT.title, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>✓</div>
      <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 28, lineHeight: 1.25, color: C.ink }}>
        {children}
        {big}
      </div>
    </div>
  );
};

/** Shot 7 (1271–1503): kartu hukum. Kamera STATIS — kartu harus stabil dan terbaca. Dimensi final EP22 (top 60, font 28). */
const Shot07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 240, damping: 14 } });
  // Gilang menunjuk item 1-2 (0–60f), lalu 3-4 (60–120f), item 5 tercentang (120f+).
  const pointY = frame < 60 ? 0 : frame < 120 ? 1 : 2;
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      {/* Gilang kiri menunjuk kartu */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <StickDefs />
        <rect x={0} y={1400} width={1080} height={520} fill="#171a26" />
        <Stick
          x={250}
          floor={FLOOR}
          scale={0.95}
          look={GILANG}
          pose={{ ...STAND, armF: [1.35, 0.12], armB: [-0.15, 0.1], lean: 0.04, headTilt: pointY === 2 ? 0 : -0.04 }}
          mood="determined"
          lookAt={1}
        />
      </svg>
      {/* kartu hukum krem */}
      <div
        style={{
          position: "absolute", left: 400, top: 60, width: 620, background: C.paper, border: `5px solid ${C.ink}`,
          boxShadow: "10px 12px 0 rgba(0,0,0,0.45)", padding: "20px 32px 24px", transform: `scale(${cardIn})`, opacity: cardIn,
        }}
      >
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: C.alertRed }}>PASAL 65</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 22, letterSpacing: 2, color: "#6b675f", marginTop: 6 }}>PP 36/2021 · PEMOTONGAN UPAH</div>
        <div style={{ height: 4, background: C.ink, marginTop: 12, opacity: 0.85 }} />
        <LawItem at={0}>
          Potongan upah boleh untuk denda, ganti rugi, uang muka, sewa, utang, kelebihan bayar
          <div style={{ fontSize: 22, color: "#6b675f", marginTop: 4 }}>(Pasal 63 ayat 1)</div>
        </LawItem>
        <LawItem at={30}>
          Denda + ganti rugi harus sesuai perjanjian kerja, peraturan perusahaan, atau PKB
          <div style={{ fontSize: 22, color: "#6b675f", marginTop: 4 }}>(Pasal 63 ayat 2)</div>
        </LawItem>
        <LawItem at={60}>
          Total SEMUA potongan paling banyak <b>50%</b> dari setiap pembayaran upah
          <div style={{ fontSize: 22, color: "#6b675f", marginTop: 4 }}>(Pasal 65)</div>
        </LawItem>
        <LawItem at={90}>
          Gilang: Rp2.250.000 dari Rp3.500.000 = 64% (batas Rp1.750.000); Rina: Rp1.800.000 dari Rp3.000.000 = 60% (batas Rp1.500.000) — kelebihannya tidak boleh diambil bulan ini
        </LawItem>
        <LawItem at={120}>
          Denda hanya bila sengaja atau lalai; sudah didenda tidak boleh kena sanksi lain untuk pelanggaran yang sama
          <div style={{ fontSize: 22, color: "#6b675f", marginTop: 4 }}>(UU 27/2026 Pasal 135 ayat 7–8; Pasal 310)</div>
        </LawItem>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8a (0–110): Gilang jalan kembali ke minimarket membawa salinan pasal + slip gaji. */
const Shot08a: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 110], [120, 700], { extrapolateRight: "clamp" });
  return (
    <Camera dur={110} move="push-in" amount={0.03} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <CitySkylineBg variant="day" />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={GILANG}
          pose={walk((x - 120) / walkCycle(0.9, 0.95), 0.9)}
          mood="hopeful"
          holdF={<g transform="translate(40,10)"><PasalFolder /></g>}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 8b (0–143): end card — brand, kalimat penutup, pertanyaan diskusi, handle. */
const Shot08b: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = frame < 2 ? 0 : spring({ frame: frame - 2, fps, config: { stiffness: 260, damping: 13 } });
  const line = frame < 18 ? 0 : spring({ frame: frame - 18, fps, config: { stiffness: 260, damping: 13 } });
  const q = frame < 36 ? 0 : spring({ frame: frame - 36, fps, config: { stiffness: 260, damping: 13 } });
  return (
    <AbsoluteFill style={{ background: "#1e2436", alignItems: "center" }}>
      <div style={{ position: "absolute", top: 480, width: "100%", textAlign: "center", transform: `scale(${title})`, opacity: title }}>
        <div style={{ fontFamily: FONT.title, fontSize: 118, color: "white", textShadow: "0 6px 16px rgba(0,0,0,0.8)" }}>CERITA PEKERJA</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: "#c9c4b4", marginTop: 16 }}>SETIAP PEKERJA PUNYA CERITA</div>
      </div>
      <div style={{ position: "absolute", top: 780, width: "100%", textAlign: "center", transform: `scale(${line})`, opacity: line, padding: "0 60px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 64, lineHeight: 1.25, color: C.capYellow, textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>Potongan boleh ada — tapi tidak boleh lebih dari separuh.</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", transform: `scale(${q})`, opacity: q, padding: "0 70px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 62, lineHeight: 1.2, color: "white", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
          Gajimu pernah dipotong berapa persen? Ceritain di komen.
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 44, color: C.capYellow, marginTop: 34 }}>@ceritapekerja_id</div>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8 (1503–1756): kembali ke minimarket -> end card. */
const Shot08: React.FC<{ dur: number }> = () => (
  <>
    <Sequence durationInFrames={110}>
      <Shot08a />
    </Sequence>
    <Sequence from={110}>
      <Shot08b />
    </Sequence>
  </>
);

export const EP23: React.FC = () => {
  const caps: CapLine[] = [
    { start: 0, end: 225, words: timedCaptions([["Gilang", 0, 640], ["menatap", 640, 1260], ["slip", 1260, 1520], ["gajinya:", 1520, 2100], ["dua", 2340, 2900], ["juta", 2900, 3480], ["dua", 3480, 3660], ["ratus", 3660, 3840], ["lima", 3840, 4020], ["puluh", 4020, 4200], ["ribu", 4200, 5160], ["rupiah", 5160, 5600], ["dipotong", 5940, 6600], ["dari", 6600, 6840], ["gaji", 6840, 7180], ["tiga", 7180, 7520], ["juta", 7520, 8020], ["lima", 8020, 8230], ["ratus", 8230, 8440], ["ribu.", 8440, 9080]], 0), yellow: ["RUPIAH", "DIPOTONG"] },
    { start: 225, end: 455, words: timedCaptions([["Gilang,", 9380, 9860], ["dua", 10160, 10480], ["puluh", 10480, 10800], ["tujuh", 10800, 11120], ["tahun,", 11120, 11500], ["kasir", 11940, 12300], ["minimarket", 12300, 12920], ["di", 12920, 13160], ["Makassar.", 13160, 13720], ["Gaji", 14140, 14540], ["tiga", 14540, 15040], ["juta", 15040, 15480], ["lima", 15480, 15630], ["ratus", 15630, 15780], ["ribu", 15780, 16340], ["sebulan,", 16340, 16840], ["sudah", 17180, 17500], ["dua", 17500, 17780], ["tahun", 17780, 18100], ["di", 18100, 18300], ["sana.", 18300, 18500]], 9380), yellow: ["MAKASSAR", "TAHUN"] },
    { start: 455, end: 640, words: timedCaptions([["Akhir", 18940, 19300], ["shift,", 19300, 19680], ["kasnya", 19940, 20260], ["selisih", 20260, 20760], ["satu", 20760, 21060], ["juta", 21060, 21520], ["dua", 21520, 21665], ["ratus", 21665, 21810], ["lima", 21810, 21955], ["puluh", 21955, 22100], ["ribu.", 22100, 23140], ["Manajer", 23480, 23740], ["bilang", 23740, 24160], ["ganti", 24160, 24600], ["penuh,", 24600, 24980], ["ditambah", 25260, 25660], ["denda", 25660, 25940], ["satu", 25940, 26300], ["juta.", 26300, 26660]], 18940), yellow: ["SELISIH", "DENDA"] },
    { start: 640, end: 866, words: timedCaptions([["Gilang", 26660, 27640], ["menghitung", 27640, 28100], ["ulang,", 28100, 28580], ["tidak", 28960, 29160], ["ada", 29160, 29580], ["yang", 29580, 29880], ["ia", 29880, 30080], ["ambil.", 30080, 30560], ["Tapi", 30940, 31360], ["slip", 31360, 31940], ["gajinya", 31940, 32460], ["tetap", 32460, 32880], ["dipotong,", 32880, 33400], ["enam", 33740, 33940], ["puluh", 33940, 34140], ["empat", 34140, 34340], ["persen", 34340, 35200], ["hilang.", 35200, 35700]], 26660), yellow: ["PERSEN", "HILANG"] },
    { start: 866, end: 1116, words: timedCaptions([["Di", 36080, 36260], ["kasir", 36260, 36620], ["sebelah,", 36620, 37140], ["Rina", 37560, 37840], ["membuka", 37840, 38340], ["slip", 38340, 38640], ["gajinya.", 38640, 39140], ["Bulan", 39600, 39920], ["lalu", 39920, 40420], ["ia", 40420, 40720], ["selisih,", 40720, 41300], ["dipotong", 41600, 42260], ["satu", 42260, 42620], ["juta", 42620, 43020], ["delapan", 43020, 43250], ["ratus", 43250, 43480], ["ribu,", 43480, 44220], ["lebih", 44520, 44840], ["dari", 44840, 45140], ["separuh", 45140, 45660], ["gajinya.", 45660, 46160]], 36080), yellow: ["RINA", "SEPARUH"] },
    { start: 1116, end: 1271, words: timedCaptions([["Peraturan", 46520, 47060], ["Pemerintah", 47060, 47820], ["Nomor", 47820, 48080], ["tiga", 48280, 48407], ["puluh", 48407, 48533], ["enam", 48533, 48660], ["Tahun", 48660, 49620], ["dua", 49620, 49772], ["ribu", 49772, 49924], ["dua", 49924, 50076], ["puluh", 50076, 50228], ["satu,", 50228, 50380], ["Pasal", 50380, 51680], ["enam", 51680, 51873], ["puluh", 51873, 52067], ["lima.", 52067, 52260]], 46520), yellow: ["PASAL", "NOMOR"] },
    { start: 1271, end: 1503, words: timedCaptions([["Jumlah", 52940, 53360], ["keseluruhan", 53360, 54000], ["pemotongan", 54000, 54560], ["Upah", 54560, 55000], ["sebagaimana", 55120, 55640], ["dimaksud", 55640, 56200], ["dalam", 56200, 56420], ["Pasal", 56420, 56860], ["enam", 56860, 57060], ["puluh", 57060, 57260], ["tiga", 57260, 57460], ["paling", 57880, 58100], ["banyak", 58100, 58460], ["lima", 58460, 58670], ["puluh", 58670, 58880], ["persen", 58880, 59420], ["dari", 59420, 59600], ["setiap", 59600, 60020], ["pembayaran", 60020, 60420], ["Upah", 60420, 60900], ["yang", 60900, 61080], ["diterima", 61080, 61480], ["Pekerja/Buruh.", 61480, 62400]], 52940), yellow: ["PERSEN", "UPAH"] },
    { start: 1503, end: 1756, words: timedCaptions([["Gilang", 62620, 63080], ["kembali", 63080, 63540], ["dengan", 63540, 63760], ["salinan", 63760, 64280], ["pasal", 64280, 64880], ["dan", 64880, 65060], ["slip", 65060, 65320], ["gaji.", 65320, 65740], ["Potongan", 66360, 66960], ["boleh", 66960, 67120], ["ada,", 67120, 67460], ["tapi", 67900, 68320], ["tidak", 68320, 68680], ["boleh", 68680, 68960], ["lebih", 68960, 69300], ["dari", 69300, 69520], ["separuh.", 69520, 70160], ["Karena", 70360, 70720], ["setiap", 70720, 71500], ["pekerja", 71500, 71980], ["punya", 71980, 72360], ["cerita.", 72360, 72800]], 62620), yellow: ["SALINAN", "PASAL", "CERITA"] },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("voice_over_ep23.mp3")} />
      <Sequence durationInFrames={225}>
        <Shot01 dur={225} />
      </Sequence>
      <Sequence from={225} durationInFrames={230}>
        <Shot02 dur={230} />
      </Sequence>
      <Sequence from={455} durationInFrames={185}>
        <Shot03 dur={185} />
      </Sequence>
      <Sequence from={640} durationInFrames={226}>
        <Shot04 dur={226} />
      </Sequence>
      <Sequence from={866} durationInFrames={250}>
        <Shot05 dur={250} />
      </Sequence>
      <Sequence from={1116} durationInFrames={155}>
        <Shot06 dur={155} />
      </Sequence>
      <Sequence from={1271} durationInFrames={232}>
        <Shot07 />
      </Sequence>
      <Sequence from={1503}>
        <Shot08 dur={253} />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
