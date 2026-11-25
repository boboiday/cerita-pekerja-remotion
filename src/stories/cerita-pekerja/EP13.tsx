import type { Caption } from "@remotion/captions";
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions, type CapLine, Vignette } from "../../kit/Overlays";
import { CARRY, SIT, STAND, Stick, StickDefs, walk, walkCycle, type Look, type Pose } from "../../kit/Stick";
import { C, FONT } from "../../kit/style";
import { Camera, Parallax, ParallaxLayer } from "../../kit/Camera";
import { KineticText } from "../../kit/KineticText";
import { CitySkylineBg, HomeInteriorBg, OfficeBg, SkylineFar, SkylineNear, StationBg } from "../../kit/Backgrounds";
import { CardboardBox, DuffelBag, Suitcase } from "../../kit/Props";

/**
 * EP13 — "Dipindahkan ke Kota Lain" (24 fps, 1080x1920, 55.0 detik).
 * Hendra, staf gudang Surabaya 6 tahun: dipindah mendadak ke Semarang.
 * Sudut: pemisahan keluarga (istri + anak tinggal di Surabaya).
 * Hukum: UU 27/2026 Pasal 80 ayat (2) — verbatim — + Pasal 77 ayat (1)
 * huruf d. TIDAK ADA pasal mutasi khusus di UU 27/2026 (riset Parallel
 * 24 Nov 2026); jangkarnya ketentuan umum perjanjian kerja.
 * Ancaman atasan ("anggap saja mengundurkan diri") adalah DIALOG tokoh,
 * bukan klaim hukum.
 * VO: Sulafat 55.0 dtk (public/voice_over_ep13.mp3), word timings dari
 * alignment.json faster-whisper (116 kata; "Kundang"+"-undang"
 * dinormalisasi jadi "Undang-Undang" di caption).
 * 8 shot, 3 beat per shot, match cuts, 3-second hook gate di S01,
 * tracking shot penuh di S02, arc 5 tahap. Render: GitHub Actions.
 * Perbaikan gambar kecil vs EP12: peta Jawa berlabel + panah merah
 * (S03/S04), papan "GUDANG SURABAYA" + kardus berlabel (S01) — set
 * lebih detail, bukan bentuk geometris simetris polos.
 */

export const EP13_TOTAL = 1320; // 55.0 s @ 24 fps

/** Hendra: kemeja putih, dasi hitam, celana hitam (varian laki-laki standar, BARU). */
const HENDRA: Look = { body: "#f5f2e8", pants: "#1d1d1f", tie: "#1d1d1f" };
/** Atasan: kemeja biru-abu, dasi merah. */
const BOSS: Look = { body: "#8fa9c2", pants: "#23282e", tie: "#b3352b" };
/** Istri Hendra: ungu, rambut bun. */
const ISTRI: Look = { body: "#8a5bb5", pants: "#1d1d1f", bun: true, hair: "#2a1a12" };
/** Anak kecil: kuning, skala 0.6. */
const ANAK: Look = { body: "#e2a748", pants: "#1d1d1f" };

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

/** Matahari pagi + langit krem (dipakai S01/S02/S08). */
const MorningSky: React.FC = () => (
  <g>
    <circle cx={880} cy={250} r={92} fill="#db483b" opacity={0.9} />
    <circle cx={350} cy={280} r={52} fill="#f5f2e8" />
  </g>
);

/** Amplop surat mutasi dengan stempel merah (di meja, atau di tangan via holdF). */
const MutationLetter: React.FC<{ stamp?: boolean }> = ({ stamp = true }) => (
  <g>
    <rect x={-70} y={-50} width={140} height={100} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
    <line x1={-70} y1={-50} x2={0} y2={0} stroke="#b9b6ae" strokeWidth={3} />
    <line x1={70} y1={-50} x2={0} y2={0} stroke="#b9b6ae" strokeWidth={3} />
    {stamp ? (
      <g transform="rotate(-12)">
        <rect x={-52} y={8} width={104} height={34} rx={4} fill="none" stroke="#c0241c" strokeWidth={5} />
        <text x={0} y={32} fontFamily={FONT.mono} fontWeight={800} fontSize={22} fill="#c0241c" textAnchor="middle">MUTASI</text>
      </g>
    ) : null}
  </g>
);

/** Surat "PENGUNDURAN DIRI" kosong di tangan atasan (S04). */
const ResignPaper: React.FC<{ swing: number }> = ({ swing }) => (
  <g transform={`rotate(${swing * 57})`}>
    <rect x={-50} y={-70} width={100} height={140} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
    <text x={0} y={-28} fontFamily={FONT.mono} fontWeight={800} fontSize={19} fill={C.ink} textAnchor="middle">PENGUNDURAN</text>
    <text x={0} y={-4} fontFamily={FONT.mono} fontWeight={800} fontSize={19} fill={C.ink} textAnchor="middle">DIRI</text>
    <line x1={-34} y1={22} x2={34} y2={22} stroke="#b9b6ae" strokeWidth={4} />
    <line x1={-34} y1={38} x2={34} y2={38} stroke="#b9b6ae" strokeWidth={4} />
  </g>
);

/** Map kontrak kerja cokelat berlabel (di meja S06, di tangan S08). */
const ContractFolder: React.FC<{ big?: boolean }> = ({ big = false }) => (
  <g>
    <rect x={-60} y={-80} width={120} height={160} rx={8} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
    <rect x={-60} y={-80} width={120} height={34} rx={8} fill="#6b4423" stroke={C.ink} strokeWidth={4} />
    <text x={0} y={-58} fontFamily={FONT.mono} fontWeight={800} fontSize={16} fill="#fdf8ea" textAnchor="middle">KONTRAK</text>
    <text x={0} y={10} fontFamily={FONT.mono} fontWeight={800} fontSize={big ? 26 : 20} fill="#fdf8ea" textAnchor="middle">KERJA</text>
    <line x1={-44} y1={40} x2={44} y2={40} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
    <line x1={-44} y1={58} x2={44} y2={58} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
  </g>
);

/** Peta Jawa di dinding: pulau + titik Semarang/Surabaya + panah merah. */
const JavaMap: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={0} y={0} width={330} height={280} fill="#fdf8ea" stroke={C.ink} strokeWidth={7} />
    <text x={165} y={40} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill={C.ink} textAnchor="middle">PETA JAWA</text>
    <path
      d="M35,150 C60,115 120,100 180,110 C240,120 290,140 295,165 C290,190 220,200 150,195 C80,190 30,180 35,150 Z"
      fill="#bfe3f2"
      stroke={C.ink}
      strokeWidth={5}
    />
    {/* Semarang (barat) -> Surabaya (timur) */}
    <circle cx={95} cy={152} r={10} fill="#c0241c" stroke={C.ink} strokeWidth={4} />
    <circle cx={240} cy={148} r={10} fill="#c0241c" stroke={C.ink} strokeWidth={4} />
    <line x1={232} y1={150} x2={112} y2={152} stroke="#c0241c" strokeWidth={6} />
    <path d="M112,152 L132,142 L132,162 Z" fill="#c0241c" />
    <text x={95} y={190} fontFamily={FONT.mono} fontWeight={800} fontSize={20} fill={C.ink} textAnchor="middle">SEMARANG</text>
    <text x={240} y={186} fontFamily={FONT.mono} fontWeight={800} fontSize={20} fill={C.ink} textAnchor="middle">SURABAYA</text>
    <text x={165} y={250} fontFamily={FONT.mono} fontWeight={700} fontSize={20} fill="#6b675f" textAnchor="middle">DIPINDAH KE SEMARANG</text>
  </g>
);

/** Shot 1 (0–182): gudang pagi Senin. Hendra jalan masuk, baca surat mutasi, pill hook. */
const Shot01: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pill = frame < 8 ? 0 : spring({ frame: frame - 8, fps, config: { stiffness: 260, damping: 12 } });
  // Beat 1 (0–60f): jalan masuk kiri -> meja. Beat 2 (60–120f): berhenti, baca surat. Beat 3 (120–182f): menatap kamera, surat di tangan.
  const walking = frame < 60;
  const walkDist = walking ? interpolate(frame, [0, 60], [0, 560]) : 560;
  const x = 60 + walkDist;
  const pose = walking
    ? { ...walk(walkDist / walkCycle(0.9, 0.95), 0.9), headTilt: 0 }
    : { ...STAND, headTilt: frame < 120 ? 0.14 : 0, lean: frame < 120 ? 0.05 : 0.02 };
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 55%">
      <Canvas bg="#f7f1e3">
        <MorningSky />
        {/* papan nama gudang */}
        <rect x={240} y={180} width={600} height={90} fill="#c0241c" stroke={C.ink} strokeWidth={7} />
        <text x={540} y={242} fontFamily={FONT.title} fontSize={52} fill="white" textAnchor="middle">GUDANG SURABAYA</text>
        {/* rak + kardus gudang di kiri */}
        <rect x={60} y={700} width={300} height={24} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={60} y={960} width={300} height={24} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <g transform="translate(150,1400)"><CardboardBox label="GUDANG" scale={0.8} /></g>
        <g transform="translate(320,1400)"><CardboardBox label="BARANG" scale={0.7} /></g>
        <g transform="translate(210,700)"><CardboardBox label="STOK" scale={0.6} /></g>
        {/* meja kerja Hendra + surat mutasi */}
        <rect x={620} y={1180} width={400} height={22} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={640} y={1202} width={360} height={198} fill="#5c4033" />
        <g transform="translate(760,1160)">
          <MutationLetter />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#8a7a5c" />
        <rect x={0} y={1400} width={1080} height={18} fill="#6b5e46" />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={HENDRA}
          pose={pose}
          mood="worried"
          lookAt={frame >= 120 ? 0.5 : 0.9}
          holdF={frame >= 120 ? <MutationLetter /> : undefined}
        />
      </Canvas>
      {/* pill hook */}
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", transform: `scale(${pill})`, opacity: pill }}>
        <span style={{ fontFamily: FONT.title, fontSize: 52, color: "white", background: "#130f0b", padding: "14px 30px", borderRadius: 999, boxShadow: "0 6px 0 rgba(0,0,0,0.4)" }}>
          SENIN PAGI. <span style={{ color: C.capYellow }}>SURAT MUTASI DI MEJA.</span>
        </span>
      </div>
    </Camera>
  );
};

/** Shot 2 (0–166): tracking shot jalan siang. Hendra menyeberang penuh kiri -> kanan, parallax 2 lapis. */
const Shot02: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, dur], [80, 1000], { extrapolateRight: "clamp" });
  const pose = { ...walk((x - 80) / walkCycle(0.9, 0.95), 0.9), headTilt: 0 };
  const lookRight = frame > 120;
  return (
    <Camera dur={dur} move="static">
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
        <Stick x={x} floor={FLOOR} scale={0.95} look={HENDRA} pose={pose} mood="worried" lookAt={lookRight ? 1 : 0.5} />
      </Canvas>
      <KineticText words={["6", "TAHUN", "DI", "SURABAYA"]} at={60} stagger={3} top={420} fontSize={104} accent={["SURABAYA"]} />
    </Camera>
  );
};

/** Shot 3 (0–101): ruang atasan. Hendra masuk kiri, atasan masuk kanan, menunjuk peta Jawa. */
const Shot03: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–36f): keduanya jalan masuk. Beat 2 (36–72f): atasan menunjuk peta. Beat 3 (72–101f): atasan menunjuk Hendra, Hendra menunduk.
  const hendraX = interpolate(frame, [0, 36], [60, 380], { extrapolateRight: "clamp" });
  const bossX = interpolate(frame, [0, 36], [1020, 760], { extrapolateRight: "clamp" });
  const hendraPose: Pose = frame < 36 ? walk((hendraX - 60) / walkCycle(0.9, 0.95), 0.9) : { ...STAND, headTilt: frame >= 72 ? 0.2 : 0.08, lean: frame >= 72 ? -0.04 : 0 };
  const bossPose: Pose = frame < 36
    ? walk((1020 - bossX) / walkCycle(0.9, 1.0), 0.9)
    : { ...STAND, armF: frame >= 72 ? [1.5, 0.15] : [1.25, 0.2], armB: [0.3, 0.1], lean: -0.06, headTilt: -0.05 };
  return (
    <Camera dur={dur} move="push-in" amount={0.04} origin="50% 50%" shake={2}>
      <Canvas bg="#e8e0c8">
        <OfficeBg />
        <JavaMap x={640} y={500} />
        <Stick x={hendraX} floor={FLOOR} scale={0.95} look={HENDRA} pose={hendraPose} mood="worried" lookAt={1} />
        <Stick
          x={bossX}
          floor={FLOOR}
          scale={1.0}
          look={BOSS}
          pose={bossPose}
          mood="determined"
          lookAt={-0.6}
          holdF={frame >= 36 ? <MutationLetter stamp={false} /> : undefined}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 4 (0–146): pertemuan yang sama, lebih dekat. Hendra protes, atasan mengacungkan surat pengunduran diri. */
const Shot04: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const swing = Math.sin(frame * 0.25) * 0.12;
  // Beat 1 (0–36f): Hendra angkat tangan protes. Beat 2 (36–84f): atasan acungkan surat, Hendra mundur. Beat 3 (84–146f): Hendra shocked, atasan menunjuk pintu.
  const hendraX = frame < 84 ? 540 : interpolate(frame, [84, 100], [540, 500], { extrapolateRight: "clamp" });
  const mood = frame < 84 ? "determined" : "shocked";
  const hendraPose: Pose = frame < 36
    ? { ...STAND, armF: [2.3, 0.25], armB: [-0.1, 0.1], lean: 0.06, headTilt: -0.06 }
    : { ...STAND, armF: [0.4, 0.1], armB: [-0.2, 0.1], lean: frame < 84 ? 0.02 : -0.08, headTilt: frame < 84 ? 0 : 0.12 };
  const bossPose: Pose = frame < 84
    ? { ...STAND, armF: [1.1, 0.2], armB: [0.3, 0.1], lean: -0.06, headTilt: -0.05 }
    : { ...STAND, armF: [1.5, 0.15], armB: [0.3, 0.1], lean: -0.08, headTilt: -0.05 };
  return (
    <Camera dur={dur} move="push-in" amount={0.08} origin="50% 45%" shake={2}>
      <Canvas bg="#e8e0c8">
        <JavaMap x={80} y={380} scale={0.85} />
        <rect x={0} y={1400} width={1080} height={520} fill="#6b5e46" />
        <rect x={0} y={1400} width={1080} height={18} fill="#4a3f2e" />
        <Stick x={hendraX} floor={FLOOR} scale={1.0} look={HENDRA} pose={hendraPose} mood={mood} lookAt={1} />
        <Stick
          x={760}
          floor={FLOOR}
          scale={1.05}
          look={BOSS}
          pose={bossPose}
          mood="determined"
          lookAt={-0.7}
          holdF={<ResignPaper swing={swing} />}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 5a (0–72): rumah malam. Hendra duduk murung di sofa, istri berdiri, surat di meja kopi. */
const Shot05a: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Camera dur={72} move="push-in" amount={0.03} origin="50% 50%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        <g transform="translate(700,1230)">
          <MutationLetter />
        </g>
        <Stick x={300} floor={FLOOR} scale={0.95} look={HENDRA} pose={SIT} mood="sad" lookAt={0.9} />
        <Stick x={820} floor={FLOOR} scale={0.95} look={ISTRI} pose={{ ...STAND, headTilt: 0.12, lean: 0.04 }} mood="worried" lookAt={-0.8} />
      </Canvas>
    </Camera>
  );
};

/** Shot 5b (0–72): peron stasiun. Hendra sendiri dengan tas travel, papan "SURABAYA → SEMARANG". */
const Shot05b: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Camera dur={72} move="push-in" amount={0.03} origin="50% 50%">
      <Canvas bg="#1e2436">
        <StationBg />
        {/* papan keberangkatan */}
        <rect x={300} y={340} width={480} height={80} fill="#1d1d1f" stroke={C.ink} strokeWidth={6} />
        <text x={540} y={394} fontFamily={FONT.mono} fontWeight={800} fontSize={36} fill={C.capYellow} textAnchor="middle">SURABAYA → SEMARANG</text>
        <Stick
          x={540}
          floor={FLOOR}
          scale={0.95}
          look={HENDRA}
          pose={CARRY}
          mood="sad"
          lookAt={0.5}
          holdF={<Suitcase />}
          holdB={<DuffelBag />}
        />
      </Canvas>
      <KineticText words={["TINGGAL", "KELUARGA,", "ATAU", "KEHILANGAN", "KERJA?"]} at={12} stagger={3} top={480} fontSize={88} accent={["KEHILANGAN"]} />
    </Camera>
  );
};

/** Shot 5c (0–79): kembali ke rumah. Anak menarik lengan Hendra, bertanya; Hendra tak sanggup menjawab. */
const Shot05c: React.FC = () => {
  const frame = useCurrentFrame();
  const mood = frame < 40 ? "sad" : "resigned";
  return (
    <Camera dur={79} move="push-in" amount={0.06} origin="50% 45%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        <g transform="translate(700,1230)">
          <MutationLetter />
        </g>
        <Stick x={300} floor={FLOOR} scale={0.95} look={HENDRA} pose={SIT} mood={mood} lookAt={0.9} />
        <Stick x={820} floor={FLOOR} scale={0.95} look={ISTRI} pose={{ ...STAND, headTilt: 0.12, lean: 0.04 }} mood="worried" lookAt={-0.8} />
        <Stick
          x={620}
          floor={FLOOR}
          scale={0.6}
          look={ANAK}
          pose={{ ...STAND, armF: [0.9, 0.2], armB: [-0.1, 0.1], lean: 0.05, headTilt: -0.08 }}
          lookAt={-0.9}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 5 (0–223): rumah -> peron -> rumah (cut internal lewat tatapan Hendra). */
const Shot05: React.FC<{ dur: number }> = () => (
  <>
    <Sequence durationInFrames={72}>
      <Shot05a />
    </Sequence>
    <Sequence from={72} durationInFrames={72}>
      <Shot05b />
    </Sequence>
    <Sequence from={144}>
      <Shot05c />
    </Sequence>
  </>
);

/** Shot 6 (0–132): rumah malam. Hendra mengangkat kontrak kerja; big text kinetik per kata. */
const Shot06: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–36f): jalan masuk ke meja. Beat 2 (36–84f): angkat kontrak + big text stagger. Beat 3 (84–132f): menatap big text.
  const walking = frame < 36;
  const x = walking ? interpolate(frame, [0, 36], [80, 420], { extrapolateRight: "clamp" }) : 420;
  const pose: Pose = walking
    ? walk((x - 80) / walkCycle(0.9, 0.95), 0.9)
    : { ...STAND, armF: [1.0, 0.25], armB: [0.2, 0.1], lean: -0.04, headTilt: -0.08 };
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 45%">
      <Canvas bg="#2f2122">
        {/* meja + lampu meja + kontrak kerja */}
        <rect x={180} y={1150} width={720} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={200} y={1176} width={680} height={224} fill="#4a3428" />
        <rect x={780} y={980} width={14} height={170} fill={C.ink} />
        <path d="M787,980 L700,930 L874,930 Z" fill="#ffe9a8" stroke={C.ink} strokeWidth={5} />
        <circle cx={787} cy={975} r={26} fill="#ffe9a8" opacity={0.85} />
        <g transform="translate(560,1090)">
          <ContractFolder big />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#1c130d" />
        <rect x={0} y={1400} width={1080} height={18} fill="#120b06" />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={HENDRA}
          pose={pose}
          mood="determined"
          lookAt={0.5}
          holdF={frame >= 36 ? <ContractFolder /> : undefined}
        />
      </Canvas>
      <KineticText words={["TIDAK", "BISA", "DIUBAH", "SEPIHAK"]} at={36} stagger={3} top={420} fontSize={104} accent={["TIDAK", "SEPIHAK"]} />
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
    <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginTop: 26, transform: `scale(${interpolate(s, [0, 1], [0.9, 1])})`, opacity: s }}>
      <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: "50%", background: "#c0241c", color: "white", fontFamily: FONT.title, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>✓</div>
      <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 33, lineHeight: 1.3, color: C.ink }}>
        {children}
        {big}
      </div>
    </div>
  );
};

/** Shot 7 (0–154): kartu hukum. Kamera STATIS — kartu harus stabil dan terbaca. */
const Shot07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 240, damping: 14 } });
  // Hendra menunjuk item 1-2 (0–48f), lalu 3-4 (48–108f), item 5 tercentang (108f+).
  const pointY = frame < 48 ? 0 : frame < 108 ? 1 : 2;
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      {/* Hendra kiri menunjuk kartu */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <StickDefs />
        <rect x={0} y={1400} width={1080} height={520} fill="#171a26" />
        <Stick
          x={250}
          floor={FLOOR}
          scale={0.95}
          look={HENDRA}
          pose={{ ...STAND, armF: [1.35, 0.12], armB: [-0.15, 0.1], lean: 0.04, headTilt: pointY === 2 ? 0 : -0.04 }}
          mood="determined"
          lookAt={1}
        />
      </svg>
      {/* kartu hukum krem */}
      <div
        style={{
          position: "absolute", left: 400, top: 260, width: 620, background: C.paper, border: `5px solid ${C.ink}`,
          boxShadow: "10px 12px 0 rgba(0,0,0,0.45)", padding: "30px 34px 40px", transform: `scale(${cardIn})`, opacity: cardIn,
        }}
      >
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 40, letterSpacing: 3, color: C.alertRed }}>PASAL 80 AYAT 2</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: "#6b675f", marginTop: 6 }}>UU 27/2026 · PERJANJIAN KERJA</div>
        <div style={{ height: 4, background: C.ink, marginTop: 20, opacity: 0.85 }} />
        <LawItem at={0}>
          Tempat pekerjaan tertulis di kontrak
          <div style={{ fontSize: 26, color: "#6b675f", marginTop: 4 }}>(Pasal 77 ayat 1 huruf d)</div>
        </LawItem>
        <LawItem at={19}>Kontrak tidak dapat diubah sepihak</LawItem>
        <LawItem at={48}>
          Perubahan butuh persetujuan para pihak
          <div style={{ fontSize: 26, color: "#6b675f", marginTop: 4 }}>(Pasal 80 ayat 2)</div>
        </LawItem>
        <LawItem at={77}>Cek kontrakmu: ada klausul penempatan kota lain?</LawItem>
        <LawItem at={108}>
          Pasal 77 ayat 1 huruf d dan Pasal{" "}
          <span style={{ fontFamily: FONT.title, fontSize: 72, color: "#c0241c", lineHeight: 1 }}>80</span> ayat 2
        </LawItem>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8a (0–72): Hendra jalan kembali ke kantor membawa kontrak kerja. */
const Shot08a: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 72], [120, 700], { extrapolateRight: "clamp" });
  return (
    <Camera dur={72} move="push-in" amount={0.03} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <MorningSky />
        <CitySkylineBg variant="day" />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={HENDRA}
          pose={walk((x - 120) / walkCycle(0.9, 0.95), 0.9)}
          mood="hopeful"
          holdF={<ContractFolder />}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 8b (0–144): end card — brand, kalimat penutup, pertanyaan diskusi, handle. */
const Shot08b: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 260, damping: 13 } });
  const line = frame < 30 ? 0 : spring({ frame: frame - 30, fps, config: { stiffness: 260, damping: 13 } });
  const q = frame < 72 ? 0 : spring({ frame: frame - 72, fps, config: { stiffness: 260, damping: 13 } });
  return (
    <AbsoluteFill style={{ background: "#1e2436", alignItems: "center" }}>
      <div style={{ position: "absolute", top: 480, width: "100%", textAlign: "center", transform: `scale(${title})`, opacity: title }}>
        <div style={{ fontFamily: FONT.title, fontSize: 118, color: "white", textShadow: "0 6px 16px rgba(0,0,0,0.8)" }}>CERITA PEKERJA</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: "#c9c4b4", marginTop: 16 }}>SETIAP PEKERJA PUNYA CERITA</div>
      </div>
      <div style={{ position: "absolute", top: 820, width: "100%", textAlign: "center", transform: `scale(${line})`, opacity: line }}>
        <div style={{ fontFamily: FONT.title, fontSize: 76, color: C.capYellow, textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>Kotamu bukan keputusan sepihak.</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", transform: `scale(${q})`, opacity: q, padding: "0 70px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 62, lineHeight: 1.2, color: "white", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
          Pernah dipindah mendadak ke kota lain? Ceritain di komen.
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 44, color: C.capYellow, marginTop: 34 }}>@ceritapekerja_id</div>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8 (0–216): kembali bekerja -> end card. */
const Shot08: React.FC<{ dur: number }> = () => (
  <>
    <Sequence durationInFrames={72}>
      <Shot08a />
    </Sequence>
    <Sequence from={72}>
      <Shot08b />
    </Sequence>
  </>
);

export const EP13: React.FC = () => {
  const caps: CapLine[] = [
    { start: 0, end: 182, words: timedCaptions([["Senin", 0, 580], ["pagi,", 580, 1060], ["Hendra", 1420, 1800], ["baru", 1800, 2060], ["sampai", 2060, 2420], ["di", 2420, 2720], ["kantor.", 2720, 3120], ["Di", 3480, 3640], ["mejanya", 3640, 4100], ["ada", 4100, 4320], ["surat.", 4320, 4720], ["Mulai", 4940, 5240], ["bulan", 5240, 5520], ["depan,", 5520, 5900], ["ia", 6220, 6400], ["dipindah", 6400, 6980], ["ke", 6980, 7120], ["Semarang.", 7120, 7580]], 0), yellow: ["SENIN", "SURAT", "SEMARANG"] },
    { start: 182, end: 348, words: timedCaptions([["Hendra,", 7860, 8360], ["staf", 8600, 8920], ["gudang", 8920, 9320], ["di", 9320, 9480], ["Surabaya,", 9480, 9960], ["enam", 10300, 10580], ["tahun", 10580, 10960], ["bekerja", 10960, 11480], ["di", 11480, 11620], ["sini.", 11620, 11860], ["Istri", 12220, 12620], ["dan", 12620, 12820], ["anaknya", 12820, 13400], ["tinggal", 13400, 13900], ["di", 13900, 14040], ["kota", 14040, 14240], ["ini.", 14240, 14520]], 7600), yellow: ["ENAM", "TAHUN", "SURABAYA"] },
    { start: 348, end: 449, words: timedCaptions([["Atasannya", 14880, 15380], ["bilang,", 15380, 15660], ["keputusan", 16120, 16580], ["sudah", 16580, 16880], ["final.", 16880, 17180], ["Semua", 17680, 18040], ["harus", 18040, 18300], ["ikut.", 18300, 18680]], 14500), yellow: ["FINAL", "HARUS"] },
    { start: 449, end: 595, words: timedCaptions([["Hendra", 18920, 19320], ["menolak,", 19320, 19800], ["tapi", 20020, 20220], ["atasannya", 20220, 20760], ["mengancam.", 20760, 21320], ["Kalau", 21620, 21880], ["tidak", 21880, 22160], ["mau", 22160, 22360], ["pindah,", 22360, 22800], ["anggap", 23200, 23480], ["saja", 23480, 23800], ["mengundurkan", 23800, 24440], ["diri.", 24440, 24780]], 18700), yellow: ["MENOLAK", "MENGANCAM", "MENGUNDURKAN"] },
    { start: 595, end: 818, words: timedCaptions([["Hendra", 25000, 25460], ["pulang.", 25460, 25880], ["Anaknya", 25880, 26620], ["bertanya,", 26620, 27020], ["kenapa", 27460, 27800], ["ayah", 27800, 28120], ["murung?", 28120, 28460], ["Ia", 28800, 29080], ["tak", 29080, 29220], ["sanggup", 29220, 29620], ["menjawab.", 29620, 30100], ["Pindah", 30340, 30720], ["berarti", 30720, 31180], ["meninggalkan", 31180, 31740], ["keluarga", 31740, 32320], ["atau", 32320, 32900], ["kehilangan", 32900, 33420], ["pekerjaan.", 33420, 34100]], 24800), yellow: ["MURUNG", "KELUARGA", "KEHILANGAN"] },
    { start: 818, end: 950, words: timedCaptions([["Undang-Undang", 34420, 35040], ["nomor", 35040, 35320], ["27", 35320, 35720], ["tahun", 35720, 36340], ["2026,", 36340, 37380], ["pasal", 37780, 38080], ["80", 38080, 38460], ["ayat", 38460, 39020], ["2.", 39020, 39220]], 34100), yellow: ["PASAL", "80"] },
    { start: 950, end: 1104, words: timedCaptions([["Perjanjian", 39640, 40100], ["kerja", 40100, 40480], ["tidak", 40480, 40700], ["dapat", 40700, 41020], ["diubah.", 41020, 41460], ["Kecuali", 41720, 42200], ["atas", 42200, 42500], ["persetujuan", 42500, 43100], ["para", 43100, 43340], ["pihak,", 43340, 43700], ["tempat", 43980, 44260], ["pekerjaan", 44260, 44840], ["tertulis", 44840, 45360], ["di", 45360, 45500], ["kontrakmu.", 45500, 46000]], 39600), yellow: ["PERSETUJUAN", "KONTRAKMU"] },
    { start: 1104, end: 1320, words: timedCaptions([["Hendra", 46320, 46740], ["kembali", 46740, 47160], ["keesokan", 47160, 47680], ["harinya.", 47680, 48040], ["Dengan", 48480, 48720], ["kontrak", 48720, 49080], ["kerja", 49080, 49440], ["di", 49440, 49580], ["tangannya,", 49580, 49980], ["Kotamu", 50360, 50580], ["bukan", 50580, 50820], ["keputusan", 50820, 51180], ["sepihak.", 51180, 52260], ["Karena", 52520, 52840], ["setiap", 52840, 53320], ["pekerja", 53320, 53800], ["punya", 53800, 54300], ["cerita.", 54300, 54740]], 46000), yellow: ["KONTRAK", "SEPIHAK", "CERITA"] },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("voice_over_ep13.mp3")} />
      <Sequence durationInFrames={182}>
        <Shot01 dur={182} />
      </Sequence>
      <Sequence from={182} durationInFrames={166}>
        <Shot02 dur={166} />
      </Sequence>
      <Sequence from={348} durationInFrames={101}>
        <Shot03 dur={101} />
      </Sequence>
      <Sequence from={449} durationInFrames={146}>
        <Shot04 dur={146} />
      </Sequence>
      <Sequence from={595} durationInFrames={223}>
        <Shot05 dur={223} />
      </Sequence>
      <Sequence from={818} durationInFrames={132}>
        <Shot06 dur={132} />
      </Sequence>
      <Sequence from={950} durationInFrames={154}>
        <Shot07 />
      </Sequence>
      <Sequence from={1104}>
        <Shot08 dur={216} />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
